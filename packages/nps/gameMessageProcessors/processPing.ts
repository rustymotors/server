import { GameMessage } from 'rusty-motors-nps';
import type { GameSocketCallback } from './index.js';

import type { UserStatus } from 'rusty-motors-nps';
import { sendNPSAck } from 'rusty-motors-nps';
import { getServerLogger } from 'rusty-motors-logger';

const defaultLogger = getServerLogger('nps.processPing');

/**
 * Handles an incoming ping message by logging it and sending an acknowledgment response.
 *
 * @param message - The received ping {@link GameMessage}.
 * @param socketCallback - Callback used to send the acknowledgment.
 */
export async function processPing(
    _connectionId: string,
    _userStatus: UserStatus,
    message: GameMessage,
    socketCallback: GameSocketCallback,
): Promise<void> {
    defaultLogger.info(`Ping: ${message.toString()}`);

    sendNPSAck(socketCallback);
    return Promise.resolve();
}
