import { databaseService,  } from 'rusty-motors-database';
import { getServerConfiguration, NetworkMessage } from 'rusty-motors-shared';
import { NPSUserStatus } from './NPSUserStatus.js';
import { getServerLogger, ServerLogger } from 'rusty-motors-logger';
import { GamePacket } from 'rusty-motors-shared-packets';
import { BytableMessage } from '@rustymotors/binary';

/**
 * Processes a user login packet, validates the user, updates the session key, and returns the login response messages.
 *
 * Attempts to locate the user record by context ID, updates the session key in the database, and constructs the outbound login response. Returns an object containing the connection ID and two identical login response messages.
 *
 * @param connectionId - Identifier for the connection.
 * @param message - The incoming login message packet.
 * @returns An object containing the {@link connectionId} and an array of two identical login response messages.
 *
 * @throws {Error} If the user record cannot be found for the provided context ID.
 * @throws {Error} If updating the session key in the database fails.
 */
export async function login({
    connectionId,
    message,
    log = getServerLogger('LoginServer'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: GamePacket[];
}> {
    const data = message.serialize();

    log.debug(`[${connectionId}] Entering login`);

    log.debug(`[${connectionId}] Creating NPSUserStatus object`);
    const userStatus = new NPSUserStatus(data, getServerConfiguration(), log);
    log.debug(`[${connectionId}] NPSUserStatus object created`);

    log.debug(`[${connectionId}] Extracting session key from packet`);
    userStatus.extractSessionKeyFromPacket(data);
    log.debug(`[${connectionId}] Session key extracted`);

    const { contextId, sessionKey } = userStatus;

    log.debug(`[${connectionId}] Context ID: ${contextId}`);
    userStatus.dumpPacket();

    // Load the customer record by contextId
    const userRecord = databaseService.findSessionByContext(contextId);

    if (typeof userRecord === 'undefined') {
        // We were not able to locate the user's record
        throw Error(
            `[${connectionId}] Unable to locate user record for contextId: ${contextId}`,
        );
    }

    // Save sessionkey in database under customerId
    await databaseService
        .updateSessionKey(
            userRecord.customerId,
            sessionKey ?? '',
            contextId,
            connectionId,
        )
        .catch((error) => {
            const err = Error(
                `[${connectionId}] Error updating session key in the database`,
                { cause: error },
            );
            throw err;
        });

    log.debug(`[${connectionId}] Creating outbound message`);

    const outboundMessage = new NetworkMessage(0x601);

    const dataBuffer = Buffer.alloc(26);
    let offset = 0;
    dataBuffer.writeInt32BE(userRecord.customerId, offset);
    offset += 4;
    dataBuffer.writeInt32BE(userRecord.profileId, offset);
    offset += 4;
    dataBuffer.writeInt8(0, offset); // isCacheHit
    offset += 1;
    dataBuffer.writeInt8(0, offset); // ban
    offset += 1;
    dataBuffer.writeInt8(0, offset); // gag
    offset += 1;
    dataBuffer.write(sessionKey ?? '', offset, 12, 'ascii');

    const packetContent = dataBuffer;

    // Set the packet content in the outbound message
    outboundMessage.data = packetContent;

    log.debug(
        `[${connectionId}] Outbound message: ${outboundMessage.toHexString()}`,
    );

    const outboundMessage2 = new GamePacket();
    outboundMessage2.deserialize(outboundMessage.serialize());

    log.debug(
        `[${connectionId}] Outbound message2: ${outboundMessage2.toHexString()}`,
    );

    // Update the data buffer
    const response = {
        connectionId,
        messages: [outboundMessage2, outboundMessage2],
    };
    log.debug(
        `[${connectionId}] Leaving login with ${response.messages.length} messages`,
    );
    return response;
}
