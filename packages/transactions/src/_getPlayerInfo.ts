import { OldServerMessage } from "rusty-motors-shared";
import { GenericRequestMessage } from "./GenericRequestMessage.js";
import { PlayerInfoMessage } from "./PlayerInfoMessage.js";
import type { MessageHandlerArgs, MessageHandlerResult } from "./handlers.js";

export async function _getPlayerInfo(
	args: MessageHandlerArgs,
): Promise<MessageHandlerResult> {
	const getPlayerInfoMessage = new GenericRequestMessage();
	getPlayerInfoMessage.deserialize(args.packet.data);

	args.log.debug(
		`[${args.connectionId}] Received GenericRequestMessage: ${getPlayerInfoMessage.toString()}`,
	);

	const playerId = getPlayerInfoMessage.data.readUInt32LE(0);

	args.log.debug(`[${args.connectionId}] Player ID: ${playerId}`);

	try {
		const playerInfoMessage = new PlayerInfoMessage();
		playerInfoMessage._msgNo = 108;
		playerInfoMessage._playerId = playerId;
		playerInfoMessage._playerName = "Dr Brown";
		playerInfoMessage._currentLevel = 1;
		playerInfoMessage._currentClub = 0;
		playerInfoMessage._maxInventorySlots = 100;
		playerInfoMessage._numberOfInventorySlotsUsed = 0;
		playerInfoMessage._bankBalance = 50;
		playerInfoMessage._numberOfPointsToNextLevel = 3;

		args.log.debug(
			`[${args.connectionId}] Sending PlayerInfoMessage: ${playerInfoMessage.toString()}`,
		);

		const responsePacket = new OldServerMessage();
		responsePacket._header.sequence = args.packet._header.sequence;
		responsePacket._header.flags = 8;

		responsePacket.setBuffer(playerInfoMessage.serialize());

		return { connectionId: args.connectionId, messages: [responsePacket] };
	} catch (error) {
		const err = Error(`[${args.connectionId}] Error handling getPlayerInfo`, {
			cause: error,
		});
		throw err;
	}
}
