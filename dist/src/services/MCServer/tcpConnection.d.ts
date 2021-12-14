/// <reference types="node" />
import { Cipher, Decipher } from 'crypto';
import { Socket } from 'net';
import { ConnectionManager } from './connection-mgr';
import { EncryptionManager } from './encryption-mgr';
/**
 * Contains the proporties and methods for a TCP connection
 * @module ConnectionObj
 */
/**
 * @typedef {'Active' | 'Inactive'} ConnectionStatus
 */
/**
 * @typedef LobbyCiphers
 * @property { crypto.Cipher | null } cipher
 * @property { crypto.Decipher | null} decipher
 */
/**
 * @class
 * @property {string} id
 * @property {number} appId
 * @property {ConnectionStatus} status
 * @property {string} remoteAddress
 * @property {string} localPort
 * @property {import("net").Socket} sock
 * @property {null} msgEvent
 * @property {number} lastMsg
 * @property {boolean} useEncryption
 * @property {LobbyCiphers} encLobby
 * @property {EncryptionManager} enc
 * @property {boolean} isSetupComplete
 * @property {module:ConnectionMgr.ConnectionMgr} mgr
 * @property {boolean} inQueue
 * @property {Buffer} decryptedCmd
 * @property {Buffer} encryptedCmd
 */
export declare class TCPConnection {
    id: string;
    appId: number;
    status: string;
    remoteAddress: string | undefined;
    localPort: number;
    sock: Socket;
    msgEvent: null;
    lastMsg: number;
    useEncryption: boolean;
    encLobby: {
        cipher: Cipher | undefined;
        decipher: Decipher | undefined;
    };
    enc: EncryptionManager;
    isSetupComplete: boolean;
    mgr: ConnectionManager;
    inQueue: boolean;
    decryptedCmd: Buffer;
    encryptedCmd: Buffer;
    /**
     *
     * @param {string} connectionId
     * @param {import("net").Socket} sock
     * @param {module:ConnectionMgr.ConnectionMgr} mgr
     */
    constructor(connectionId: string, sock: Socket, mgr: ConnectionManager);
    /**
     *
     * @param {Buffer} key
     * @return {void}
     */
    setEncryptionKey(key: Buffer): void;
    /**
     * SetEncryptionKeyDES
     *
     * @param {string} skey
     * @return {void}
     */
    setEncryptionKeyDES(skey: string): void;
    /**
     * CipherBufferDES
     *
     * @param {Buffer} messageBuffer
     * @return {Buffer}
     */
    cipherBufferDES(messageBuffer: Buffer): Buffer;
    /**
     * DecipherBufferDES
     *
     * @param {Buffer} messageBuffer
     * @return {Buffer}
     */
    decipherBufferDES(messageBuffer: Buffer): Buffer;
}
