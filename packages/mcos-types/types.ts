import type { Cipher, Decipher } from "node:crypto";
import type { Socket } from "node:net";
import type { MessageNode } from "./MessageNode.js";
import type { NPSMessage } from "./NPSMessage.js";

export type InterServiceTransfer = {
    targetService: SERVICE_NAMES;
    connectionId: string;
    data: Buffer;
};

export enum SERVICE_NAMES {
    "GATEWAY",
    "LOGIN",
    "TRANSACTION",
    "PERSONA",
    "LOBBY",
}

export declare type ECONNECTION_STATUS = "Active" | "Inactive";
export declare type LobbyCiphers = {
    cipher?: Cipher;
    decipher?: Decipher;
};
export declare type FIELD_TYPE =
    | "boolean"
    | "binary"
    | "byte"
    | "char"
    | "u16"
    | "u32";

export declare type EncryptionSession = {
    connectionId: string;
    gsCipher: Cipher;
    gsDecipher: Decipher;
    tsCipher: Cipher;
    tsDecipher: Decipher;
};
/**
 * Socket with connection properties
 */
export declare type ISocketRecord = {
    socket: Socket;
    id: string;
};
export declare type BufferWithConnection = {
    connectionId: string;
    connection: ISocketRecord;
    data: Buffer;
    timestamp: number;
};
export declare type SessionRecord = {
    skey: string;
    sessionkey: string;
};
export declare type ByteField = {
    name: string;
    order: "little" | "big";
    offset: number;
    size: number;
    type: FIELD_TYPE;
    value: Buffer;
};

export interface BinaryStructure {
    serialize: () => Buffer;
    deserialize: (byteStream: Buffer) => void;
    getByteLength: () => number;
    get: (fieldName: string) => ByteField;
    getValue: (fieldName: string) => string | number | boolean;
    setValueNumber: (fieldName: string, newValue: number) => void;
}

export type TSMessageBase = BinaryStructure;

/**
 * N+ messages, ready for sending, with related connection
 */
export type TSMessageArrayWithConnection = {
    connectionId: string;
    messages: MessageNode[] | TSMessageBase[];
};

export type TServiceResponse = {
    err: Error | null;
    response?: TSMessageArrayWithConnection | undefined;
};

export interface GSMessageArrayWithConnection {
    connectionId: string;
    messages: NPSMessage[];
}

export interface GServiceResponse {
    err: Error | null;
    response?: GSMessageArrayWithConnection | undefined;
}

export declare type UserRecordMini = {
    contextId: string;
    customerId: number;
    userId: number;
};

export declare type NPSMessageJSON = {
    msgNo: number;
    opCode: number | null;
    msgLength: number;
    msgVersion: number;
    content: string;
    contextId: string;
    direction: "sent" | "received";
    sessionkey: string | null;
    rawBuffer: string;
};

export type PersonaRecord = {
    customerId: number;
    id: Buffer;
    maxPersonas: Buffer;
    name: Buffer;
    personaCount: Buffer;
    shardId: Buffer;
};

export type NpsCommandMap = {
    name: string;
    value: number;
    module: "Lobby" | "Login";
};
