import { LegacyMessage, SetMyUserDataMessage } from "rusty-motors-shared";
import { databaseManager } from "rusty-motors-database";
import { ServerLogger, getServerLogger } from "rusty-motors-shared";
import { BytableMessage } from "@rustymotors/binary";


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
		log.debug(`[${connectionId}] Handling NPS_SET_MY_USER_DATA`);
		log.debug(`[${connectionId}] Received command: ${message.header.messageId}`);

		const incomingMessage = new SetMyUserDataMessage();
		incomingMessage.deserialize(message.serialize());

		log.debug(`User ID: ${incomingMessage.userInfo.userId}`);
		log.debug(`UserData: ${JSON.stringify(incomingMessage.userInfo.userData)}`)

		// Update the user's data
		databaseManager.updateUser({
			userId: incomingMessage.userInfo.userId,
			userInfo: incomingMessage.userInfo,
		});

		const userData = incomingMessage.userInfo.userData

		const currentChannel = userData.lobbyId;

		// Build the packet
		const packetResult = new LegacyMessage();
		// packetResult._header.id = 516;
		packetResult._header.id = 0x214;

		const channelBuffer = Buffer.alloc(8);
		channelBuffer.writeInt32BE(currentChannel);
		channelBuffer.writeInt32BE(7003, 4)

		packetResult.setBuffer(channelBuffer);

		// packetResult.deserialize(incomingMessage.serialize());

		message.header.setMessageId(516)

		return {
			connectionId,
			messages: [message],
		};
	} catch (error) {
		const err = Error(`[${connectionId}] Error handling NPS_SET_MY_USER_DATA: ${String(error)}`);
		err.cause = error;
		throw err;
	}
}