import { getPersonasByPersonaId } from 'rusty-motors-personas';
import { type ServiceArgs } from 'rusty-motors-shared';
import { LoginInfoMessage } from '../LoginInfoMessage.js';

import {
    createCommandEncryptionPair,
    createDataEncryptionPair,
} from 'rusty-motors-gateway';
import {
    McosEncryption,
    addEncryption,
    fetchStateFromDatabase,
    getEncryption,
} from 'rusty-motors-shared';
import { SerializedBufferOld } from 'rusty-motors-shared';
import { UserInfoMessage } from '../UserInfoMessage.js';
import { databaseManager } from 'rusty-motors-database';
import { getServerLogger } from 'rusty-motors-logger';

/**
 * Converts a buffer to an uppercase hexadecimal string with zero-padded bytes.
 *
 * Each byte in {@link data} is represented as a two-character uppercase hex value.
 *
 * @param data - The buffer to convert.
 * @returns The zero-padded uppercase hexadecimal string representation of {@link data}.
 */
export function toHex(data: Buffer): string {
    /** @type {string[]} */
    const bytes: string[] = [];
    data.forEach((b: number) => {
        bytes.push(b.toString(16).toUpperCase().padStart(2, '0'));
    });
    return bytes.join('');
}

/**
 * Processes a game server connection request, handling persona lookup, encryption key management, and response message generation.
 *
 * Attempts to retrieve the user's persona and associated session keys, initializes encryption for the connection if necessary, and returns a serialized response message for the client.
 *
 * @param args - The service arguments containing the connection ID, inbound message, and optional logger.
 * @returns An object with the connection ID and an array containing the serialized response message.
 *
 * @throws {Error} If no personas are found for the user or if session keys cannot be retrieved or encryption cannot be created.
 */
export async function _npsRequestGameConnectServer({
    connectionId,
    message,
    log = getServerLogger('handlers/_npsRequestGameConnectServer'),
}: ServiceArgs): Promise<{
    connectionId: string;
    messages: SerializedBufferOld[];
}> {
    // This is a NPS_LoginInfo packet
    // As a legacy packet, it used the old NPSMessage format
    // of a 4 byte header, followed by a 4 byte length, followed
    // by the data payload.

    const inboundMessage = new LoginInfoMessage();
    inboundMessage.deserialize(message.data);

    log.debug(`LoginInfoMessage: ${inboundMessage.toString()}`);

    const personas = await getPersonasByPersonaId({
        personaId: inboundMessage._userId,
    });
    if (typeof personas[0] === 'undefined') {
        const err = Error('No personas found.');
        throw err;
    }

    const { customerId } = personas[0];

    const state = fetchStateFromDatabase();

    const existingEncryption = getEncryption(state, connectionId);

    if (!existingEncryption) {
        // Set the encryption keys on the lobby connection
        const keys =
            await databaseManager.fetchSessionKeyByCustomerId(customerId);

        if (keys === undefined) {
            throw Error('Error fetching session keys!');
        }

        // We have the session keys, set them on the connection
        try {
            const newCommandEncryptionPair = createCommandEncryptionPair(
                keys.sessionKey,
            );

            const newDataEncryptionPair = createDataEncryptionPair(
                keys.sessionKey,
            );

            const newEncryption = new McosEncryption({
                connectionId,
                commandEncryptionPair: newCommandEncryptionPair,
                dataEncryptionPair: newDataEncryptionPair,
            });

            addEncryption(state, newEncryption).save();
        } catch (error) {
            const err = Error("Error creating encryption");
            err.cause = error;
            throw err;
        }
    }

    // We have a session, we are good to go!
    // Send the response packet

    const responsePacket = new UserInfoMessage();
    responsePacket.fromLoginInfoMessage(inboundMessage);

    responsePacket._header.id = 0x120;

    // log the packet
    log.debug(
        `!!! outbound lobby login response packet: ${responsePacket.toString()}`,
    );

    const outboundMessage = new SerializedBufferOld();
    outboundMessage._doDeserialize(responsePacket.serialize());

    return {
        connectionId,
        messages: [outboundMessage],
    };
}
