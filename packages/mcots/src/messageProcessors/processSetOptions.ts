import { SetOptionsMessage } from "rusty-motors-mcots";
import { getServerLogger } from "rusty-motors-shared";
import { ServerPacket } from "rusty-motors-shared-packets";
import type { ServerSocketCallback } from "./index.js";
import { sendSuccess } from "./sendSuccess.js";

const log = getServerLogger({
	name: "processSetOptions",
});

export async function processSetOptions(
	_connectionId: string,
	message: ServerPacket,
	socketCallback: ServerSocketCallback,
) {
	log.info(`Processing SetOptionsMessage`);
	const setOptionsMessage = new SetOptionsMessage().deserialize(
		message.getDataBuffer(),
	);
	log.info(`SetOptionsMessage: ${setOptionsMessage.toString()}`);

	// TODO: Implement the logic for processing the SetOptionsMessage

	sendSuccess(message, socketCallback);

	return Promise.resolve();
}
