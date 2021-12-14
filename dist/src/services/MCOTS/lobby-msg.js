"use strict";
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
Object.defineProperty(exports, "__esModule", { value: true });
exports.LobbyMessage = void 0;
const mco_logger_1 = require("@drazisil/mco-logger");
const lobby_info_1 = require("./lobby-info");
const { log } = mco_logger_1.Logger.getInstance();
/**
 * @class
 * @property {number} msgNo
 * @property {number} noLobbies
 * @property {0 | 1} moreToCome
 * @property {LobbyInfoPacket} lobbyList
 * @property {number} dataLength
 * @property {Buffer} data
 */
class LobbyMessage {
    msgNo;
    noLobbies;
    moreToCome;
    lobbyList;
    dataLength;
    data;
    serviceName;
    /**
     *
     */
    constructor() {
        this.msgNo = 325;
        this.noLobbies = 1;
        this.moreToCome = 0;
        this.lobbyList = new lobby_info_1.LobbyInfoPacket();
        // The expected length here is 572
        this.dataLength = this.lobbyList.toPacket().length + 5;
        if (this.dataLength !== 572) {
            throw new Error(`Unexpected length of packet! Expected 572, recieved ${this.dataLength}`);
        }
        this.data = Buffer.alloc(this.dataLength);
        this.data.writeInt16LE(this.msgNo, 0);
        this.data.writeInt16LE(this.noLobbies, 2);
        this.data.writeInt8(this.moreToCome, 4);
        this.lobbyList.toPacket().copy(this.data, 5);
        this.serviceName = 'mcoserver:LobbyMsg';
    }
    /**
     *
     * @return {Buffer}
     */
    serialize() {
        return this.data;
    }
    /**
     * DumpPacket
     * @return {void}
     */
    dumpPacket() {
        log('debug', `LobbyMsg',
      ${JSON.stringify({
            msgNo: this.msgNo,
            dataLength: this.dataLength,
            packet: this.serialize().toString('hex'),
        })}`, { service: this.serviceName });
    }
}
exports.LobbyMessage = LobbyMessage;
//# sourceMappingURL=lobby-msg.js.map