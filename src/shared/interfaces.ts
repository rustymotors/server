import { Cipher, Decipher } from "node:crypto";
import { TransactionMessageBase } from "./TMessageBase.js";
import {
    IncomingMessage,
    OutgoingHttpHeader,
    OutgoingHttpHeaders,
    ServerResponse,
} from "node:http";
import { SerializerBase } from "./SerializerBase.js";

export interface ITCPHeader extends ISerializedObject {
    msgid: number;
    msglen: number;
    version: number;
    reserved: number;
    checksum: number;

    deserialize: (buf: Buffer) => ITCPHeader;
}

export interface ITCPMessage extends ISerializedObject {
    connectionId: string | null;
    toFrom: number;
    appId: number;
    header: ITCPHeader | null;
    buffer: Buffer;

    deserialize: (buf: Buffer) => ITCPMessage;
}

export interface ISerializedObject {
    serialize(): Buffer;
    serializeSize(): number;
}

export interface IMessageHeader {
    length: number;
    signature: string;

    serialize: () => Buffer;
}

export interface IMessage {
    toFrom: number;
    connectionId: string | null;
    appID: number;
    sequence: number;
    flags: number;
    buffer: Buffer;
    header: IMessageHeader | null;

    serialize: () => Buffer;
    toString: () => string;
}

export interface ISocket {
    listeners(arg0: string): unknown;
    emit: (event: string, ...args: unknown[]) => void;
    write: (data: Buffer) => boolean;
    on: (event: string, callback: (...args: unknown[]) => void) => void;
    end: () => void;
    remoteAddress?: string;
    localPort?: number;
}

export interface TEncryptionSession {
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

export interface IConnection {
    status: number;
    appID: number;
    id: string;
    socket: ISocket | null;
    remoteAddress: string;
    seq: number;
    personaId: number;
    lastMessageTimestamp: number;
    inQueue: boolean;
    encryptionSession?: TEncryptionSession;
    useEncryption: boolean;
    port: number;
    encryption: null;
    ip: string | null;
}

export interface TSocketWithConnectionInfo {
    connectionId: string;
    socket: ISocket;
    seq: number;
    id: string;
    remoteAddress: string;
    localPort: number;
    personaId: number;
    lastMessageTimestamp: number;
    inQueue: boolean;
    encryptionSession?: TEncryptionSession;
    useEncryption: boolean;
}

export type ELOG_LEVEL =
    | "debug"
    | "info"
    | "notice"
    | "warning"
    | "err"
    | "crit"
    | "alert"
    | "emerg";
export interface TServerConfiguration {
    EXTERNAL_HOST: string;
    certificateFileContents: string;
    privateKeyContents: string;
    publicKeyContents: string;
    LOG_LEVEL: ELOG_LEVEL;
}
export type TServerLogger = (level: ELOG_LEVEL, msg: string) => void;
export interface TDatabaseManager {
    updateSessionKey: (
        customerId: number,
        sessionkey: string,
        contextId: string,
        connectionId: string
    ) => Promise<void>;
    fetchSessionKeyByCustomerId: (
        customerId: number
    ) => Promise<TSessionRecord>;
}
export interface TSession {
    customerId: number;
    connectionId: string;
    sessionKey: string;
    sKey: string;
    contextId: string;
}
export interface TSessionRecord {
    sessionKey: string;
    sKey: string;
}
export interface TConnection {
    id: string;
    localPort: number;
    remoteAddress: string;
    socket: ISocket;
    encryptionSession: TEncryptionSession;
    useEncryption: boolean;
    inQueue: boolean;
}

export interface TBufferWithConnection {
    connectionId: string;
    connection: TSocketWithConnectionInfo;
    data: Buffer;
    timeStamp: number;
}

export type TMessageNode = {
    serialize: () => Buffer;
    deserialize: (inputBuffer: Buffer) => void;
};

export type TNPSMessageJSON = {
    msgNo: number;
    opCode: number | null;
    msgLength: number;
    msgVersion: number;
    content: string;
    contextId: string;
    direction: "sent" | "received";
    sessionKey: string | null;
    rawBuffer: string;
};

export type TNPSMessage = {
    serialize: () => Buffer;
    deserialize: (inputBuffer: Buffer) => void;
    toJSON: () => TNPSMessageJSON;
    dumpPacket: () => string;
};

export interface TMessageArrayWithConnection {
    connection: TSocketWithConnectionInfo;
    messages: TransactionMessageBase[] | TMessageNode[] | TNPSMessage[];
    log: TServerLogger;
}
export type TServiceResponse = TMessageArrayWithConnection;

export interface TBinaryStructure {
    serialize: () => Buffer;
    deserialize: (inputBuffer: Buffer) => void;
}

export type FIELD_TYPE = "boolean" | "byte" | "binary" | "char" | "u16" | "u32";
export interface TMessageHandler {
    opCode: number;
    name: string;
    handlerFunction: (
        dataConnection: TBufferWithConnection,
        log: TServerLogger
    ) => Promise<TMessageArrayWithConnection>;
}

export interface NpsCommandMap {
    name: string;
    value: number;
    module: "Lobby" | "Login";
}

export type TNPS_COMMAND_MAP = {
    name: string;
    value: number;
    module: "Lobby" | "Login";
};

export interface IError {
    code: number;
    message: string;
}

export type TPersonaRecord = {
    customerId: number;
    id: Buffer;
    maxPersonas: Buffer;
    name: Buffer;
    personaCount: Buffer;
    shardId: Buffer;
};

export type TUserRecordMini = {
    contextId: string;
    customerId: number;
    userId: number;
};

export type TJSONResponse = {
    code: number;
    headers: OutgoingHttpHeaders | OutgoingHttpHeader[] | undefined;
    body: string;
};

export type TTCPConnectionHandler = ({
    incomingSocket,
    config,
    log,
}: {
    incomingSocket: ISocket;
    config: TServerConfiguration;
    log: TServerLogger;
}) => void;

export type THTTPConnectionHandler = (
    req: IncomingMessage,
    res: ServerResponse,
    config: TServerConfiguration,
    log: TServerLogger
) => void;

export type TSocketErrorHandler = ({
    sock,
    error,
    log,
}: {
    sock: ISocket;
    error: IError;
    log: TServerLogger;
}) => void;

export type TSocketEndHandler = ({
    sock,
    log,
    connectionRecord,
}: {
    sock: ISocket;
    log: TServerLogger;
    connectionRecord: TSocketWithConnectionInfo;
}) => void;

export type TSocketDataHandler = ({
    socket,
    processMessage,
    data,
    logger,
    config,
    connection,
    connectionRecord,
}: {
    socket: ISocket;
    processMessage?: TMessageProcessor;
    data: Buffer;
    logger: TServerLogger;
    config: TServerConfiguration;
    connection: IConnection;
    connectionRecord: TSocketWithConnectionInfo;
}) => void;

export type TMessageProcessor = ({
    data,
    connectionRecord,
    config,
    logger,
    connection,
    message,
}: {
    data: Buffer;
    connectionRecord: TSocketWithConnectionInfo;
    config: TServerConfiguration;
    logger: TServerLogger;
    connection: IConnection;
    message: IMessage | ITCPMessage;
}) => Promise<void>;

export type TConnectionHandler = ({
    incomingSocket,
    config,
    log,
}: {
    incomingSocket: ISocket;
    config: TServerConfiguration;
    log: TServerLogger;
}) => void;

export type TLobby = {
    lobbyId: number;
    raceTypeId: number;
    turfId: number;
    riffName: string;
    eTurfName: string;
};
