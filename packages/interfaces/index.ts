import { Socket } from "node:net";
import { ServerError } from "../shared/errors/ServerError.js";
import { Cipher, Decipher } from "node:crypto";
import { IncomingMessage, ServerResponse } from "node:http";
import { SerializedBuffer } from "../shared/messageFactory.js";
import { Gateway } from "../gateway/src/GatewayServer.js";
import { Configuration } from "../shared/Configuration.js";
import { Logger } from "pino";

/**
 * @module interfaces
 */

export const name = "interfaces";

/**
 * @exports
 * @interface
 */
interface SerializedObject {
    serialize: () => Buffer;
    serializeSize: () => number;
}

export const SerializedObject = {
    serialize() {
        throw new ServerError("Not implemented");
    },
    serializeSize() {
        throw new ServerError("Not implemented");
    },
};

type GameMessageHeader = object;
/**
 * @extends {SerializedObject}
 * @property {number} msgid
 * @property {number} msglen
 * @property {number} version
 * @property {number} reserved
 * @property {number} checksum
 * @property {function(Buffer): GameMessageHeader} deserialize
 */

interface ClientMessageHeader {
    length: number;
    signature: string;
    serialize: () => Buffer;
}

type ClientMessage = object;
/**
 * @extends {SerializedObject}
 * @property {number} toFrom
 * @property {string} connectionId
 * @property {number} appId
 * @property {number} sequence
 * @property {number} flags
 * @property {Buffer} rawBuffer
 * @property {number} opCode
 * @property {ClientMessageHeader} header
 * @property {function(): Buffer} serialize
 * @property {function(): string} toString
 * @property {function(Buffer): void} deserialize
 */

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

interface TBufferWithConnection {
    connectionId: string;
    connection: SocketWithConnectionInfo;
    data: Buffer;
    timeStamp: number;
}
interface TransactionMessage {
    serialize: () => Buffer;
    deserialize: (arg0: Buffer) => void;
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

interface BinaryStructure {
    serialize: () => Buffer;
    deserialize: (arg0: Buffer) => void;
}

type FIELD_TYPE = "boolean" | "byte" | "binary" | "char" | "u16" | "u32";

/**
 * @exports
 */
interface GameMessageHandler {
    opCode: number;
    name: string;
    handler: (
        arg0: ServiceArgs,
    ) => Promise<import("../shared/State.js").ServiceResponse>;
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

/**
 * @interface
 * @param {object} args
 * @param {Socket} args.incomingSocket
 * @param {Configuration} args.config
 * @param {Logger} args.log
 * @returns {void}
 */
export function NetworkConnectionHandler({
    incomingSocket,
    config,
    log,
}: {
    incomingSocket: Socket;
    config: Configuration;
    log: Logger;
}): void {
    throw new ServerError("Not implemented");
}

type WebConnectionHandler = (
    req: IncomingMessage,
    res: ServerResponse,
    config: Configuration,
    log: import("pino").Logger,
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

interface TPersonaSetver {
    createNewGameAccount: (arg0: Buffer) => Promise<GameMessage>;
    logoutGameUser: (arg0: Buffer) => Promise<GameMessage>;
    validateLicencePlate: (arg0: Buffer) => Promise<GameMessage>;
    validatePersonaName: (arg0: Buffer) => Promise<GameMessage>;
    getPersonaMaps: (arg0: Buffer) => Promise<GameMessage>;
    getPersonasByCustomerId: (arg0: number) => Promise<PersonaRecord[]>;
}

interface AuthenticationServer {
    handleRequest: (
        arg0: IncomingMessage,
        arg1: ServerResponse,
    ) => ServerResponse;
}

interface IConnectionManager {
    connections: ClientConnection[];
    findConnectionByID: (arg0: string) => ClientConnection | undefined;
    findConnectionBySocket: (arg0: Socket) => ClientConnection | undefined;
    findConnectionByAddressAndPort: (
        arg0: string,
        arg1: number,
    ) => ClientConnection | undefined;
    addConnection: (arg0: ClientConnection) => void;
    removeConnection: (arg0: string) => void;
    removeConnectionBySocket: (arg0: Socket) => void;
    removeConnectionsByAppID: (arg0: number) => void;
    getAllConnections: () => ClientConnection[];
    formatConnectionsAsHTML: (arg0: ClientConnection[]) => string;
    formatConnectionsAsJSON: (arg0: ClientConnection[]) => string;
    getQueue: () => ClientConnection[];
    newConnectionFromSocket: (arg0: Socket) => ClientConnection;
    updateConnectionStatus: (arg0: string, arg1: number) => void;
    updateConnectionSocket: (arg0: string, arg1: Socket) => void;
    updateConnectionEncryption: (
        arg0: string,
        arg1: EncryptionSession,
        arg2: boolean,
    ) => void;
}

interface GamePatchingServer {
    handleRequest: (
        arg0: IncomingMessage,
        arg1: ServerResponse,
    ) => ServerResponse;
    castanetResponse: (
        arg0: IncomingMessage,
        arg1: ServerResponse,
    ) => ServerResponse;
}

/**
 * @exports
 * @interface
 */
interface SubprocessThread {
    name: string;
    loopInterval: number;
    timer: NodeJS.Timeout | null;
    parentThread: Gateway | undefined;
    log: import("pino").Logger;
    init: () => void;
    run: () => void;
    shutdown: () => void;
}

/**
 * @interface GatewayServer
 * @extends {SubprocessThread}
 */

/**
 * @function
 * @name GatewayServer#help
 * @returns {void}
 */

/**
 * @function
 * @name GatewayServer#start
 * @returns {void}
 */

/**
 * @function
 * @name GatewayServer#stop
 * @returns {void}
 */

/**
 * @function
 * @name GatewayServer#restart
 * @returns {void}
 */

/**
 * @function
 * @name GatewayServer#exit
 * @returns {void}
 */

interface AdminWebServer {
    handleRequest: (arg0: IncomingMessage) => WebJSONResponse;
}

interface IEncryptionManager {
    generateEncryptionPair: (
        arg0: ClientConnection,
        arg1: SessionKeys,
    ) => EncryptionSession;
    selectEncryptors: (arg0: ClientConnection) => EncryptionSession | undefined;
    createEncrypters: (
        arg0: ClientConnection,
        arg1: SessionKeys,
    ) => EncryptionSession;
}

export interface ServiceArgs {
    connectionId: string;
    message: SerializedBuffer;
    log: import("pino").Logger;
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
