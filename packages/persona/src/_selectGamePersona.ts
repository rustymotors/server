import { SerializedBufferOld } from 'rusty-motors-shared';
import { LegacyMessage } from 'rusty-motors-shared';
import { getServerLogger, ServerLogger } from 'rusty-motors-logger';

const defaultLogger = getServerLogger('PersonaServer');

/**
 * Handles the selection of a game persona and prepares a response indicating the persona is in use.
 *
 * Constructs a fixed-size response packet with a success code and returns it as a serialized message for the specified connection.
 *
 * @param connectionId - The identifier for the client connection.
 * @param message - The incoming {@link LegacyMessage} request.
 * @returns An object containing the {@link connectionId} and an array with the serialized response message.
 */

export async function _selectGamePersona({
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
    log.debug('_npsSelectGamePersona...');
    const requestPacket = message;
    log.debug(
        `LegacyMsg request object from _npsSelectGamePersona ${requestPacket
            ._doSerialize()
            .toString('hex')}`,
    );

    // Create the packet content
    const packetContent = Buffer.alloc(251);

    // Build the packet
    // Response Code
    // 207 = success
    const responsePacket = new LegacyMessage();
    responsePacket._header.id = 519;
    responsePacket.setBuffer(packetContent);
    log.debug(
        `LegacyMsg response object from _npsSelectGamePersona ${responsePacket
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
