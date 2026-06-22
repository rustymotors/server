/**
 * @module interfaces
 */

import type { Socket as TcpSocket } from 'node:net';
import type { Socket as UdpSocket } from 'node:dgram';
import type { BytableBuffer } from '@rustymotors/binary';
import type { ServerLogger as LoggingServerLogger, LogLevel as LoggingLogLevel } from '@rustymotors/logging';
import type { UserInfo } from './UserData.js';

/**
 * @deprecated Import from '@rustymotors/logging' instead.
 * This re-export will be removed in a future version.
 */
export type ServerLogger = LoggingServerLogger;

/**
 * @deprecated Import from '@rustymotors/logging' instead.
 * This re-export will be removed in a future version.
 */
export type LogLevel = LoggingLogLevel;

export const name = 'interfaces';

export type IRunningServerInfo = Serializable & {
    commId: number;
    ipAddress: string;
    port: number;
    userId: number;
    numberOfPlayers: number;
    riff: string;
};

export interface DatabaseManager {
    updateSessionKey: (
        arg0: number,
        arg1: string,
        arg2: string,
        arg3: string,
    ) => Promise<void>;
    fetchSessionKeyByCustomerId: (arg0: number) => Promise<ConnectionRecord>;
}

export interface DatabaseManager {
    updateGameServer: (commId: number, gameServer: IRunningServerInfo) => Promise<void>;
    getGameServers: () => Promise<IRunningServerInfo[]>;
    updateUser: (user: { userId: number; userInfo: UserInfo }) => Promise<void>;
    getUser: (userId: number) => Promise<UserInfo | undefined>;
    updateConnection: (connectionId: string, userId: number) => Promise<void>;
    findUserByConnectionId: (connectionId: string) => Promise<number | undefined>;
    fetchSessionKeyByCustomerId: (customerId: number) => Promise<ConnectionRecord>;
    updateSessionKey: (customerId: number, sessionKey: string, contextId: string, connectionId: string) => Promise<void>;
    fetchSessionKeyByConnectionId: (connectionId: string) => Promise<ConnectionRecord>;
}

/**
 * @exports
 */
export interface ConnectionRecord {
    customerId: number;
    connectionId: string;
    sessionKey: string;
    sKey: string;
    contextId: string;
}


export interface GameMessageOpCode {
    name: string;
    value: number;
    module: 'Lobby' | 'Login';
}

export interface UserRecordMini {
    contextId: string;
    customerId: number;
    profileId: number;
}

/**
 * @exports
 */
export interface RaceLobbyRecord {
    lobbyId: number;
    raceTypeId: number;
    turfId: number;
    riffName: string;
    eTurfName: string;
}

export interface ServiceArgs {
    connectionId: string;
    message: BytableBuffer;
    log?: ServerLogger;
}

export interface KeypressEvent {
    sequence: string;
    name: string;
    ctrl: boolean;
    meta: boolean;
    shift: boolean;
}
export interface Serializable {
    serialize: () => Buffer;
    deserialize: (buf: Buffer) => void;
    sizeOf: number;
}

export interface MCOTSMessage {
    connectionId: string;
    serialize: () => Buffer;
    deserialize: (buf: Buffer) => void;
    sizeOf: number;
    length: number;
    signature: string;
    sequence: number;
    flags: number;
}

export interface NPSMessage {
    serialize: () => Buffer;
    deserialize: (buf: Buffer) => void;
    sizeOf: number;
    id: number;
    length: number;
}
export type messageQueueItem = {
    sequenceNo: number;
    data: Buffer<ArrayBufferLike>;
};

export type TaggedTcpSocket = {
    connectionId: string;
    socket: Pick<TcpSocket, 'write' | 'localPort' | 'end' | 'on'>;
    connectedAt: number;
    localPort: number;
};

export type TaggedUdpSocket = {
    connectionId: string;
    socket: Pick<UdpSocket, 'send' | 'on'>;
    connectedAt: number;
    localPort: number;
};

export type TaggedSocket = TaggedTcpSocket | TaggedUdpSocket;

// ServerLogger and LogLevel are now re-exported from @rustymotors/logging at the top of this file
export interface KeypressEvent {
    sequence: string;
    name: string;
    ctrl: boolean;
    meta: boolean;
    shift: boolean;
}
export interface ConnectionRecord {
    customerId: number;
    connectionId: string;
    sessionKey: string;
    sKey: string;
    contextId: string;
}
