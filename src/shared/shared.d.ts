import { Cipher, Decipher } from "crypto";
import { Socket } from "net";

declare module "mcos/shared" {
    export type ELOG_LEVEL =
        | "debug"
        | "info"
        | "notice"
        | "warning"
        | "err"
        | "crit"
        | "alert"
        | "emerg";
    export type TServerConfiguration = {
        EXTERNAL_HOST: string;
        certificateFileContents: string;
        privateKeyContents: string;
        publicKeyContents: string;
        LOG_LEVEL: ELOG_LEVEL;
    };
    export type TServerLogger = (level: ELOG_LEVEL, msg: string) => void;
    export type TDatabaseManager = {
        updateSessionKey: (
            customerId: number,
            sessionkey: string,
            contextId: string,
            connectionId: string
        ) => Promise<void>;
        fetchSessionKeyByCustomerId: (
            customerId: number
        ) => Promise<TSessionRecord>;
    };
    export type TSession = {
        customerId: number;
        connectionId: string;
        sessionKey: string;
        sKey: string;
        contextId: string;
    };
    export type TSessionRecord = {
        sessionKey: string;
        sKey: string;
    };
    export type TConnection = {
        localPort: number;
        remoteAddress: string;
        socket: Socket;
        encryptionSession: TEncryptionSession;
        useEncryption: boolean;
    };
    export type TBufferWithConnection = {
        connectionId: string;
        connection: TSocketWithConnectionInfo;
        data: Buffer;
        timeStamp: number;
    };
    export type TBinaryStructure = {
        serialize: () => Buffer;
        deserialize: (inputBuffer: Buffer) => void;
    };
    export type TSMessageBase = TBinaryStructure;
    export type TMessageNode = {
        serialize: () => Buffer;
        deserialize: (inputBuffer: Buffer) => void;
    };
    export type TNPSMessage = {
        serialize: () => Buffer;
        deserialize: (inputBuffer: Buffer) => void;
    };
    export type TMessageArrayWithConnection = {
        connection: TSocketWithConnectionInfo;
        messages: TSMessageBase[] | TMessageNode[] | TNPSMessage[];
        log: TServerLogger;
    };
    export type TServiceResponse = TMessageArrayWithConnection;
    export type FIELD_TYPE =
        | "boolean"
        | "byte"
        | "binary"
        | "char"
        | "u16"
        | "u32";
    export type TMessageHandler = {
        opCode: number;
        name: string;
        handlerFunction: (
            dataConnection: TBufferWithConnection,
            log: TServerLogger
        ) => Promise<TMessageArrayWithConnection>;
    };
    export type TEncryptionSession = {
        connectionId: string;
        remoteAddress: string;
        localPort: number;
        sessionKey: string;
        sKey: string;
        gsCipher: Cipher;
        gsDecipher: Decipher;
        tsCipher: Cipher;
        tsDecipher: Decipher;
    };
    export type TSocketWithConnectionInfo = {
        socket: Socket;
        seq: number;
        id: string;
        remoteAddress: string;
        localPort: number;
        personaId: number;
        lastMessageTimestamp: number;
        inQueue: boolean;
        encryptionSession?: TEncryptionSession;
        useEncryption: boolean;
    };
}
