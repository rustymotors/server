"use strict";
// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.NPSPacketManager = void 0;
var index_1 = require("../logger/index");
var index_2 = require("../database/index");
var index_3 = require("../lobby/index");
var index_4 = require("../login/index");
var index_5 = require("../persona/index");
var log = index_1.logger.child({ service: "mcoserver:NPSPacketManager" });
var NPSPacketManager = /** @class */ (function () {
    function NPSPacketManager() {
        this.database = index_2.DatabaseManager.getInstance();
        this.npsKey = "";
        this.msgNameMapping = [
            { id: 256, name: "NPS_LOGIN" },
            { id: 288, name: "NPS_LOGIN_RESP" },
            { id: 296, name: "NPS_GET_MINI_USER_LIST" },
            { id: 519, name: "NPS_ACK" },
            { id: 535, name: "NPS_HEATBEAT" },
            { id: 553, name: "NPS_MINI_USER_LIST" },
            { id: 780, name: "NPS_SEND_MINI_RIFF_LIST" },
            { id: 1281, name: "NPS_USER_LOGIN" },
            { id: 1283, name: "NPS_REGISTER_GAME_LOGIN" },
            { id: 1287, name: "NPS_NEW_GAME_ACCOUNT" },
            { id: 1330, name: "NPS_GET_PERSONA_MAPS" },
            { id: 1543, name: "NPS_GAME_ACCOUNT_INFO" },
            { id: 4353, name: "NPS_CRYPTO_DES_CBC" },
        ];
        this.loginServer = index_4.LoginServer.getInstance();
        this.personaServer = index_5.PersonaServer.getInstance();
        this.lobbyServer = index_3.LobbyServer.getInstance();
    }
    /**
     *
     * @param {number} msgId
     * @return {string}
     */
    NPSPacketManager.prototype.msgCodetoName = function (messageId) {
        var mapping = this.msgNameMapping.find(function (code) { return code.id === messageId; });
        return mapping ? mapping.name : "Unknown msgId";
    };
    /**
     *
     * @return {string}
     */
    NPSPacketManager.prototype.getNPSKey = function () {
        return this.npsKey;
    };
    /**
     *
     * @param {string} key
     * @return {void}
     */
    NPSPacketManager.prototype.setNPSKey = function (key) {
        this.npsKey = key;
    };
    /**
     *
     * @param {module:IRawPacket} rawPacket
     * @return {Promise<ConnectionObj>}
     */
    NPSPacketManager.prototype.processNPSPacket = function (rawPacket) {
        return __awaiter(this, void 0, void 0, function () {
            var messageId, localPort;
            return __generator(this, function (_a) {
                messageId = rawPacket.data.readInt16BE(0);
                log.info("Handling message,\n      ".concat(JSON.stringify({
                    msgName: this.msgCodetoName(messageId),
                    msgId: messageId
                })));
                localPort = rawPacket.connection.localPort;
                switch (localPort) {
                    case 8226:
                        return [2 /*return*/, this.loginServer.dataHandler(rawPacket)];
                    case 8228:
                        return [2 /*return*/, this.personaServer.dataHandler(rawPacket)];
                    case 7003:
                        return [2 /*return*/, this.lobbyServer.dataHandler(rawPacket)];
                    default:
                        process.exitCode = -1;
                        throw new Error("[npsPacketManager] Recieved a packet',\n          ".concat(JSON.stringify({
                            msgId: messageId,
                            localPort: localPort
                        })));
                }
                return [2 /*return*/];
            });
        });
    };
    return NPSPacketManager;
}());
exports.NPSPacketManager = NPSPacketManager;
