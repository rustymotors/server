import type { ServerLogger } from "rusty-motors-shared";
import { LegacyMessage } from "rusty-motors-shared";
import { MiniUserInfo } from "../UserInfoMessage.js";
import { getServerLogger } from "rusty-motors-shared";
import { BytableMessage } from "@rustymotors/binary";


export async function handleGetMiniUserList({
	connectionId,
	message,
	log = getServerLogger("lobby.handleGetMiniUserList"),
}: {
	connectionId: string;
	message: BytableMessage;
	log?: ServerLogger;
}): Promise<{
	connectionId: string;
	messages: BytableMessage[];
}> {
	try {
		log.debug(`[${connectionId}] Handling NPS_GET_MINI_USER_LIST`);

		const requestedCommId = message.getBody().readUInt32BE(0);

		log.debug(`[${connectionId}] Requested commId: ${requestedCommId}`);

		const commId = 1;
		const userCount = 2;

		const channelCountRecord = Buffer.alloc(8);
		channelCountRecord.writeUInt32BE(commId, 0); // commId
		channelCountRecord.writeUInt32BE(userCount, 4); // userCount

		const user1 = new MiniUserInfo();
		user1.setFieldValueByName("userId", 21);
		user1.setFieldValueByName("userName", "Dr Brown");

		log.debug(`[${connectionId}] User1: ${user1.toString()}`);

		const user2 = new MiniUserInfo();
		user2.setFieldValueByName("userId", 88);
		user2.setFieldValueByName("userName", "Marty");		

		log.debug(`[${connectionId}] User2: ${user2.toString()}`);

		const realData = Buffer.concat([
			channelCountRecord,
			user1.serialize(),
			user2.serialize(),
		]);

		const align8Padding = 8 - (realData.length % 8);

		const padding = Buffer.alloc(align8Padding);

		const packetContent = Buffer.concat
			([realData, padding]);

		const outgoingMessage = new LegacyMessage();
		outgoingMessage.setMessageId(553); // NPS_MINI_USER_LIST - 0x229
		outgoingMessage.setBuffer(packetContent);

		const packetResult = new BytableMessage();
		packetResult.setSerializeOrder([
			{ name: "data", field: "Buffer" },
		]);
		packetResult.deserialize(outgoingMessage.serialize());

		log.debug(`[${connectionId}] Sending NPS_MINI_USER_LIST`);
		log.debug(`[${connectionId}] Sending response: ${packetResult.serialize().toString("hex")}`);

		return {
			connectionId,
			messages: [packetResult],
		};
	} catch (error) {
		const err = Error(`Error handling NPS_MINI_USER_LIST: ${String(error)}`);
		err.cause = error;
		throw err;
	}
}