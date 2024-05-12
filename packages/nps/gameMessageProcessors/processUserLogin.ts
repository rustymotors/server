import type { GameSocketCallback } from "./index.js";
import { getDWord, getLenString  } from "../src/utils/pureGet.js";
import { GameMessage } from "../messageStructs/GameMessage.js";
import { UserInfo } from "../messageStructs/UserInfo.js";

import { getServerLogger } from "rusty-motors-shared";
import type { UserStatus } from "../messageStructs/UserStatus.js";
import { UserStatusManager } from "../src/UserStatusManager.js";
import { getCustomerId } from "../services/profile.js";

const log = getServerLogger();

export async function processUserLogin(
    connectionId: string,
    userStatus: UserStatus,
    message: GameMessage,
    socketCallback: GameSocketCallback,
): Promise<void> {
    log.setName("nps:processUserLogin");

    log.info(`UserLogin: ${message.toString()}`);

    // This message is a BareMessageV0

    const personaId = getDWord(message.getDataAsBuffer(), 0, false);

    const profileName = getLenString(message.getDataAsBuffer(), 4, false);


    // Lookup customerID from personaID
    const customerID = getCustomerId(personaId);

    if( customerID === -1 ) {
        log.error(`CustomerID not found for personaID: ${personaId}`);
        throw new Error(`CustomerID not found for personaID: ${personaId}`);
    }

    log.info(`LobbyLogin: ${personaId} ${profileName} ${customerID}`);

    const existingStatus = UserStatusManager.getUserStatus(customerID)

    if (typeof existingStatus === "undefined") {
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
