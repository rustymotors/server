import type { Cipher, Decipher } from "node:crypto";
import type { Socket } from "node:net";
import type { NPSMessage } from "../NPSMessage.js";
import { handleEncryptedNPSCommand } from "./encryptedCommand.js";
import { _npsHeartbeat } from "./heartbeat.js";
import { _npsRequestGameConnectServer } from "./requestConnectGameServer.js";

export declare type EncryptionSession = {
    connectionId: string;
    remoteAddress: string;
    localPort: number;
    sessionKey: string;
    shortKey: string;
    gsCipher: Cipher;
    gsDecipher: Decipher;
    tsCipher: Cipher;
    tsDecipher: Decipher;
};
/**
 * Socket with connection properties
 */
export declare type SocketWithConnectionInfo = {
    socket: Socket;
    seq: number;
    id: string;
    remoteAddress: string;
    localPort: number;
    personaId: number;
    lastMessageTimestamp: number;
    inQueue: boolean;
    useEncryption: boolean;
    encryptionSession?: EncryptionSession;
};
export declare type BufferWithConnection = {
    connectionId: string;
    connection: SocketWithConnectionInfo;
    data: Buffer;
    timestamp: number;
};

export interface GSMessageArrayWithConnection {
    connection: SocketWithConnectionInfo;
    messages: NPSMessage[];
}

export interface MessageHandler {
    opCode: number;
    name: string;
    handlerFunction: (
        arg0: BufferWithConnection
    ) => Promise<GSMessageArrayWithConnection>;
}

export const handlerMap: Array<MessageHandler> = [
    {
        opCode: 100,
        name: "Connect game server",
        handlerFunction: _npsRequestGameConnectServer,
    },
    { opCode: 217, name: "Heartbeat", handlerFunction: _npsHeartbeat },
    {
        opCode: 1101,
        name: "Encrypted command",
        handlerFunction: handleEncryptedNPSCommand,
    },
];
