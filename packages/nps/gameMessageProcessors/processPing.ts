import { GameMessage } from "rusty-motors-nps";
import type { GameSocketCallback } from "./index.js";

import type { UserStatus } from "rusty-motors-nps";
import { sendNPSAck } from "rusty-motors-nps";
import { getServerLogger } from "rusty-motors-shared";

const log = getServerLogger();

export async function processPing(
	connectionId: string,
	userStatus: UserStatus,
	message: GameMessage,
	socketCallback: GameSocketCallback,
): Promise<void> {
	log.setName("nps:processPing");
	log.info(`Ping: ${message.toString()}`);

	sendNPSAck(socketCallback);
	log.resetName();
	return Promise.resolve();
}
