import { MessageNode } from "rusty-motors-shared";
import { GenericReplyMessage } from "./GenericReplyMessage.js";
import type { MessageHandlerArgs, MessageHandlerResult } from "./types.js";
import { getServerLogger } from "rusty-motors-shared";

const defaultLogger = getServerLogger("handlers/_logout");

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
export async function _logout({
	connectionId,
	packet,
	log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
	log.debug(`[${connectionId}] Logout request: ${packet.toHexString()}`);
	// Create new response packet
	const pReply = new GenericReplyMessage();
	pReply.msgNo = 101;
	pReply.msgReply = 106;
	const rPacket = new MessageNode();
	rPacket.sequence = packet.sequenceNumber + 1;
	rPacket.setPayloadEncryption(true);
	rPacket.setDataBuffer(pReply.serialize());

	log.debug(`[${connectionId}] Logout response: ${rPacket.toHexString()}`);

	return { connectionId, messages: [rPacket] };
}
