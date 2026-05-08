import { NPS_MESSAGE_IDS } from "rusty-motors-shared";
import { handleSendGameServersList } from "./_handleSendGameServersList.js";
import { _setMyUserData } from "./_setMyUserData.js";
import type { NpsCommandHandler } from "./encryptedCommand.js";
import { handleCloseCommChannel } from "./handleCloseCommChannel.js";
import { handleGetMiniUserList } from "./handleGetMiniUserList.js";
import { handleGetReadyList } from "./handleGetReadyList.js";
import { handleGetServerInfo } from "./handleGetServerInfo.js";
import { handleGetUserList } from "./handleGetUserList.js";
import { handleOpenCommChannel } from "./handleOpenCommChannel.js";
import { handleSendBuddyLong } from "./handleSendBuddyLong.js";
import { handleSendMiniRiffList } from "./handleSendMiniRiffList.js";
import { handleSendNotSingleLong } from "./handleSendNotSingleLong.js";
import { handleSendRiffList } from "./handleSendRiffList.js";
import { handleSendSingleLong } from "./handleSendSingleLong.js";
import { handleSetChannelData } from "./handleSetChannelData.js";
import { handleStartGameServer } from "./handleStartGameServer.js";
import { handleSetChannelFlags } from "./handlSetChannelFlags.js";
import { handleUdpStatus } from "./handlUdpStatus.js";

export const npsCommandHandlers: NpsCommandHandler[] = [
	{
		opCode: NPS_MESSAGE_IDS.GET_USER_LIST,
		name: "NPS_GET_USER_LIST",
		handler: handleGetUserList,
	},
	{
		opCode: NPS_MESSAGE_IDS.CLOSE_COMM_CHANNEL,
		name: "NPS_CLOSE_COMM_CHANNEL",
		handler: handleCloseCommChannel,
	},
	{
		opCode: NPS_MESSAGE_IDS.START_GAME_SERVER,
		name: "NPS_START_GAME_SERVER",
		handler: handleStartGameServer,
	},
	{
		opCode: NPS_MESSAGE_IDS.GET_SERVER_INFO,
		name: "NPS_GET_SERVER_INFO",
		handler: handleGetServerInfo,
	},
	{
		opCode: NPS_MESSAGE_IDS.UDP_STATUS,
		name: "NPS_UDP_STATUS",
		handler: handleUdpStatus,
	},
	{
		opCode: NPS_MESSAGE_IDS.GET_MINI_USER_LIST,
		name: "NPS_GET_MINI_USER_LIST",
		handler: handleGetMiniUserList,
	},
	{
		opCode: NPS_MESSAGE_IDS.SEND_MINI_RIFF_LIST,
		name: "NPS_SEND_MINI_RIFF_LIST",
		handler: handleSendMiniRiffList,
	},
	{
		opCode: NPS_MESSAGE_IDS.SET_COMM_FLAGS,
		name: "NPS_SET_COMM_FLAGS",
		handler: handleSetChannelFlags,
	},
	{
		opCode: NPS_MESSAGE_IDS.SET_CHANNEL_DATA,
		name: "NPS_SET_CHANNEL_DATA",
		handler: handleSetChannelData,
	},
	{
		opCode: NPS_MESSAGE_IDS.GET_READY_LIST,
		name: "NPS_GET_READY_LIST",
		handler: handleGetReadyList,
	},
	{
		opCode: NPS_MESSAGE_IDS.SET_MY_USER_DATA,
		name: "NPS_SET_MY_USER_DATA",
		handler: _setMyUserData,
	},
	{
		opCode: NPS_MESSAGE_IDS.OPEN_COMM_CHANNEL,
		name: "NPS_OPEN_COMM_CHANNEL",
		handler: handleOpenCommChannel,
	},
	{
		opCode: NPS_MESSAGE_IDS.SEND_RIFF_LIST,
		name: "NPS_SEND_RIFF_LIST",
		handler: handleSendRiffList,
	},
	{
		opCode: NPS_MESSAGE_IDS.SEND_GAME_SERVERS_LIST,
		name: "NPS_SEND_GAME_SERVERS_LIST",
		handler: handleSendGameServersList,
	},
	{
		opCode: NPS_MESSAGE_IDS.SEND_BUDDY_LONG,
		name: "NPS_SEND_BUDDY_LONG",
		handler: handleSendBuddyLong,
	},
	{
		opCode: NPS_MESSAGE_IDS.SEND_SINGLE_LONG,
		name: "NPS_SEND_SINGLE_LONG",
		handler: handleSendSingleLong,
	},
	{
		opCode: NPS_MESSAGE_IDS.SEND_NOT_SINGLE_LONG,
		name: "NPS_SEND_NOT_SINGLE_LONG",
		handler: handleSendNotSingleLong,
	},
];
