import type { Cipher, Decipher } from "node:crypto";
import { serverHeader } from "./messageFactory.js";
import type { SerializedBuffer } from "./messageFactory.js";

export interface ServerMessageType {
    _header: serverHeader;
    _msgNo: number;
    size(): number;
    _doDeserialize(buffer: Buffer): ServerMessageType;
    serialize(): Buffer;
    setBuffer(buffer: Buffer): void;
    updateMsgNo(): void;
    toString(): string;
    data: Buffer;
}

export type TServerLogger = {
    info: (message: string) => void;
    error: (message: string) => void;
    fatal: (message: string) => void;
    warn: (message: string) => void;
    debug: (message: string) => void;
    trace: (message: string) => void;
};

export interface IGatewayServer {}

export interface SerializedObject {
    serialize: () => Buffer;
    serializeSize: () => number;
}

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

export interface TPersonaRecord {
    customerId: number;
    personaId: number;
    maxPersonas: number;
    personaName: string
    personaCount: number
    shardId: number;
}

export interface UserRecordMini {
    contextId: string;
    customerId: number;
    userId: number;
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
    message: SerializedBuffer;
    log: TServerLogger;
}

export interface KeypressEvent {
    sequence: string;
    name: string;
    ctrl: boolean;
    meta: boolean;
    shift: boolean;
}

