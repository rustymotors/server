import { OldServerMessage } from "../../shared/messageFactory.js";
import { GenericReplyMessage } from "./GenericReplyMessage.js";
import { MessageHandlerArgs, MessageHandlerResult } from "./handlers.js";

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
export async function _logout({
	connectionId,
	packet,
	log,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
	// Create new response packet
	const pReply = new GenericReplyMessage();
	pReply.msgNo = 101;
	pReply.msgReply = 106;
	const rPacket = new OldServerMessage();
	rPacket._header.sequence = packet._header.sequence + 1;
	rPacket._header.flags = 8;
	rPacket.setBuffer(pReply.serialize());

	log.debug(`Logout: ${rPacket.toString()}`);

	return { connectionId, messages: [rPacket] };
}
