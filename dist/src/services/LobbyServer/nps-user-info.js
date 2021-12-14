"use strict";
// @ts-check
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
Object.defineProperty(exports, "__esModule", { value: true });
exports.NPSUserInfo = void 0;
const mco_logger_1 = require("@drazisil/mco-logger");
const nps_msg_1 = require("../MCOTS/nps-msg");
const { log } = mco_logger_1.Logger.getInstance();
/**
 * @module NPSUserInfo
 */
/**
 * @class
 * @extends {NPSMsg}
 * @property {number} userId
 * @property {Buffer} userName
 * @property {Buffer} userData
 */
class NPSUserInfo extends nps_msg_1.NPSMessage {
    userId;
    userName;
    userData;
    /**
     *
     * @param {MESSAGE_DIRECTION} direction
     */
    constructor(direction) {
        super(direction);
        this.userId = 0;
        this.userName = Buffer.from([0x00]); // 30 length
        this.userData = Buffer.from([0x00]); // 64 length
        this.serviceName = 'mcoserver:NPSUserInfo';
    }
    /**
     *
     * @param {Buffer} rawData
     * @return {NPSUserInfo}
     */
    deserialize(rawData) {
        this.userId = rawData.readInt32BE(4);
        this.userName = rawData.slice(8, 38);
        this.userData = rawData.slice(38);
        return this;
    }
    /**
     * @return {void}
     */
    dumpInfo() {
        this.dumpPacketHeader('NPSUserInfo');
        log('debug', `UserId:        ${this.userId}`, { service: this.serviceName });
        log('debug', `UserName:      ${this.userName.toString()}`, {
            service: this.serviceName,
        });
        log('debug', `UserData:      ${this.userData.toString('hex')}`, {
            service: this.serviceName,
        });
        log('debug', '[/NPSUserInfo]======================================', {
            service: this.serviceName,
        });
    }
}
exports.NPSUserInfo = NPSUserInfo;
//# sourceMappingURL=nps-user-info.js.map