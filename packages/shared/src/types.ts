/**
 * @module interfaces
 */

import type { SerializedBufferOld } from "./SerializedBufferOld.js";
import type { Socket as TcpSocket } from "node:net";
import { Socket as UdpSocket } from "node:dgram";
import {LeveledLogMethod} from "winston";

export const name = "interfaces";

/**
 * @exports
 * @interface
 */

// export type ServerLogger = Logger;

export interface DatabaseManager {
	updateSessionKey: (
		arg0: number,
		arg1: string,
		arg2: string,
		arg3: string,
	) => Promise<void>;
	fetchSessionKeyByCustomerId: (arg0: number) => Promise<SessionKeys>;
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

interface SessionKeys {
	sessionKey: string;
	sKey: string;
}

export interface GameMessageOpCode {
	name: string;
	value: number;
	module: "Lobby" | "Login";
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
	message: SerializedBufferOld;
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
	serialize: () => Buffer
	deserialize: (buf: Buffer) => void
	sizeOf: number
}

export interface MCOTSMessage {
	connectionId: string
	serialize: () => Buffer
	deserialize: (buf: Buffer) => void
	sizeOf: number
	length: number
	signature: string
	sequence: number
	flags: number
}

export interface NPSMessage {
	serialize: () => Buffer
	deserialize: (buf: Buffer) => void
	sizeOf: number
	id: number
	length: number
}
export type messageQueueItem = {
	sequenceNo: number;
	data: Buffer<ArrayBufferLike>;
};

export type TaggedTcpSocket = {
    connectionId: string;
    socket:
        | Pick<TcpSocket, 'write' | 'localPort' | 'end' | 'on'>
    connectedAt: number;
    localPort: number;
};

export type TaggedUdpSocket = {
    connectionId: string;
    socket:

        | Pick<UdpSocket, 'send' | 'on'>;
    connectedAt: number;
    localPort: number;
};

export type TaggedSocket = TaggedTcpSocket | TaggedUdpSocket; 

// {
//   error: 0,
//   warn: 1,
//   info: 2,
//   http: 3,
//   verbose: 4,
//   debug: 5,
//   silly: 6
// }

export interface ServerLogger {
    error: LeveledLogMethod;
    warn: LeveledLogMethod;
    info: LeveledLogMethod;
    verbose: LeveledLogMethod;
    /** @deprecated Use verbose instead */
    debug: LeveledLogMethod
    /** @deprecated Use verbose instead */
    trace: LeveledLogMethod
}
export type LogLevel = "error" | "warn" | "info" | "verbose";
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

