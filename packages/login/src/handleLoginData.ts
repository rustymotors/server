import { NPSMessage } from 'rusty-motors-shared';
import { getMessageHandlerOrFallback } from './internal.js';
import { getServerLogger, ServerLogger } from 'rusty-motors-logger';
import { GamePacket } from 'rusty-motors-shared-packets';
import { BytableMessage } from '@rustymotors/binary';

const defaultLogger = getServerLogger('LoginServer');

/**
 * Processes an incoming login data message by deserializing it and invoking the appropriate handler.
 *
 * @param connectionId - Unique identifier for the connection.
 * @param message - The serialized login data message to process.
 * @returns An object containing the connection ID and an array of resulting {@link GamePacket} messages.
 *
 * @throws {Error} If an error occurs during message handling or processing.
 */
export async function handleLoginData({
    connectionId,
    message,
    log = defaultLogger,
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: GamePacket[];
}> {
    log.debug(`[${connectionId}] Entering handleLoginData`);

    // The packet needs to be an NPSMessage
    const inboundMessage = new NPSMessage();
    inboundMessage.deserialize(message.serialize());
    let messageHandler;

    messageHandler = getMessageHandlerOrFallback(message.header.messageId);

    try {
        const result = await messageHandler({
            connectionId,
            message,
            log,
        });
        log.debug(
            `[${connectionId}] Leaving handleLoginData with ${result.messages.length} messages`,
        );
        return {
            connectionId,
            messages: result.messages,
        };
    } catch (error) {
        const err = Error(`[${connectionId}] Error in login service`, {
            cause: error,
        });
        throw err;
    }
}
