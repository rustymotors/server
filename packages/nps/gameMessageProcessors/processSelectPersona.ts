import { GameMessage, getDWord } from "rusty-motors-nps";
import type { GameSocketCallback } from "./index.js";

import { UserStatus, UserStatusManager, sendNPSAck } from "rusty-motors-nps";
import { getServerLogger } from "rusty-motors-shared";

const log = getServerLogger({
	name: "nps:processSelectPersona",
});

export async function processSelectPersona(
	_connectionId: string,
	_userStatus: UserStatus,
	message: GameMessage,
	socketCallback: GameSocketCallback,
): Promise<void> {
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
	return Promise.resolve();
}
