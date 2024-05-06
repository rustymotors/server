import { GameMessage } from "../messageStructs/GameMessage.js";
import type { SocketCallback } from "./index.js";
import { getDWord } from "../utils/pureGet.js";

import { getServerLogger } from "../../shared";
import { UserStatus } from "../messageStructs/UserStatus.js";
import { UserStatusManager } from "../src/UserStatusManager.js";

const log = getServerLogger();

export async function processSelectPersona(
    connectionId: string,
    userStatus: UserStatus,
    message: GameMessage,
    socketCallback: SocketCallback,
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

    const response = new GameMessage(0);
    response.header.setId(0x207);

    const responseBytes = response.serialize();

    socketCallback([responseBytes]);
    log.resetName();
    return Promise.resolve();
}
