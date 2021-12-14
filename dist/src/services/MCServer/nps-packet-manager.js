"use strict";
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
Object.defineProperty(exports, "__esModule", { value: true });
exports.NPSPacketManager = void 0;
const mco_logger_1 = require("@drazisil/mco-logger");
const LobbyServer_1 = require("../LobbyServer");
const LoginServer_1 = require("../LoginServer");
const persona_server_1 = require("../PersonaServer/persona-server");
const database_manager_1 = require("../shared/database-manager");
const { log } = mco_logger_1.Logger.getInstance();
class NPSPacketManager {
    database = database_manager_1.DatabaseManager.getInstance();
    npsKey;
    msgNameMapping;
    loginServer;
    personaServer;
    lobbyServer;
    serviceName;
    constructor() {
        this.npsKey = '';
        this.msgNameMapping = [
            { id: 0x1_00, name: 'NPS_LOGIN' },
            { id: 0x1_20, name: 'NPS_LOGIN_RESP' },
            { id: 0x1_28, name: 'NPS_GET_MINI_USER_LIST' },
            { id: 0x2_07, name: 'NPS_ACK' },
            { id: 0x2_17, name: 'NPS_HEATBEAT' },
            { id: 0x2_29, name: 'NPS_MINI_USER_LIST' },
            { id: 0x3_0c, name: 'NPS_SEND_MINI_RIFF_LIST' },
            { id: 0x5_01, name: 'NPS_USER_LOGIN' },
            { id: 0x5_03, name: 'NPS_REGISTER_GAME_LOGIN' },
            { id: 0x5_07, name: 'NPS_NEW_GAME_ACCOUNT' },
            { id: 0x5_32, name: 'NPS_GET_PERSONA_MAPS' },
            { id: 0x6_07, name: 'NPS_GAME_ACCOUNT_INFO' },
            { id: 0x11_01, name: 'NPS_CRYPTO_DES_CBC' },
        ];
        this.loginServer = new LoginServer_1.LoginServer();
        this.personaServer = persona_server_1.PersonaServer.getInstance();
        this.lobbyServer = new LobbyServer_1.LobbyServer();
        this.serviceName = 'mcoserver:NPSPacketManager';
    }
    /**
     *
     * @param {number} msgId
     * @return {string}
     */
    msgCodetoName(messageId) {
        const mapping = this.msgNameMapping.find(code => code.id === messageId);
        return mapping ? mapping.name : 'Unknown msgId';
    }
    /**
     *
     * @return {string}
     */
    getNPSKey() {
        return this.npsKey;
    }
    /**
     *
     * @param {string} key
     * @return {void}
     */
    setNPSKey(key) {
        this.npsKey = key;
    }
    /**
     *
     * @param {module:IRawPacket} rawPacket
     * @return {Promise<ConnectionObj>}
     */
    async processNPSPacket(rawPacket) {
        const messageId = rawPacket.data.readInt16BE(0);
        log('info', `Handling message,
      ${JSON.stringify({
            msgName: this.msgCodetoName(messageId),
            msgId: messageId,
        })}`, { service: this.serviceName });
        const { localPort } = rawPacket;
        switch (localPort) {
            case 8226:
                return this.loginServer.dataHandler(rawPacket);
            case 8228:
                return this.personaServer.dataHandler(rawPacket);
            case 7003:
                return this.lobbyServer.dataHandler(rawPacket);
            default:
                process.exitCode = -1;
                throw new Error(`[npsPacketManager] Recieved a packet',
          ${JSON.stringify({
                    msgId: messageId,
                    localPort,
                })}`);
        }
    }
}
exports.NPSPacketManager = NPSPacketManager;
//# sourceMappingURL=nps-packet-manager.js.map