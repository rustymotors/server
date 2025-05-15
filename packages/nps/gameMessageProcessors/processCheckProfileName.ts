import { GameMessage } from '../messageStructs/GameMessage.js';
import { getLenString } from '../src/utils/pureGet.js';
import type { GameSocketCallback } from './index.js';

import type { UserStatus } from '../messageStructs/UserStatus.js';
import { getServerLogger } from 'rusty-motors-logger';

const defaultLogger = getServerLogger('nps.processCheckProfileName');

/**
 * Handles a profile name check request by extracting the requested persona name and customer ID from the incoming message, then sends a response message via the provided callback.
 *
 * @param message - The incoming game message containing the profile name check request.
 * @param socketCallback - Callback function to send the response message.
 */
export async function processCheckProfileName(
    _connectionId: string,
    _userStatus: UserStatus,
    message: GameMessage,
    socketCallback: GameSocketCallback,
): Promise<void> {
    defaultLogger.info('processCheckProfileName called');
    const customerId = message.serialize().readUInt32BE(8);

    const requestedPersonaName = getLenString(message.serialize(), 12, false);

    defaultLogger.info(
        `Requested persona name: ${requestedPersonaName} for customer ${customerId}`,
    );

    const response = new GameMessage(0);
    response.header.setId(0x601);

    const responseBytes = response.serialize();

    socketCallback([responseBytes]);
    return Promise.resolve();
}
