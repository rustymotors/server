import { MessageNode } from "rusty-motors-shared";

import type { MessageHandlerArgs, MessageHandlerResult } from "./types.js";
import {
	LoginCompletePayload,
	LoginPayload,
} from "rusty-motors-protocol";
import { getServerLogger } from "rusty-motors-shared";

const defaultLogger = getServerLogger("handlers/login");

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
export async function login({
	connectionId,
	packet,
	log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
	log.debug(
		`[${connectionId}] Received LoginMessage: ${packet.toString()}`,
	);

	const loginMessage = new LoginPayload();
	loginMessage.deserialize(packet.data);
	log.debug(
		`[${connectionId}] Parsed LoginMessage: ${loginMessage.toString()}`,
	);

	const response = new LoginCompletePayload();
	response.setMessageId(213);
	response.serverTime = Math.floor(Date.now() / 1000);
	response.firstTime = true;
	response.clubInvitesWaiting = false;
	response.paycheckWaiting = true;
	response.shardAverageCarsOwned = 3;
	response.shardAveragePlayerLevel = 5;
	response.shardGNP = 830;

	log.debug(
		`[${connectionId}] Sending LoginCompleteMessage: ${response.toString()}`,
	);

	const responsePacket = new MessageNode();
	responsePacket.sequence = packet.sequenceNumber;
	responsePacket.setDataBuffer(response.serialize());
	responsePacket.setPayloadEncryption(true);
	responsePacket.setSignature("TOMC");

	log.debug(`[${connectionId}] Sending response: ${responsePacket.toString()}`);
	log.debug(
		`[${connectionId}] Sending response(hex): ${responsePacket.serialize().toString("hex")}`,
	);

	return { connectionId, messages: [responsePacket] };
}
