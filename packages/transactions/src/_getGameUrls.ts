import { MessageNode } from "rusty-motors-shared";
import { GameUrl, GameUrlsMessage } from "./GameUrlsMessage.js";
import { GenericRequestMessage } from "./GenericRequestMessage.js";
import type { MessageHandlerArgs, MessageHandlerResult } from "./handlers.js";
import { getServerLogger } from "rusty-motors-shared";

const defaultLogger = getServerLogger("handlers/_getGameUrls");

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
export async function _getGameUrls({
	connectionId,
	packet,
	log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
	const getGameUrlsMessage = new GenericRequestMessage();
	getGameUrlsMessage.deserialize(packet.data);

	log.debug(`Received Message: ${getGameUrlsMessage.toString()}`);

	const gameUrlsMessage = new GameUrlsMessage();
	gameUrlsMessage._msgNo = 364;

	
	for (let i = 0; i < 67; i++) {
		const url = new GameUrl();
		url._urlId = i;
		url.urlRef = `http://rusty-motors.com/urls?id=${i}`;
		gameUrlsMessage.addURL(url);
	}

	log.debug(gameUrlsMessage.toString())
	

	const responsePacket = new MessageNode();
	responsePacket.sequence = packet.sequenceNumber;
	responsePacket.setPayloadEncryption(true);

	responsePacket.setDataBuffer(gameUrlsMessage.serialize());

	return { connectionId, messages: [responsePacket] };
}
