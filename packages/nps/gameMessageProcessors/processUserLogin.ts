import {
    GameMessage,
    UserInfo,
    getDWord,
    getLenString,
} from 'rusty-motors-nps';
import type { GameSocketCallback } from './index.js';

import type { UserStatus } from 'rusty-motors-nps';
import { UserStatusManager, getCustomerId } from 'rusty-motors-nps';
import { getServerLogger } from 'rusty-motors-shared';

const log = getServerLogger();

export async function processUserLogin(
    connectionId: string,
    userStatus: UserStatus,
    message: GameMessage,
    socketCallback: GameSocketCallback
): Promise<void> {
    log.setName('nps:processUserLogin');

    log.info(`UserLogin: ${message.toString()}`);

    // This message is a BareMessageV0

    const personaId = getDWord(message.getDataAsBuffer(), 0, false);

    const profileName = getLenString(message.getDataAsBuffer(), 4, false);

    // Lookup customerID from personaID
    const customerID = getCustomerId(personaId);

    if (customerID === -1) {
        log.error(`CustomerID not found for personaID: ${personaId}`);
        throw new Error(`CustomerID not found for personaID: ${personaId}`);
    }

    log.info(`LobbyLogin: ${personaId} ${profileName} ${customerID}`);

    const existingStatus = UserStatusManager.getUserStatus(customerID);

    if (typeof existingStatus === 'undefined') {
        log.error(`UserStatus not found for customerID: ${customerID}`);
        throw new Error(`UserStatus not found for customerID: ${customerID}`);
    }

    // Update the user status
    existingStatus.setPersonaId(personaId);

    userStatus = existingStatus;

    log.info(`LobbyLogin: ${message.toString()}`);

    const response = new UserInfo(personaId, profileName);

    log.info(`Sending response: ${response.toString()}`);

    const responseMessage = new GameMessage(0);
    responseMessage.header.setId(0x120);

    responseMessage.setData(response);

    log.info(`Response message: ${responseMessage.toString()}`);

    const responseBytes = responseMessage.serialize();

    socketCallback([responseBytes]);

    log.resetName();
    return Promise.resolve();
}
