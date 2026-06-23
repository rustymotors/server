import { NPS_MESSAGE_IDS } from 'rusty-motors-shared';
import type { BytableMessage } from '@rustymotors/binary';
import type { ServerLogger } from 'rusty-motors-shared';
import { handleEncryptedCommand } from './handleEncryptedCommand.js';
import { handleOpenCommChannel } from './handleOpenCommChannel.js';
import { handleTrackingPing } from './handleTrackingPing.js';
import { handleUdpStatus } from './handleUdpStatus.js';
import { handleUserLogin } from './handleUserLogin.js';
import { handleCloseCommChannel } from './handleCloseCommChannel.js';
import { handleGetMiniUserList } from './handleGetMiniUserList.js';
import { handleGetReadyList } from './handleGetReadyList.js';
import { handleGetServerInfo } from './handleGetServerInfo.js';
import { handleGetUserList } from './handleGetUserList.js';
import { handleSendMiniRiffList } from './handleSendMiniRiffList.js';
import { handleSendRiffList } from './handleSendRiffList.js';
import { handleSetChannelData } from './handleSetChannelData.js';
import { handleSetChannelFlags } from './handleSetChannelFlags.js';
import { handleSetMyUserData } from './handleSetMyUserData.js';
import { handleSendGameServersList } from './handleSendGameServersList.js';
// Relay handlers: working implementations live in the lobby package.
// The rooms lib stubs are not used; these are port-agnostic.
import {
    handleSendBuddyLong,
    handleSendNotSingleLong,
    handleSendSingleLong,
    handleStartGameServer,
} from 'rusty-motors-lobby';

export interface RoomHandlerArgs {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}

export interface RoomHandlerResult {
    connectionId: string;
    messages: { serialize(): Buffer }[];
}

type RoomHandler = (args: RoomHandlerArgs) => Promise<RoomHandlerResult>;

interface RoomHandlerEntry {
    opCode: number;
    name: string;
    handler: RoomHandler;
}

class RoomsRegistry {
    private readonly handlers = new Map<number, RoomHandlerEntry>();

    register(entry: RoomHandlerEntry): void {
        this.handlers.set(entry.opCode, entry);
    }

    getHandler(opCode: number): RoomHandlerEntry | undefined {
        return this.handlers.get(opCode);
    }
}

export function createRoomHandlerRegistry(): RoomsRegistry {
    const registry = new RoomsRegistry();

    registry.register({
        opCode: NPS_MESSAGE_IDS.OPEN_COMM_CHANNEL,
        name: 'NPS_OPEN_COMM_CHANNEL',
        handler: handleOpenCommChannel,
    });

    registry.register({
        opCode: NPS_MESSAGE_IDS.TRACKING_PING,
        name: 'NPS_TRACKING_PING',
        handler: handleTrackingPing,
    });

    registry.register({
        opCode: NPS_MESSAGE_IDS.ENCRYPTED_COMMAND,
        name: 'NPS_ENCRYPTED_COMMAND',
        handler: handleEncryptedCommand,
    });

    registry.register({
        opCode: NPS_MESSAGE_IDS.UDP_STATUS,
        name: 'NPS_UDP_STATUS',
        handler: handleUdpStatus,
    });

    registry.register({
        opCode: NPS_MESSAGE_IDS.USER_LOGIN,
        name: 'NPS_USER_LOGIN',
        handler: handleUserLogin,
    });

    registry.register({
        opCode: NPS_MESSAGE_IDS.GET_USER_LIST,
        name: 'NPS_GET_USER_LIST',
        handler: handleGetUserList,
    });

    registry.register({
        opCode: NPS_MESSAGE_IDS.SET_MY_USER_DATA,
        name: 'NPS_SET_MY_USER_DATA',
        handler: handleSetMyUserData,
    });

    registry.register({
        opCode: NPS_MESSAGE_IDS.CLOSE_COMM_CHANNEL,
        name: 'NPS_CLOSE_COMM_CHANNEL',
        handler: handleCloseCommChannel,
    });

    registry.register({
        opCode: NPS_MESSAGE_IDS.START_GAME_SERVER,
        name: 'NPS_START_GAME_SERVER',
        handler: handleStartGameServer,
    });

    registry.register({
        opCode: NPS_MESSAGE_IDS.GET_SERVER_INFO,
        name: 'NPS_GET_SERVER_INFO',
        handler: handleGetServerInfo,
    });

    registry.register({
        opCode: NPS_MESSAGE_IDS.SET_COMM_FLAGS,
        name: 'NPS_SET_COMM_FLAGS',
        handler: handleSetChannelFlags,
    });

    registry.register({
        opCode: NPS_MESSAGE_IDS.GET_READY_LIST,
        name: 'NPS_GET_READY_LIST',
        handler: handleGetReadyList,
    });

    registry.register({
        opCode: NPS_MESSAGE_IDS.SET_CHANNEL_DATA,
        name: 'NPS_SET_CHANNEL_DATA',
        handler: handleSetChannelData,
    });

    registry.register({
        opCode: NPS_MESSAGE_IDS.GET_MINI_USER_LIST,
        name: 'NPS_GET_MINI_USER_LIST',
        handler: handleGetMiniUserList,
    });

    registry.register({
        opCode: NPS_MESSAGE_IDS.SEND_RIFF_LIST,
        name: 'NPS_SEND_RIFF_LIST',
        handler: handleSendRiffList,
    });

    registry.register({
        opCode: NPS_MESSAGE_IDS.SEND_GAME_SERVERS_LIST,
        name: 'NPS_SEND_GAME_SERVERS_LIST',
        handler: handleSendGameServersList,
    });

    registry.register({
        opCode: NPS_MESSAGE_IDS.SEND_MINI_RIFF_LIST,
        name: 'NPS_SEND_MINI_RIFF_LIST',
        handler: handleSendMiniRiffList,
    });

    // Relay handlers — working implementations from rusty-motors-lobby
    registry.register({
        opCode: NPS_MESSAGE_IDS.SEND_BUDDY_LONG,
        name: 'NPS_SEND_BUDDY_LONG',
        handler: handleSendBuddyLong,
    });

    registry.register({
        opCode: NPS_MESSAGE_IDS.SEND_SINGLE_LONG,
        name: 'NPS_SEND_SINGLE_LONG',
        handler: handleSendSingleLong,
    });

    registry.register({
        opCode: NPS_MESSAGE_IDS.SEND_NOT_SINGLE_LONG,
        name: 'NPS_SEND_NOT_SINGLE_LONG',
        handler: handleSendNotSingleLong,
    });

    return registry;
}

let registryInstance: RoomsRegistry | null = null;

export function getRoomHandlerRegistry(): RoomsRegistry {
    if (!registryInstance) {
        registryInstance = createRoomHandlerRegistry();
    }
    return registryInstance;
}

export function clearRoomHandlerRegistry(): void {
    registryInstance = null;
}
