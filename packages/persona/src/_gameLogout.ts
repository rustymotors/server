import { SerializedBufferOld } from 'rusty-motors-shared';
import { LegacyMessage } from 'rusty-motors-shared';
import { getServerLogger, ServerLogger } from 'rusty-motors-logger';

/**
 * Processes a game logout request and returns a serialized logout response message.
 *
 * @param connectionId - The identifier for the client connection.
 * @param message - The incoming logout request message.
 * @returns An object containing the {@link connectionId} and an array with the serialized logout response message.
 */

export async function _gameLogout({
    connectionId,
    message,
    log = getServerLogger('persona._gameLogout'),
}: {
    connectionId: string;
    message: LegacyMessage;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: SerializedBufferOld[];
}> {
    const requestPacket = message;
    log.debug(
        `[${connectionId}] _npsLogoutGameUser request: ${requestPacket.toHexString()}`,
    );

    // Build the packet
    const responsePacket = new LegacyMessage();
    responsePacket._header.id = 519;
    log.debug(
        `[${connectionId}] _npsLogoutGameUser response: ${responsePacket.toHexString()}`,
    );

    const outboundMessage = new SerializedBufferOld();
    outboundMessage._doDeserialize(responsePacket._doSerialize());

    return {
        connectionId,
        messages: [outboundMessage],
    };
}
