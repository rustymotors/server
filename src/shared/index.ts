/**
 * @module mcos/shared
 */

import { Cipher, Decipher } from "node:crypto";
import { TSMessageBase } from "./TMessageBase.js";
import EventEmitter from "node:events";
import { Socket } from "node:dgram";
export { toHex } from "./utils.js";

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
    localPort: number;
    remoteAddress: string;
    socket: ISocket;
    encryptionSession: TEncryptionSession;
    useEncryption: boolean;
}
export interface TBufferWithConnection {
    connectionId: string;
    connection: TSocketWithConnectionInfo;
    data: Buffer;
    timeStamp: number;
}
export { BinaryStructure, ByteField } from "./BinaryStructure.js";
export { TSMessageBase } from "./TMessageBase.js";

export interface TBinaryStructure {
    serialize: () => Buffer;
    deserialize: (inputBuffer: Buffer) => void;
}
export type TMessageNode = {
    serialize: () => Buffer;
    deserialize: (inputBuffer: Buffer) => void;
};
export type TNPSMessage = {
    serialize: () => Buffer;
    deserialize: (inputBuffer: Buffer) => void;
    toJSON: () => TNPSMessageJSON;
    dumpPacket: () => string;
};
export interface TMessageArrayWithConnection {
    connection: TSocketWithConnectionInfo;
    messages: TSMessageBase[] | TMessageNode[] | TNPSMessage[];
    log: TServerLogger;
}
export type TServiceResponse = TMessageArrayWithConnection;
export type FIELD_TYPE = "boolean" | "byte" | "binary" | "char" | "u16" | "u32";
export interface TMessageHandler {
    opCode: number;
    name: string;
    handlerFunction: (
        dataConnection: TBufferWithConnection,
        log: TServerLogger
    ) => Promise<TMessageArrayWithConnection>;
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

interface NpsCommandMap {
    name: string;
    value: number;
    module: "Lobby" | "Login";
}

export type TNPS_COMMAND_MAP = {
    name: string;
    value: number;
    module: "Lobby" | "Login";
};

export {
    setServerConfiguration,
    getServerConfiguration,
} from "./ServerConfiguration.js";
export { NPSMessage } from "./NPSMessage.js";
export { GetServerLogger } from "./log.js";
export { Sentry } from "./sentry.js";

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

export interface ISocket {
    listeners(arg0: string): any;
    emit: (event: string, ...args: any[]) => void;
    write: (data: Buffer) => boolean;
    on: (event: string, callback: (...args: any[]) => void) => void;
    end: () => void;
    remoteAddress?: string;
    localPort?: number;
}  

export function ISocketTestFactory(): ISocket {
    const ee = new EventEmitter();
    const et = new EventTarget();
    const newISocket = {
        write: () => true,
        end: () => {},
        remoteAddress: "",
        localPort: 0,
        ...ee,
        ...et
    };
    Object.setPrototypeOf(newISocket, Object.getPrototypeOf(ee));
    return newISocket;
}

export interface IMessageHeader {
    length: number;
    signature: string;

    serialize: () => Buffer;
}

export function IMessageHeaderFactory(): IMessageHeader {
    return {
        length: 0,
        signature: "",

        serialize: () => Buffer.from([]),
    };
}

export interface IConnection {
    status: number;
    appID: number;
    id: string;
    socket: ISocket;
    remoteAddress: string;
    localPort: number;
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

export function IConnectionFactory(): IConnection {
    return {
        appID: 0,
        id: "",
        socket: ISocketTestFactory(),
        remoteAddress: "",
        localPort: 0,
        seq: 0,
        personaId: 0,
        lastMessageTimestamp: 0,    
        inQueue: false,
        useEncryption: false,
        status: 0,
        port: 0,
        encryption: null,
        ip: null,
    };
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

export function IMessageFactory(): IMessage {
    return {
        toFrom: 0,
        connectionId: "",
        appID: 0,
        sequence: 0,
        flags: 0,
        buffer: Buffer.from([]),
        header: null,
        
        serialize: () => Buffer.from([]),
        toString: () => "",
    };
}

export interface ITCPHeader {
    msgid: number;
    msglen: number;
    version: number;
    reserved: number;
    checksum: number;

    serialize: () => Buffer;
    serializeSize: () => number;
}

export function ITCPHeaderFactory(): ITCPHeader {
    return {
        msgid: 0,
        msglen: 0,
        version: 0,
        reserved: 0,
        checksum: 0,

        serialize: () => Buffer.from([]),
        serializeSize: () => 0,
    };
}

export interface ITCPMessage {
    connectionId: string | null;
    toFrom: number;
    appId: number;
    header: ITCPHeader | null;
    buffer: Buffer;
}

export function ITCPMessageFactory(): ITCPMessage {
    return {
        connectionId: null,
        toFrom: 0,
        appId: 0,
        header: null,
        buffer: Buffer.from([]),
    };
}

export interface IError {
    code: number;
    message: string;
}

export function TServerConfigurationFactory(): TServerConfiguration {
    return {
        EXTERNAL_HOST: "",
        certificateFileContents: "",
        privateKeyContents: "",
        publicKeyContents: "",
        LOG_LEVEL: "debug",
    };
}

export function TServerLoggerFactory(): TServerLogger {
    return (_level: ELOG_LEVEL, _msg: string) => {
        // do nothing
    };
}
