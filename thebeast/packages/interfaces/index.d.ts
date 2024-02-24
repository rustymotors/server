import { Socket } from "node:net";
import { ServerError } from "../shared/errors/ServerError.js";
import { Cipher, Decipher } from "node:crypto";
import { IncomingMessage, ServerResponse } from "node:http";
import { SerializedBuffer } from "../shared/messageFactory.js";
import { Configuration } from "../shared/Configuration.js";

/**
 * @module interfaces
 */

export as namespace interfaces;

export const name = "interfaces";

/**
 * @exports
 * @interface
 */
export interface SerializedObject {
    serialize: () => Buffer;
    serializeSize: () => number;
}

interface EncryptionSession {
    connectionId: string;
    remoteAddress: string;
    localPort: number;
    sessionKey: string;
    sKey: string;
    gsCipher: Cipher;
    gsDecipher: Decipher;
    tsCipher: Cipher;
    tsDecipher: Decipher;
}

interface ClientConnection {
    status: number;
    appID: number;
    id: string;
    socket: Socket;
    remoteAddress: string;
    seq: number;
    personaId: number;
    lastMessageTimestamp: number;
    inQueue: boolean;
    encryptionSession: EncryptionSession;
    useEncryption: boolean;
    port: number;
    ip: string;
}

interface SocketWithConnectionInfo {
    connectionId: string;
    socket: Socket;
    seq: number;
    id: string;
    remoteAddress: string;
    localPort: number;
    personaId: number;
    lastMessageTimestamp: number;
    inQueue: boolean;
    encryptionSession: EncryptionSession;
    useEncryption: boolean;
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

interface TConnection {
    connectionId: string;
    localPort: number;
    remoteAddress: string;
    socket: Socket;
    encryptionSession: EncryptionSession;
    useEncryption: boolean;
    inQueue: boolean;
}

interface JSONResponseOfGameMessage {
    msgNo: number;
    opCode: number | null;
    msgLength: number;
    msgVersion: number;
    content: string;
    contextId: string;
    direction: "sent" | "received";
    sessionKey: string | null;
    rawBuffer: string;
}

interface GameMessage {
    serialize: () => Buffer;
    deserialize: (arg0: Buffer) => void;
    toJSON: () => JSONResponseOfGameMessage;
    dumpPacket: () => string;
}

export interface GameMessageOpCode {
    name: string;
    value: number;
    module: "Lobby" | "Login";
}

interface BuiltinError {
    code: number;
    message: string;
}

export interface PersonaRecord {
    customerId: number;
    id: Buffer;
    maxPersonas: Buffer;
    name: Buffer;
    personaCount: Buffer;
    shardId: Buffer;
}

export interface UserRecordMini {
    contextId: string;
    customerId: number;
    userId: number;
}

interface WebJSONResponse {
    code: number;
    headers:
        | import("http").OutgoingHttpHeaders
        | import("http").OutgoingHttpHeader[]
        | undefined;
    body: { connectionId: string; remoteAddress: string; inQueue: boolean }[];
}

type WebConnectionHandler = (
    req: IncomingMessage,
    res: ServerResponse,
    config: Configuration,
    log: ServerLogger,
) => void;

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
    log: ServerLogger;
}

type Service = (
    args: ServiceArgs,
) => Promise<import("../shared/State.js").ServiceResponse>;

export interface KeypressEvent {
    sequence: string;
    name: string;
    ctrl: boolean;
    meta: boolean;
    shift: boolean;
}

export as namespace interfaces;
