import { LegacyMessage } from "rusty-motors-shared";
import { databaseManager } from "rusty-motors-database";
import { ServerLogger, getServerLogger } from "rusty-motors-shared";
import { BytableMessage } from "@rustymotors/binary";
import { UserInfo } from "./UserInfo.js";
import { UserData } from "./UserData.js";

const NPS_USER_INFO = 0x204; // 516
const NPS_CHANNEL_GRANTED = 0x214; // 532

export async function _setMyUserData({
	connectionId,
	message,
	log = getServerLogger("lobby._setMyUserData"),
}: {
	connectionId: string;
	message: BytableMessage;
	log?: ServerLogger;
}) {
	try {
		log.debug({
			connectionId,
			payload: message.serialize().toString("hex"),
		}, `Handling NPS_SET_MY_USER_DATA`);

		const incomingMessage = new UserInfo();
		incomingMessage.deserialize(message.serialize());

		log.debug(`User ID: ${incomingMessage.userId}`);

		// Update the user's data
		databaseManager.updateUser({
			userId: incomingMessage.userId,
			userData: incomingMessage.userData.serialize(),
		});

		const userData = new UserData();
		userData.deserialize(incomingMessage.userData.serialize());

		log.debug(`User data: ${userData.toString()}`);

		const currentChannel = userData.lobbyId;

		// Build the packet
		const packetResult = new LegacyMessage();
		// packetResult._header.id = NPS_USER_INFO;
		packetResult._header.id = NPS_CHANNEL_GRANTED;

		const channelBuffer = Buffer.alloc(4);
		channelBuffer.writeInt32BE(currentChannel);

		const response = Buffer.concat([channelBuffer, Buffer.from([0, 0, 0, 0])]);

		packetResult.setBuffer(response);

		// packetResult.deserialize(incomingMessage.serialize());

		message.header.setMessageId(NPS_USER_INFO)

		return {
			connectionId,
			message: null,
		};
	} catch (error) {
		const err = Error(`[${connectionId}] Error handling NPS_SET_MY_USER_DATA: ${String(error)}`);
		err.cause = error;
		throw err;
	}
}
