"use strict";
// @ts-check
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
exports.LobbyServer = void 0;
var index_1 = require("../logger/index");
var index_2 = require("../database/index");
var index_3 = require("../types/index");
var index_4 = require("../message-types/index");
var index_5 = require("../persona/index");
var log = index_1.logger.child({ service: "mcoserver:LobbyServer" });
/**
 * Manages the game connection to the lobby and racing rooms
 * @module LobbyServer
 */
/**
 * @param {ConnectionObj} conn
 * @param {Buffer} buffer
 * @return {Promise<ConnectionObj>}
 */
function npsSocketWriteIfOpen(conn, buffer) {
    return __awaiter(this, void 0, void 0, function () {
        var sock;
        return __generator(this, function (_a) {
            sock = conn.sock;
            if (sock.writable) {
                // Write the packet to socket
                sock.write(buffer);
            }
            else {
                throw new Error("Error writing ".concat(buffer.toString("hex"), " to ").concat(sock.remoteAddress, " , ").concat(String(sock)));
            }
            return [2 /*return*/, conn];
        });
    });
}
/**
 * Takes an encrypted command packet and returns the decrypted bytes
 *
 * @return {ConnectionObj}
 * @param {ConnectionObj} con
 * @param {Buffer} cypherCmd
 */
function decryptCmd(con, cypherCmd) {
    var s = con;
    var decryptedCommand = s.decipherBufferDES(cypherCmd);
    s.decryptedCmd = decryptedCommand;
    log.debug("[Deciphered Cmd: ".concat(s.decryptedCmd.toString("hex")));
    return s;
}
/**
 * Takes an plaintext command packet and return the encrypted bytes
 *
 * @param {ConnectionObj} con
 * @param {Buffer} cypherCmd
 * @return {ConnectionObj}
 */
function encryptCmd(con, cypherCmd) {
    var s = con;
    s.encryptedCmd = s.cipherBufferDES(cypherCmd);
    return s;
}
/**
 * Takes a plaintext command packet, encrypts it, and sends it across the connection's socket
 *
 * @param {ConnectionObj} con
 * @param {Buffer} data
 * @return {Promise<ConnectionObj>}
 */
function sendCommand(con, data) {
    return __awaiter(this, void 0, void 0, function () {
        var s, decipheredCommand, incommingRequest, packetContent, packetResult, cmdEncrypted;
        return __generator(this, function (_a) {
            s = con;
            decipheredCommand = decryptCmd(s, Buffer.from(data.slice(4))).decryptedCmd;
            if (decipheredCommand === undefined) {
                throw new Error("There was an error deciphering the NPS command");
            }
            incommingRequest = new index_4.NPSMessage(index_3.EMessageDirection.RECEIVED);
            incommingRequest.deserialize(decipheredCommand);
            incommingRequest.dumpPacket();
            packetContent = Buffer.alloc(375);
            // Add the response code
            packetContent.writeUInt16BE(537, 367);
            packetContent.writeUInt16BE(257, 369);
            packetContent.writeUInt16BE(556, 371);
            log.debug("Sending a dummy response of 0x229 - NPS_MINI_USER_LIST");
            packetResult = new index_4.NPSMessage(index_3.EMessageDirection.SENT);
            packetResult.msgNo = 553;
            packetResult.setContent(packetContent);
            packetResult.dumpPacket();
            cmdEncrypted = encryptCmd(s, packetResult.getContentAsBuffer());
            if (cmdEncrypted.encryptedCmd === undefined) {
                throw new Error("There was an error ciphering the NPS command");
            }
            cmdEncrypted.encryptedCmd = Buffer.concat([
                Buffer.from([0x11, 0x01]),
                cmdEncrypted.encryptedCmd,
            ]);
            return [2 /*return*/, cmdEncrypted];
        });
    });
}
/**
 * @class
 */
