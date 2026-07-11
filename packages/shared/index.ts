import type { MessageQueue } from './src/MessageQueue.js';
export {
    joinChannel,
    leaveChannel,
    leaveAllChannels,
    getChannelMembers,
    getConnectionChannels,
    setConnectionUserId,
    getConnectionIdByUserId,
} from './src/ChannelMembership.js';
export { SubThread } from './src/SubThread.js';
export { NetworkMessage } from './src/NetworkMessage.js';
export { Configuration, getServerConfiguration } from './src/Configuration.js';
export { configurationProvider, type GatewayConfigurationProvider } from './src/ConfigurationProvider.js';
export { databaseProvider } from './src/database/DatabaseProvider.js';
export type {
    IDatabaseServices,
    ISessionStore,
    IGameDataStore,
    IAuthStore,
    Player,
    PartEntry,
    VehicleRecord,
    OwnedVehicle,
} from './src/database/interfaces.js';
export { SerializedBuffer } from './src/SerializedBuffer.js';
// SerializedBufferOld removed - use BytableBuffer instead
export { ServerMessage } from './src/ServerMessage.js';
export { OldServerMessage } from './src/OldServerMessage.js';
export { RawMessage } from './src/RawMessage.js';
// AbstractSerializable and SerializableMixin removed - use Bytable* classes instead
export { MessageBufferOld } from './src/MessageBufferOld.js';
export { serializeString } from './src/serializeString.js';
export { deserializeString } from './src/deserializeString.js';
export { serializeStringRaw } from './src/serializeStringRaw.js';
export { Timestamp } from './src/TimeStamp.js';
export {
    McosEncryptionPair,
    McosEncryption,
    addSession,
    createInitialState,
    fetchStateFromDatabase,
    addEncryption,
    getEncryption,
    McosSession,
    findSessionByConnectionId,
    updateEncryption,
} from './src/State.js';
export { ensureLegacyCipherCompatibility as verifyLegacyCipherSupport } from './src/verifyLegacyCipherSupport.js';
export type { State } from './src/State.js';
export type { OnDataHandler, ServiceResponse } from './src/State.js';
export { LegacyMessage } from './src/LegacyMessage.js';
// NPSHeader removed - use BytableHeader (version 1) instead
export {
    UserData,
    UserInfo,
    UserInfoMessage,
    UserJoinedChannelMessage,
} from './src/UserData.js';
export { RiffInfoListMessage, RiffInfo, ChannelCreated } from './src/Lobby.js';
export { MessageQueue } from './src/MessageQueue.js';
export {
    GameServerLaunchInfo,
    GameServerInfo,
    GameServerListMessage,
    RunningServerInfo,
    ReadyForGame,
    ReadyForGameList,
} from './src/GameServer.js';
export { MessageNode, MessageNodeBody } from './src/MessageNode.js';
export type { Serializable } from './src/types.js';
export {
    Bool,
    CBlock,
    CString,
    checkMinLength,
    checkSize4,
    sliceBuff,
    NPS_LOGICAL,
    Short,
    Long,
    diffObj,
} from './src/helpers.js';
export { CreateRaceInfo, CreateRaceMessage } from './src/CreateRaceMessage.js';
export {
    RaceInfo,
    Racer,
    RaceCreatedMessage,
    JoinRaceMessage,
    RaceJoinedMessage,
} from './src/RaceInfo.js';
export { SerializedList } from './src/SerializedList.js';
export { OpenCommChannelRequest } from './src/OpenCommChannelRequest.js';
export { getServerLogger } from './getServerLogger.js';
export { NoResultsError } from './src/errors/NoResultError.js';
export * from './src/types.js';

// Message ID constants
export * from './src/constants/index.js';

// Handler utilities (Clean Code & SOLID patterns)
export type {
    HandlerContext,
    HandlerContextWithServices,
    HandlerResult,
    MessageHandler,
    LegacyHandlerArgs,
    LegacyHandlerResult,
} from './src/handlers/index.js';
export {
    HandlerError,
    wrapHandlerError,
    withErrorBoundary,
    createValidationError,
    createUnsupportedMessageError,
    createNoEncryptionError,
    createNoSessionError,
    MessageHandlerRegistry,
    createHandlerContext,
    createHandlerContextWithServices,
    createTestContext,
    ResponseBuilder,
} from './src/handlers/index.js';
export type {
    HandlerServices,
    ContextFactoryOptions,
    SerializableMessage,
} from './src/handlers/index.js';

// Function to convert ARGB to 32-bit integer
export function argbToInt(
    alpha: number,
    red: number,
    green: number,
    blue: number,
) {
    return (
        ((alpha & 0xff) << 24) |
        ((red & 0xff) << 16) |
        ((green & 0xff) << 8) |
        (blue & 0xff)
    );
}

// Function to convert 32-bit integer to ARGB
export function intToArgb(int: number) {
    return {
        alpha: (int >> 24) & 0xff,
        red: (int >> 16) & 0xff,
        green: (int >> 8) & 0xff,
        blue: int & 0xff,
    };
}

//skin colors
export const skin_pale = argbToInt(255, 255, 206, 165); //light pale
export const skin_tan = argbToInt(255, 206, 164, 122); //light tan
export const skin_brown = argbToInt(255, 112, 95, 78); //light brown
//shaded versions of the basic skin colors
export const dskin_pale = argbToInt(255, 140, 115, 90); //dark pale
export const dskin_tan = argbToInt(255, 124, 98, 72); //dark tan
export const dskin_brown = argbToInt(255, 63, 49, 35); //dark brown
//hair colors
export const hair_white = argbToInt(255, 255, 255, 255); //white
export const hair_platinum = argbToInt(255, 255, 242, 167); //platinum blonde
export const hair_blonde = argbToInt(255, 244, 219, 76); //blonde
export const hair_tan = argbToInt(255, 122, 100, 49); //tan
export const hair_red = argbToInt(255, 172, 69, 13); //red
export const hair_brown = argbToInt(255, 81, 65, 29); //brown
export const hair_black = argbToInt(255, 0, 0, 0); //black
//clothing colors
export const cloth_red = argbToInt(255, 212, 82, 82); //red
export const cloth_orange = argbToInt(255, 229, 139, 38); //orange
export const cloth_yellow = argbToInt(255, 255, 216, 0); //yellow
export const cloth_green = argbToInt(255, 112, 158, 113); //green
export const cloth_blue = argbToInt(255, 67, 81, 168); //blue
export const cloth_purple = argbToInt(255, 121, 80, 132); //purple
export const cloth_brown = argbToInt(255, 117, 104, 68); //brown
export const cloth_black = argbToInt(255, 68, 68, 68); //black
export const cloth_grey = argbToInt(255, 146, 143, 137); //grey
export const cloth_white = argbToInt(255, 255, 255, 255); //white

export type SocketQueuePair = {
    send: MessageQueue;
    receive: MessageQueue;
};

const socketQueues: Map<string, SocketQueuePair> = new Map();

export function addSocketPair(connectionId: string, pair: SocketQueuePair) {
    socketQueues.set(connectionId, pair);
}

export function getSocketQueue(
    connectionId: string,
    direction: 'send' | 'receive',
): MessageQueue {
    const pair = socketQueues.get(connectionId);

    if (typeof pair === 'undefined') {
        throw new Error(
            `Unable to locate queue pair for connection: ${connectionId}`,
        );
    }

    const queue = pair[direction];

    if (typeof queue === 'undefined') {
        throw new Error(
            `Unable to locate ${direction} queue for connection ${connectionId}`,
        );
    }

    return queue;
}
