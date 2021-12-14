"use strict";
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
Object.defineProperty(exports, "__esModule", { value: true });
exports.TCPConnection = void 0;
const crypto_1 = require("crypto");
const encryption_mgr_1 = require("./encryption-mgr");
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
class TCPConnection {
    id;
    appId;
    status;
    remoteAddress;
    localPort;
    sock;
    msgEvent;
    lastMsg;
    useEncryption;
    encLobby;
    enc;
    isSetupComplete;
    mgr;
    inQueue;
    decryptedCmd;
    encryptedCmd;
    /**
     *
     * @param {string} connectionId
     * @param {import("net").Socket} sock
     * @param {module:ConnectionMgr.ConnectionMgr} mgr
     */
    constructor(connectionId, sock, mgr) {
        this.id = connectionId;
        this.appId = 0;
        /**
         * @type {ConnectionStatus}
         */
        this.status = 'Inactive';
        this.remoteAddress = sock.remoteAddress;
        this.localPort = sock.localPort;
        this.sock = sock;
        this.msgEvent = null;
        this.lastMsg = 0;
        this.useEncryption = false;
        /** @type {LobbyCiphers} */
        this.encLobby = {
            cipher: undefined,
            decipher: undefined,
        };
        this.enc = new encryption_mgr_1.EncryptionManager();
        this.isSetupComplete = false;
        this.mgr = mgr;
        this.inQueue = true;
        this.decryptedCmd = Buffer.alloc(0);
        this.encryptedCmd = Buffer.alloc(0);
    }
    /**
     *
     * @param {Buffer} key
     * @return {void}
     */
    setEncryptionKey(key) {
        this.isSetupComplete = this.enc.setEncryptionKey(key);
    }
    /**
     * SetEncryptionKeyDES
     *
     * @param {string} skey
     * @return {void}
     */
    setEncryptionKeyDES(skey) {
        // Deepcode ignore HardcodedSecret: This uses an empty IV
        const desIV = Buffer.alloc(8);
        try {
            this.encLobby.cipher = crypto_1.createCipheriv('des-cbc', Buffer.from(skey, 'hex'), desIV);
            this.encLobby.cipher.setAutoPadding(false);
        }
        catch (error) {
            throw new Error(`Error setting cipher: ${error}`);
        }
        try {
            this.encLobby.decipher = crypto_1.createDecipheriv('des-cbc', Buffer.from(skey, 'hex'), desIV);
            this.encLobby.decipher.setAutoPadding(false);
        }
        catch (error) {
            throw new Error(`Error setting decipher: ${error}`);
        }
        this.isSetupComplete = true;
    }
    /**
     * CipherBufferDES
     *
     * @param {Buffer} messageBuffer
     * @return {Buffer}
     */
    cipherBufferDES(messageBuffer) {
        if (this.encLobby.cipher) {
            return this.encLobby.cipher.update(messageBuffer);
        }
        throw new Error('No DES cipher set on connection');
    }
    /**
     * DecipherBufferDES
     *
     * @param {Buffer} messageBuffer
     * @return {Buffer}
     */
    decipherBufferDES(messageBuffer) {
        if (this.encLobby.decipher) {
            return this.encLobby.decipher.update(messageBuffer);
        }
        throw new Error('No DES decipher set on connection');
    }
}
exports.TCPConnection = TCPConnection;
//# sourceMappingURL=tcpConnection.js.map