import {
    fetchStateFromDatabase,
    findSessionByConnectionId,
} from 'rusty-motors-shared';
import { OldServerMessage } from 'rusty-motors-shared';
import { GenericRequestMessage } from './GenericRequestMessage.js';
import { PartsAssemblyMessage } from './PartsAssemblyMessage.js';
import type { MessageHandlerArgs, MessageHandlerResult } from './handlers.js';
import { getServerLogger } from 'rusty-motors-logger';

const defaultLogger = getServerLogger('handlers/_getOwnedParts');

/**
 * Handles a request to retrieve the owned parts for a game session and returns the corresponding response message.
 *
 * @param connectionId - The identifier for the client connection.
 * @param packet - The incoming message packet containing the request.
 * @returns An object containing the connection ID and an array with the response packet.
 *
 * @throws {Error} If no session is found for the provided {@link connectionId}.
 */
export async function _getOwnedParts({
    connectionId,
    packet,
    log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const getOwnedPartsMessage = new GenericRequestMessage();
    getOwnedPartsMessage.deserialize(packet.data);

    log.debug(`Received Message: ${getOwnedPartsMessage.toString()}`);

    const state = fetchStateFromDatabase();

    const session = findSessionByConnectionId(state, connectionId);

    if (!session) {
        throw Error('Session not found');
    }

    const ownedPartsMessage = new PartsAssemblyMessage(session.gameId);
    ownedPartsMessage._msgNo = 175;

    const responsePacket = new OldServerMessage();
    responsePacket._header.sequence = packet.sequenceNumber;
    responsePacket._header.flags = 8;

    responsePacket.setBuffer(ownedPartsMessage.serialize());

    return { connectionId, messages: [responsePacket] };
}
