import { OldServerMessage } from 'rusty-motors-shared';
import { GameUrl, GameUrlsMessage } from './GameUrlsMessage.js';
import { GenericRequestMessage } from './GenericRequestMessage.js';
import type { MessageHandlerArgs, MessageHandlerResult } from './handlers.js';
import { getServerLogger } from 'rusty-motors-logger';

const defaultLogger = getServerLogger('handlers/_getGameUrls');

/**
 * Handles a request to retrieve available game URLs and returns a response containing the URLs.
 *
 * Receives a request message, deserializes it, constructs a response with a predefined game URL, and returns the response packet.
 *
 * @returns An object containing the {@link connectionId} and an array of response packets with the game URLs.
 */
export async function _getGameUrls({
    connectionId,
    packet,
    log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const getGameUrlsMessage = new GenericRequestMessage();
    getGameUrlsMessage.deserialize(packet.data);

    log.debug(`Received Message: ${getGameUrlsMessage.toString()}`);

    const gameUrlsMessage = new GameUrlsMessage();
    gameUrlsMessage._msgNo = 364;

    const url1 = new GameUrl();
    url1._urlId = 1;
    url1.urlRef = 'http://localhost:8080';
    gameUrlsMessage.addURL(url1);

    const responsePacket = new OldServerMessage();
    responsePacket._header.sequence = packet.sequenceNumber;
    responsePacket._header.flags = 8;

    responsePacket.setBuffer(gameUrlsMessage.serialize());

    return { connectionId, messages: [responsePacket] };
}
