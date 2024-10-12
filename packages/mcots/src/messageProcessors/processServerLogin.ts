import { getServerLogger } from "rusty-motors-shared";
import { ServerPacket } from "rusty-motors-shared-packets";
import type { ServerSocketCallback } from "./index.js";
import { LoginMessage } from "../payloads/LoginMessage.js";
import { LoginCompleteMessage } from "../payloads/LoginCompleteMessage.js";

const log = getServerLogger({
	name: "processServerLogin",
});

export async function processServerLogin(
	_connectionId: string,
	message: ServerPacket,
	socketCallback: ServerSocketCallback,
): Promise<void> {
	// Read the inbound packet
	const loginMessage = new LoginMessage(message.getDataBuffer().length);
	loginMessage.deserialize(message.getDataBuffer());
	log.debug(`Received LoginMessage: ${loginMessage.toString()}`);

	// Create new response packet
	const response = new LoginCompleteMessage();
	response.setMessageId(213);
	response.setServerTime(Math.floor(Date.now() / 1000));
	response.setFirstTime(true);

	log.debug(`Sending LoginCompleteMessage: ${response.toString()}`);

	// Send response packet
	const responsePacket = new ServerPacket();
	responsePacket.setMessageId(response.getMessageId());
	responsePacket.setDataBuffer(response.serialize());
	responsePacket.setSequence(message.sequence);

	socketCallback([responsePacket]);
	return Promise.resolve();
}
