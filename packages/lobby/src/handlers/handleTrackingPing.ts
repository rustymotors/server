import { SerializedBufferOld } from 'rusty-motors-shared';
import { getServerLogger, ServerLogger } from 'rusty-motors-logger';

const defaultLogger = getServerLogger('Lobby');

/**
 * Processes a tracking ping message and returns an empty response.
 *
 * @param connectionId - The identifier for the client connection.
 * @param message - The tracking ping message received.
 * @returns An object containing the original {@link connectionId} and an empty array of messages.
 */
export async function handleTrackingPing({
    connectionId,
    message,
    log = defaultLogger,
}: {
    connectionId: string;
    message: SerializedBufferOld;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: SerializedBufferOld[];
}> {
    log.debug('Handling NPS_TRACKING_PING');
    log.debug(`Received command: ${message.toString()}`);

    log.debug('Skipping response');

    return {
        connectionId,
        messages: [],
    };
}
