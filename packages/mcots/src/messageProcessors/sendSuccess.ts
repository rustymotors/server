import { GenericReplyPayload, ServerPacket } from "rusty-motors-shared-packets";
import type { ServerSocketCallback } from "./index.js";

export function sendSuccess(
	message: ServerPacket,
	socketCallback: ServerSocketCallback,
) {
	const pReply = new GenericReplyPayload();
	pReply.setMessageId(101);
	pReply.msgReply = 438;

	const response = new ServerPacket();
	response.setMessageId(101);
	response.setDataBuffer(pReply.serialize());
	response.setSequence(message.sequence);

	socketCallback([response]);
}
