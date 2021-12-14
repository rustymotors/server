"use strict";
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
Object.defineProperty(exports, "__esModule", { value: true });
exports.NPSUserStatus = void 0;
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const mco_logger_1 = require("@drazisil/mco-logger");
const nps_msg_1 = require("../MCOTS/nps-msg");
const message_node_1 = require("../MCOTS/message-node");
const { log } = mco_logger_1.Logger.getInstance();
/**
 *
 * @module NPSUserStatus
 */
/**
 * Load the RSA private key
 *
 * @param {string} privateKeyPath
 * @return {string}
 */
function fetchPrivateKeyFromFile(privateKeyPath) {
    try {
        fs_1.statSync(privateKeyPath);
    }
    catch (error) {
        if (error instanceof Error) {
            throw new TypeError(`[npsUserStatus] Error loading private key: ${error.message}`);
        }
        throw new Error('[npsUserStatus] Error loading private key, error unknown');
    }
    return fs_1.readFileSync(privateKeyPath).toString();
}
/**
 * Structure the raw packet into a login packet structure
 * @param {Socket} socket
 * @param {Buffer} packet
 * @return {LoginPacket}
 */
/**
 *
 * @class
 * @extends {NPSMsg}
 * @property {string} sessionkey
 * @property {string} opCode
 * @property {Buffer} buffer
 */
class NPSUserStatus extends nps_msg_1.NPSMessage {
    sessionkey;
    opCode;
    contextId;
    buffer;
    /**
     *
     * @param {Buffer} packet
     */
    constructor(packet) {
        super(message_node_1.EMessageDirection.RECEIVED);
        this.sessionkey = '';
        // Save the NPS opCode
        this.opCode = packet.readInt16LE(0);
        // Save the contextId
        this.contextId = packet.slice(14, 48).toString();
        // Save the raw packet
        this.buffer = packet;
    }
    /**
     * ExtractSessionKeyFromPacket
     *
     * Take 128 bytes
     * They are the utf-8 of the hex bytes that are the key
     *
     * @param {IServerConfig} serverConfig
     * @param {Buffer} packet
     * @return {void}
     */
    extractSessionKeyFromPacket(serverConfig, packet) {
        // Decrypt the sessionkey
        const privateKey = fetchPrivateKeyFromFile(serverConfig.privateKeyFilename);
        const sessionkeyString = Buffer.from(packet.slice(52, -10).toString('utf8'), 'hex');
        const decrypted = crypto_1.privateDecrypt(privateKey, sessionkeyString);
        this.sessionkey = decrypted.slice(2, -4).toString('hex');
    }
    /**
     *
     * @return {module:NPSMsg.INPSMsgJSON}
     */
    toJSON() {
        return {
            msgNo: this.msgNo,
            msgLength: this.msgLength,
            msgVersion: this.msgVersion,
            content: this.content.toString('hex'),
            direction: this.direction,
            opCode: this.opCode,
            contextId: this.contextId,
            sessionkey: this.sessionkey,
            rawBuffer: this.buffer.toString('hex'),
        };
    }
    /**
     * @return {void}
     */
    dumpPacket() {
        this.dumpPacketHeader('NPSUserStatus');
        log('debug', `NPSUserStatus,
      ${JSON.stringify({
            contextId: this.contextId,
            sessionkey: this.sessionkey,
        })}`, { service: 'mcoserver:NPSUserStatus' });
    }
}
exports.NPSUserStatus = NPSUserStatus;
//# sourceMappingURL=nps-user-status.js.map