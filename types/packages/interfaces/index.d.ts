/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { Cipher, Decipher } from "node:crypto";
import { IncomingMessage, OutgoingHttpHeader, OutgoingHttpHeaders, ServerResponse } from "node:http";
import { MessageNode } from "../shared/MessageNode.js";
export interface GameMessageHeader extends SerializedObject {
    msgid: number;
    msglen: number;
    version: number;
    reserved: number;
    checksum: number;
    deserialize: (buf: Buffer) => GameMessageHeader;
}
export interface SerializedObject {
    serialize(): Buffer;
    serializeSize(): number;
}
export interface ClientMessageHeader {
    length: number;
    signature: string;
    serialize: () => Buffer;
}
export interface ClientMessage extends SerializedObject {
    toFrom: number;
    connectionId: string | null;
    appId: number;
    sequence: number;
    flags: number;
    rawBuffer: Buffer;
    opCode: number | null;
    header: ClientMessageHeader | null;
    serialize: () => Buffer;
    toString: () => string;
    deserialize: (inputBuffer: Buffer) => void;
}
export interface NetworkSocket {
    listeners(arg0: string): unknown;
    emit: (event: string, ...args: unknown[]) => void;
    write: (data: Buffer) => boolean;
    on: (event: string, callback: (...args: unknown[]) => void) => void;
    end: () => void;
    destroy: () => void;
    writable: boolean;
    remoteAddress?: string;
    localPort?: number;
}
export interface EncryptionSession {
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
export interface ClientConnection {
    status: number;
    appID: number;
    id: string;
    socket: NetworkSocket | null;
    remoteAddress: string;
    seq: number;
    personaId: number;
    lastMessageTimestamp: number;
    inQueue: boolean;
    encryptionSession?: EncryptionSession;
    useEncryption: boolean;
    port: number;
    ip: string | null;
}
export interface SocketWithConnectionInfo {
    connectionId: string;
    socket: NetworkSocket;
    seq: number;
    id: string;
    remoteAddress: string;
    localPort: number;
    personaId: number;
    lastMessageTimestamp: number;
    inQueue: boolean;
    encryptionSession?: EncryptionSession;
    useEncryption: boolean;
}
export type ELOG_LEVEL = "debug" | "info" | "notice" | "warning" | "err" | "crit" | "alert" | "emerg";
export interface ServerConfiguration {
    EXTERNAL_HOST: string;
    certificateFileContents: string;
    privateKeyContents: string;
    publicKeyContents: string;
    LOG_LEVEL: ELOG_LEVEL;
}
export interface ConfigurationServer {
    serverConfig: ServerConfiguration;
    getConfig: () => ServerConfiguration;
    getLogLevel: () => ELOG_LEVEL;
    setLogLevel: (level: ELOG_LEVEL) => void;
}
export type Logger = (level: ELOG_LEVEL, msg: string) => void;
export interface DatabaseManager {
    updateSessionKey: (customerId: number, sessionkey: string, contextId: string, connectionId: string) => Promise<void>;
    fetchSessionKeyByCustomerId: (customerId: number) => Promise<SessionKeys>;
}
export interface ConnectionRecord {
    customerId: number;
    connectionId: string;
    sessionKey: string;
    sKey: string;
    contextId: string;
}
export interface SessionKeys {
    sessionKey: string;
    sKey: string;
}
export interface TConnection {
    connectionId: string;
    localPort: number;
    remoteAddress: string;
    socket: NetworkSocket;
    encryptionSession: EncryptionSession;
    useEncryption: boolean;
    inQueue: boolean;
}
export interface TBufferWithConnection {
    connectionId: string;
    connection: SocketWithConnectionInfo;
    data: Buffer;
    timeStamp: number;
}
export interface TransactionMessage {
    serialize: () => Buffer;
    deserialize: (inputBuffer: Buffer) => void;
}
export interface JSONResponseOfGameMessage {
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
export interface GameMessage {
    serialize: () => Buffer;
    deserialize: (inputBuffer: Buffer) => void;
    toJSON: () => JSONResponseOfGameMessage;
    dumpPacket: () => string;
}
export interface MessageArrayWithConnectionInfo {
    connection: SocketWithConnectionInfo;
    messages: ClientMessage[] | GameMessage[] | MessageNode[];
    log: Logger;
}
export interface ServiceResponse {
    connection: SocketWithConnectionInfo;
    messages: ClientMessage[] | GameMessage[] | MessageNode[];
    log: Logger;
}
export interface BinaryStructure {
    serialize: () => Buffer;
    deserialize: (inputBuffer: Buffer) => void;
}
export type FIELD_TYPE = "boolean" | "byte" | "binary" | "char" | "u16" | "u32";
export interface GameMessageHandler {
    opCode: number;
    name: string;
    handlerFunction: (args: ServiceArgs) => Promise<ServiceResponse>;
}
export interface GameMessageOpCode {
    name: string;
    value: number;
    module: "Lobby" | "Login";
}
export interface BuiltinError {
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
export interface WebJSONResponse {
    code: number;
    headers: OutgoingHttpHeaders | OutgoingHttpHeader[] | undefined;
    body: string;
}
export type NetworkConnectionHandler = ({ incomingSocket, config, log, }: {
    incomingSocket: NetworkSocket;
    config: ServerConfiguration;
    log: Logger;
}) => void;
export type WebConnectionHandler = (req: IncomingMessage, res: ServerResponse, config: ServerConfiguration, log: Logger) => void;
export type TSocketErrorHandler = ({ sock, error, log, }: {
    sock: NetworkSocket;
    error: BuiltinError;
    log: Logger;
}) => void;
export type TSocketEndHandler = ({ sock, log, connectionRecord, }: {
    sock: NetworkSocket;
    log: Logger;
    connectionRecord: SocketWithConnectionInfo;
}) => void;
export type SocketOnDataHandler = ({ socket, processMessage, data, logger, config, connection, connectionRecord, }: {
    socket: NetworkSocket;
    processMessage?: MessageProcessor;
    data: Buffer;
    logger: Logger;
    config: ServerConfiguration;
    connection: ClientConnection;
    connectionRecord: SocketWithConnectionInfo;
}) => void;
export type MessageProcessor = ({ data, connectionRecord, config, logger, connection, message, }: {
    data: Buffer;
    connectionRecord: SocketWithConnectionInfo;
    config: ServerConfiguration;
    logger: Logger;
    connection: ClientConnection;
    message: ClientMessage | ClientMessage;
}) => Promise<void>;
export type ConnectionHandler = ({ incomingSocket, config, log, }: {
    incomingSocket: NetworkSocket;
    config: ServerConfiguration;
    log: Logger;
}) => void;
export interface RaceLobbyRecord {
    lobbyId: number;
    raceTypeId: number;
    turfId: number;
    riffName: string;
    eTurfName: string;
}
export interface IPersonaServer {
    /**
     * Create a new game persona record
     */
    createNewGameAccount(data: Buffer): Promise<GameMessage>;
    /**
     * Log out a game persona
     */
    logoutGameUser(data: Buffer): Promise<GameMessage>;
    /**
     * Handle a check token packet
     */
    validateLicencePlate(data: Buffer): Promise<GameMessage>;
    /**
     * Handle a get persona maps packet
     */
    validatePersonaName(data: Buffer): Promise<GameMessage>;
    /**
     * Handle a get persona maps packet
     */
    getPersonaMaps(data: Buffer): Promise<GameMessage>;
    /**
     * Lookup all personas owned by the customer id
     */
    getPersonasByCustomerId(customerId: number): Promise<PersonaRecord[]>;
}
export interface AuthenticationServer {
    handleRequest(request: IncomingMessage, response: ServerResponse): ServerResponse;
}
export interface IConnectionManager {
    connections: ClientConnection[];
    findConnectionByID(connectionId: string): ClientConnection | undefined;
    findConnectionBySocket(socket: NetworkSocket): ClientConnection | undefined;
    findConnectionByAddressAndPort(remoteAddress: string, localPort: number): ClientConnection | undefined;
    addConnection(connection: ClientConnection): void;
    removeConnection(connectionId: string): void;
    removeConnectionBySocket(socket: NetworkSocket): void;
    removeConnectionsByAppID(appID: number): void;
    getAllConnections(): ClientConnection[];
    formatConnectionsAsHTML(connections: ClientConnection[]): string;
    formatConnectionsAsJSON(connections: ClientConnection[]): string;
    getQueue(): ClientConnection[];
    newConnectionFromSocket(socket: NetworkSocket): ClientConnection;
    updateConnectionStatus(connectionId: string, status: number): void;
    updateConnectionSocket(connectionId: string, socket: NetworkSocket): void;
    updateConnectionEncryption(connectionId: string, encryptionSession: EncryptionSession, useEncryption: boolean): void;
}
export interface GamePatchingServer {
    handleRequest(request: IncomingMessage, response: ServerResponse): ServerResponse;
    castanetResponse(request: IncomingMessage, response: ServerResponse): ServerResponse;
}
export interface SubprocessThread {
    name: string;
    loopInterval: number;
    timer: NodeJS.Timeout | null;
    parentThread: GatewayServer | undefined;
    log: Logger;
    init: () => void;
    run: () => void;
    shutdown: () => void;
}
export interface GatewayServer {
    help(): void;
    start(): void;
    stop(): void;
    restart(): void;
    exit(): void;
    mainShutdown(): void;
    onSubThreadShutdown(threadName: string): void;
    serverCloseHandler(self: GatewayServer): void;
}
export interface AdminWebServer {
    handleRequest(request: IncomingMessage): WebJSONResponse;
}
export interface IEncryptionManager {
    generateEncryptionPair(connection: ClientConnection, keys: SessionKeys): EncryptionSession;
    selectEncryptors(connection: ClientConnection): EncryptionSession | undefined;
    createEncrypters(connection: ClientConnection, keys: SessionKeys): EncryptionSession;
}
export interface ServiceArgs {
    legacyConnection: TBufferWithConnection;
    connection?: ClientConnection;
    config: ServerConfiguration;
    log: Logger;
}
export type Service = (args: ServiceArgs) => Promise<ServiceResponse>;
export interface KeypressEvent {
    sequence: string;
    name: string;
    ctrl: boolean;
    meta: boolean;
    shift: boolean;
}
//# sourceMappingURL=index.d.ts.map