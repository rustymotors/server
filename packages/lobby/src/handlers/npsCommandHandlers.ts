import { handleSendGameServersList } from "./_handleSendGameServersList.js";
import { _setMyUserData } from "./_setMyUserData.js";
import { NpsCommandHandler } from "./encryptedCommand.js";
import { handleCloseCommChannel } from "./handleCloseCommChannel.js";
import { handleGetMiniUserList } from "./handleGetMiniUserList.js";
import { handleGetServerInfo } from "./handleGetServerInfo.js";
import { handleGetUserList } from "./handleGetUserList.js";
import { handleOpenCommChannel } from "./handleOpenCommChannel.js";
import { handleSendMiniRiffList } from "./handleSendMiniRiffList.js";
import { handleSendRiffList } from "./handleSendRiffList.js";
import { handleStartGameServer } from "./handleStartGameServer.js";

export const npsCommandHandlers: NpsCommandHandler[] = [
	{
		opCode: 0x101,
		name: "NPS_GET_USER_LIST",
		handler: handleGetUserList
	},
	{
		opCode: 0x105,
		name: "NPS_CLOSE_COMM_CHANNEL",
		handler: handleCloseCommChannel
	},
	{
		opCode: 0x10a,
		name: "NPS_START_GAME_SERVER",
		handler: handleStartGameServer
	},
	{
		opCode: 0x10c, // 268
		name: "NPS_GET_SERVER_INFO",
		handler: handleGetServerInfo,
	},
	{
		opCode: 0x128, // 296
		name: "NPS_GET_MINI_USER_LIST",
		handler: handleGetMiniUserList,
	},
	{
		opCode: 0x30c, // 780
		name: "NPS_SEND_MINI_RIFF_LIST",
		handler: handleSendMiniRiffList,
	},
	{
		opCode: 0x103, // 259
		name: "NPS_SET_MY_USER_DATA",
		handler: _setMyUserData,
	},
	{
		opCode: 0x106,
		name: "NPS_OPEN_COMM_CHANNEL",
		handler: handleOpenCommChannel
	},
	{
		opCode: 0x302,
		name: "NPS_SEND_RIFF_LIST",
		handler: handleSendRiffList
	},
	{
		opCode: 0x309,
		name: "NPS_SEND_GAME_SERVERS_LIST",
		handler: handleSendGameServersList
	}
];
