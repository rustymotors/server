/// <reference types="node" />
import { Cipher, Decipher } from "crypto";
import { Socket } from "net";
import ConnectionMgr from "./connectionMgr";
export declare class Connection {
    remoteAddress: string;
    localPort: number;
    sock: Socket;
    id: number;
    inQueue: boolean;
    encLobby: {
        cipher?: Cipher;
        decipher?: Decipher;
    };
    enc: {
        in: any;
        out: any;
    };
    useEncryption: boolean;
    isSetupComplete: boolean;
    decryptedCmd: Buffer;
    encryptedCommand: Buffer;
    status: string;
    private appID;
    private msgEvent;
    private lastMsg;
    private mgr;
    constructor(connectionId: number, sock: Socket, mgr: ConnectionMgr);
    /**
     * setEncryptionKey
     */
    setEncryptionKey(sessionKey: Buffer): void;
    /**
     * setEncryptionKeyDES
     */
    setEncryptionKeyDES(sKey: string): void;
    /**
     * CipherBufferDES
     */
    cipherBufferDES(messageBuffer: Buffer): Buffer;
    /**
     * DecipherBufferDES
     */
    decipherBufferDES(messageBuffer: Buffer): Buffer;
}
