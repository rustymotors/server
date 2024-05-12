import { GameMessage } from "../messageStructs/GameMessage.js";
import type { GameSocketCallback } from "./index.js";
import { getDWord } from "../src/utils/pureGet.js";

import { getServerLogger } from "rusty-motors-shared";
import { UserStatus } from "../messageStructs/UserStatus.js";
import { UserStatusManager } from "../src/UserStatusManager.js";
import { sendNPSAck } from "../src/utils/sendNPSAck.js";

const log = getServerLogger();

export async function processSelectPersona(
    connectionId: string,
    userStatus: UserStatus,
    message: GameMessage,
    socketCallback: GameSocketCallback,
): Promise<void> {
    log.setName("nps:processSelectPersona");

    log.info(`SelectPersona: ${message.toString()}`);

    const customerId = getDWord(message.getDataAsBuffer(), 0, false);

    const personaId = getDWord(message.getDataAsBuffer(), 4, false);

    const shardId = getDWord(message.getDataAsBuffer(), 8, false);

    // Log the values
    log.info(`Customer ID: ${customerId}`);
    log.info(`Persona ID: ${personaId}`);
    log.info(`Shard ID: ${shardId}`);

    // Lookup the session
    const existingStatus = UserStatusManager.getUserStatus(customerId);

    if (!existingStatus) {
        log.error(`UserStatus not found for customer ID ${customerId}`);
        throw new Error(`UserStatus not found for customer ID ${customerId}`);
    }

        log.info(
            `Setting persona ID to ${personaId} for ${existingStatus.getCustomerId()}`,
        );

    // Update the user status
    existingStatus.setPersonaId(personaId);

    log.info(`GameLogin: ${message.toString()}`);

    sendNPSAck(socketCallback);
    log.resetName();
    return Promise.resolve();
}
