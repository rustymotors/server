import { SerializedBufferOld, LegacyMessage } from 'rusty-motors-shared';
import type { BufferSerializer } from 'rusty-motors-shared-packets';
import { messageHandlers } from './internal';
import { getServerLogger, ServerLogger } from 'rusty-motors-logger';

/**
 * Processes an incoming persona data message and dispatches it to the appropriate handler based on its opcode.
 *
 * Attempts to deserialize the incoming message, locate a matching handler, and invoke it asynchronously. Returns the handler's result, including the connection ID and any response messages.
 *
 * @param connectionId - Identifier for the connection associated with the incoming message.
 * @param message - The serialized persona data message to process.
 * @param log - Optional logger instance; defaults to a logger named "PersonaServer/receivePersonaData".
 * @returns An object containing the original {@link connectionId} and an array of response messages.
 *
 * @throws {Error} If the message opcode is unsupported or if an error occurs during message handling.
 */

export async function receivePersonaData({
    connectionId,
    message,
    log = getServerLogger('PersonaServer/receivePersonaData'),
}: {
    connectionId: string;
    message: BufferSerializer;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: SerializedBufferOld[];
}> {
    const data = message.serialize();
    log.debug(`[${connectionId}] Entering receivePersonaData`);
    log.debug(
        `[${connectionId}] Received persona data: ${data.toString('hex')}`,
    );

    // The packet needs to be an NPSMessage
    const inboundMessage = new LegacyMessage();
    inboundMessage._doDeserialize(message.serialize());

    const supportedHandler = messageHandlers.find((h) => {
        return h.opCode === inboundMessage._header.id;
    });

    if (typeof supportedHandler === 'undefined') {
        // We do not yet support this message code
        throw Error(
            `[${connectionId}] UNSUPPORTED_MESSAGECODE: ${inboundMessage._header.id}`,
        );
    }

    try {
        const result = await supportedHandler.handler({
            connectionId,
            message: inboundMessage,
            log,
        });
        log.debug(
            `[${connectionId}] Returning with ${result.messages.length} messages`,
        );
        return result;
    } catch (error) {
        const err = Error(`[${connectionId}] Error handling persona data`, {
            cause: error,
        });
        throw err;
    }
}