var LobbyServer = /** @class */ (function () {
    function LobbyServer() {
        // Intentually empty
    }
    LobbyServer.getInstance = function () {
        if (!LobbyServer._instance) {
            LobbyServer._instance = new LobbyServer();
        }
        return LobbyServer._instance;
    };
    /**
     * @return NPSMsg}
     */
    LobbyServer.prototype._npsHeartbeat = function () {
        var packetContent = Buffer.alloc(8);
        var packetResult = new index_4.NPSMessage(index_3.EMessageDirection.SENT);
        packetResult.msgNo = 295;
        packetResult.setContent(packetContent);
        packetResult.dumpPacket();
        return packetResult;
    };
    /**
     * @param {IRawPacket} rawPacket
     * @return {Promise<ConnectionObj>}
     */
    LobbyServer.prototype.dataHandler = function (rawPacket) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, localPort, remoteAddress, connection, data, requestCode, _b, responsePacket, responsePacket, updatedConnection, encryptedCmd;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = rawPacket.connection, localPort = _a.localPort, remoteAddress = _a.remoteAddress;
                        log.debug("Received Lobby packet: ".concat(JSON.stringify({ localPort: localPort, remoteAddress: remoteAddress })));
                        connection = rawPacket.connection, data = rawPacket.data;
                        requestCode = data.readUInt16BE(0).toString(16);
                        _b = requestCode;
                        switch (_b) {
                            case "100": return [3 /*break*/, 1];
                            case "217": return [3 /*break*/, 3];
                            case "1101": return [3 /*break*/, 4];
                        }
                        return [3 /*break*/, 6];
                    case 1: return [4 /*yield*/, this._npsRequestGameConnectServer(connection, data)];
                    case 2:
                        responsePacket = _c.sent();
                        log.debug("Connect responsePacket's data prior to sending: ".concat(JSON.stringify({
                            data: responsePacket.getPacketAsString()
                        })));
                        // TODO: Investigate why this crashes retail
                        try {
                            return [2 /*return*/, npsSocketWriteIfOpen(connection, responsePacket.serialize())];
                        }
                        catch (error) {
                            if (error instanceof Error) {
                                throw new Error("Unable to send Connect packet: ".concat(error));
                            }
                            throw new Error("Unable to send Connect packet: unknown error");
                        }
                        _c.label = 3;
                    case 3:
                        {
                            responsePacket = this._npsHeartbeat();
                            log.debug("Heartbeat responsePacket's data prior to sending: ".concat(JSON.stringify({
                                data: responsePacket.getPacketAsString()
                            })));
                            return [2 /*return*/, npsSocketWriteIfOpen(connection, responsePacket.serialize())];
                        }
                        _c.label = 4;
                    case 4: return [4 /*yield*/, sendCommand(connection, data)];
                    case 5:
                        updatedConnection = _c.sent();
                        encryptedCmd = updatedConnection.encryptedCmd;
                        if (encryptedCmd === undefined) {
                            throw new Error("Error with encrypted command, dumping connection: ".concat(JSON.stringify({ updatedConnection: updatedConnection })));
                        }
                        log.debug("encrypedCommand's data prior to sending: ".concat(JSON.stringify({
                            data: encryptedCmd.toString("hex")
                        })));
                        return [2 /*return*/, npsSocketWriteIfOpen(connection, encryptedCmd)];
                    case 6: throw new Error("Unknown code ".concat(requestCode, " was received on port 7003"));
                }
            });
        });
    };
    /**
     * @param {string} key
     * @return {Buffer}
     */
    LobbyServer.prototype._generateSessionKeyBuffer = function (key) {
        var nameBuffer = Buffer.alloc(64);
        Buffer.from(key, "utf8").copy(nameBuffer);
        return nameBuffer;
    };
    /**
     * Handle a request to connect to a game server packet
     *
     * @param {ConnectionObj} connection
     * @param {Buffer} rawData
     * @return {Promise<NPSMsg>}
     */
    LobbyServer.prototype._npsRequestGameConnectServer = function (connection, rawData) {
        return __awaiter(this, void 0, void 0, function () {
            var sock, userInfo, personaManager, personas, customerId, databaseManager, keys, s, packetContent, packetResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sock = connection.sock;
                        log.debug("_npsRequestGameConnectServer: ".concat(JSON.stringify({
                            remoteAddress: sock.remoteAddress,
                            data: rawData.toString("hex")
                        })));
                        userInfo = new index_4.NPSUserInfo(index_3.EMessageDirection.RECEIVED);
                        userInfo.deserialize(rawData);
                        userInfo.dumpInfo();
                        personaManager = index_5.PersonaServer.getInstance();
                        return [4 /*yield*/, personaManager.getPersonasByPersonaId(userInfo.userId)];
                    case 1:
                        personas = _a.sent();
                        if (typeof personas[0] === "undefined") {
                            throw new Error("No personas found.");
                        }
                        customerId = personas[0].customerId;
                        databaseManager = index_2.DatabaseManager.getInstance();
                        return [4 /*yield*/, databaseManager
                                .fetchSessionKeyByCustomerId(customerId)["catch"](function (error) {
                                if (error instanceof Error) {
                                    log.debug("Unable to fetch session key for customerId ".concat(customerId.toString(), ": ").concat(error.message, ")}"));
                                }
                                log.error("Unable to fetch session key for customerId ".concat(customerId.toString(), ": unknown error}"));
                                return undefined;
                            })];
                    case 2:
                        keys = _a.sent();
                        if (keys === undefined) {
                            throw new Error("Error fetching session keys!");
                        }
                        s = connection;
                        // Create the cypher and decipher only if not already set
                        if (!s.isLobbyKeysetReady()) {
                            try {
                                s.setEncryptionKeyDES(keys.skey);
                            }
                            catch (error) {
                                if (error instanceof Error) {
                                    throw new TypeError("Unable to set session key: ".concat(JSON.stringify({ keys: keys, error: error })));
                                }
                                throw new Error("Unable to set session key: ".concat(JSON.stringify({
                                    keys: keys,
                                    error: "unknown"
                                })));
                            }
                        }
                        packetContent = Buffer.alloc(72);
                        // This response is a NPS_UserStatus
                        // Ban and Gag
                        // NPS_USERID - User ID - persona id - long
                        Buffer.from([0x00, 0x84, 0x5f, 0xed]).copy(packetContent);
                        // SessionKeyStr (32)
                        this._generateSessionKeyBuffer(keys.sessionkey).copy(packetContent, 4);
                        // // SessionKeyLen - int
                        packetContent.writeInt16BE(32, 66);
                        packetResult = new index_4.NPSMessage(index_3.EMessageDirection.SENT);
                        packetResult.msgNo = 288;
                        packetResult.setContent(packetContent);
                        packetResult.dumpPacket();
                        return [2 /*return*/, packetResult];
                }
            });
        });
    };
    return LobbyServer;
}());
exports.LobbyServer = LobbyServer;
