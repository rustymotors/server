import {
    LegacyMessage,
    NPSMessage,
    SerializedBufferOld,
} from 'rusty-motors-shared';
import { createGameProfile } from 'rusty-motors-nps';
import { getPersonasByPersonaId } from '../getPersonasByPersonaId.js';
import { personaToString } from '../internal.js';

import { getServerLogger, ServerLogger } from 'rusty-motors-logger';

const defaultLogger = getServerLogger('PersonaServer');

/**
 * Processes a legacy message to retrieve persona information and returns a serialized response.
 *
 * Deserializes the incoming {@link message}, extracts the persona ID, fetches the corresponding persona, and constructs a response containing the persona's profile information. The response is serialized and returned as an outbound message.
 *
 * @param connectionId - The identifier for the client connection.
 * @param message - The incoming legacy message containing the persona request.
 * @returns An object with the original {@link connectionId} and an array containing the serialized response message.
 *
 * @throws {Error} If no persona is found for the extracted persona ID.
 */
export async function getPersonaInfo({
    connectionId,
    message,
    log = defaultLogger,
}: {
    connectionId: string;
    message: LegacyMessage;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: SerializedBufferOld[];
}> {
    log.debug('getPersonaInfo...');
    const requestPacket = new NPSMessage();
    requestPacket.deserialize(message.serialize());

    log.debug(
        `LegacyMsg request object from getPersonaInfo ${requestPacket.toString()}`,
    );

    const personaId = requestPacket.data.readUInt32BE(0);

    log.debug(`personaId: ${personaId}`);

    const persona = await getPersonasByPersonaId({
        personaId,
    });

    if (!persona[0]) {
        throw new Error(`Persona not found for personaId: ${personaId}`);
    }

    log.debug(`Persona found: ${personaToString(persona[0])}`);

    const profile = createGameProfile();

    profile.customerId = persona[0]!.customerId;
    profile.profileId = persona[0]!.personaId;
    profile.profileName = persona[0]!.personaName;

    // Build the packet
    // Response Code
    // 0x607 = Game Persona Info
    const responsePacket = new LegacyMessage();
    responsePacket._header.id = 0x607;
    responsePacket.setBuffer(profile.serialize());
    log.debug(
        `LegacyMsg response object from getPersonaInfo ${responsePacket
            ._doSerialize()
            .toString('hex')} `,
    );

    const outboundMessage = new SerializedBufferOld();
    outboundMessage.setBuffer(responsePacket._doSerialize());

    return {
        connectionId,
        messages: [outboundMessage],
    };
}
