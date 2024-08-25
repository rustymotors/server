import { getServerLogger } from "rusty-motors-shared";
import { GameMessage } from "../messageStructs/GameMessage.js";
import type { UserStatus } from "../messageStructs/UserStatus.js";
import { getLenString } from "../src/utils/pureGet.js";
import { sendNPSAck } from "../src/utils/sendNPSAck.js";
import type { GameSocketCallback } from "./index.js";

const log = getServerLogger({});

export async function processCheckPlateText(
	connectionId: string,
	userStatus: UserStatus,
	message: GameMessage,
	socketCallback: GameSocketCallback,
): Promise<void> {
	log.info("processCheckPlateText called");
	const plateType = message.getDataAsBuffer().readUInt32BE(0);

	const requestedPlateText = getLenString(message.getDataAsBuffer(), 4, false);

	log.info(
		`Requested plate text: ${requestedPlateText} for plate type ${plateType}`,
	);

	sendNPSAck(socketCallback);
	return Promise.resolve();
}
