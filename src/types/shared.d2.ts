import { Cipher, Decipher } from "node:crypto";
import { Socket } from "node:net";
import { TSMessageBase } from "../shared/TMessageBase";

/**
 * @module mcos/shared
 * @description Shared types and interfaces
 * @namespace mcos/shared
 */
declare module "mcos/shared" {
    export type TNPS_COMMAND_MAP = {
        name: string;
        value: number;
        module: "Lobby" | "Login";
    };

    export type TJSONResponse = {
        code: number;
        headers:
            | OutgoingHttpHeaders
            | OutgoingHttpHeader[]
            | undefined;
        body: string;
    };

    export interface TSocketWithConnectionInfo {
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
    }

    export interface TMessageArrayWithConnection {
        connection: TSocketWithConnectionInfo;
        messages: TSMessageBase[] | TMessageNode[] | TNPSMessage[];
        log: TServerLogger;
    }

    export type TServiceResponse = TMessageArrayWithConnection;

    export interface TBufferWithConnection {
        connectionId: string;
        connection: TSocketWithConnectionInfo;
        data: Buffer;
        timeStamp: number;
    }
    

    export interface TMessageHandler {
        opCode: number;
        name: string;
        handlerFunction: (
            dataConnection: TBufferWithConnection,
            log: TServerLogger
        ) => Promise<TMessageArrayWithConnection>;
    }

    export interface TConnection {
        id: string;
        localPort: number;
        remoteAddress: string;
        socket: Socket;
        encryptionSession: TEncryptionSession;
        useEncryption: boolean;
        inQueue: boolean;
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

export type FIELD_TYPE = "boolean" | "byte" | "binary" | "char" | "u16" | "u32";

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


}
