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
exports.socketWriteIfOpen = exports.encryptIfNeeded = exports.compressIfNeeded = exports.MCOTServer = void 0;
var index_1 = require("../logger/index");
var index_2 = require("../types/index");
var index_3 = require("../message-types/index");
var database_1 = require("../database");
var log = index_1.logger.child({ service: "mcoserver:MCOTSServer" });
/**
 * Manages the game database server
 */
var MCOTServer = /** @class */ (function () {
    function MCOTServer() {
        this.databaseManager = database_1.DatabaseManager.getInstance();
    }
    MCOTServer.getInstance = function () {
        if (!MCOTServer._instance) {
            MCOTServer._instance = new MCOTServer();
        }
        return MCOTServer._instance;
    };
    /**
     * Return the string representation of the numeric opcode
     *
     * @param {number} msgID
     * @return {string}
     */
    MCOTServer.prototype._MSG_STRING = function (messageID) {
        switch (messageID) {
            case 105:
                return "MC_LOGIN";
            case 106:
                return "MC_LOGOUT";
            case 109:
                return "MC_SET_OPTIONS";
            case 141:
                return "MC_STOCK_CAR_INFO";
            case 213:
                return "MC_LOGIN_COMPLETE";
            case 266:
                return "MC_UPDATE_PLAYER_PHYSICAL";
            case 324:
                return "MC_GET_LOBBIES";
            case 325:
                return "MC_LOBBIES";
            case 438:
                return "MC_CLIENT_CONNECT_MSG";
            case 440:
                return "MC_TRACKING_MSG";
            default:
                return "Unknown";
        }
    };
    /**
     *
     * @param {ConnectionObj} connection
     * @param {MessageNode} node
     * @return {Promise<ConnectionWithPackets}>}
     */
    MCOTServer.prototype._login = function (connection, node) {
        return __awaiter(this, void 0, void 0, function () {
            var pReply, rPacket;
            return __generator(this, function (_a) {
                pReply = new index_3.GenericReplyMessage();
                pReply.msgNo = 213;
                pReply.msgReply = 105;
                pReply.appId = connection.appId;
                rPacket = new index_3.MessageNode(index_2.EMessageDirection.SENT);
                rPacket.deserialize(node.serialize());
                rPacket.updateBuffer(pReply.serialize());
                rPacket.dumpPacket();
                return [2 /*return*/, { connection: connection, packetList: [rPacket] }];
            });
        });
    };
    /**
     *
     * @param {ConnectionObj} connection
     * @param {MessageNode} node
     * @return {Promise<ConnectionWithPackets>}
     */
    MCOTServer.prototype._getLobbies = function (connection, node) {
        return __awaiter(this, void 0, void 0, function () {
            var lobbiesListMessage, pReply, rPacket, lobby;
            return __generator(this, function (_a) {
                log.debug("In _getLobbies...");
                lobbiesListMessage = node;
                // Update the appId
                lobbiesListMessage.appId = connection.appId;
                // Dump the packet
                log.debug("Dumping request...");
                log.debug(JSON.stringify(lobbiesListMessage));
                pReply = new index_3.GenericReplyMessage();
                pReply.msgNo = 325;
                pReply.msgReply = 324;
                rPacket = new index_3.MessageNode(index_2.EMessageDirection.SENT);
                rPacket.flags = 9;
                lobby = Buffer.alloc(12);
                lobby.writeInt32LE(325, 0);
                lobby.writeInt32LE(0, 4);
                lobby.writeInt32LE(0, 8);
                rPacket.updateBuffer(pReply.serialize());
                // // Dump the packet
                log.debug("Dumping response...");
                log.debug(JSON.stringify(rPacket));
                return [2 /*return*/, { connection: connection, packetList: [rPacket] }];
            });
        });
    };
    /**
     *
     * @param {module:ConnectionObj} connection
     * @param {module:MessageNode} node
     * @return {Promise<{con: ConnectionObj, nodes: MessageNode[]}>}
     */
    MCOTServer.prototype._logout = function (connection, node) {
        return __awaiter(this, void 0, void 0, function () {
            var logoutMessage, pReply, rPacket, nodes;
            return __generator(this, function (_a) {
                logoutMessage = node;
                logoutMessage.data = node.serialize();
                // Update the appId
                logoutMessage.appId = connection.appId;
                pReply = new index_3.GenericReplyMessage();
                pReply.msgNo = 101;
                pReply.msgReply = 106;
                rPacket = new index_3.MessageNode(index_2.EMessageDirection.SENT);
                rPacket.deserialize(node.serialize());
                rPacket.updateBuffer(pReply.serialize());
                rPacket.dumpPacket();
                nodes = [];
                return [2 /*return*/, { connection: connection, packetList: nodes }];
            });
        });
    };
    /**
     *
     * @param {ConnectionObj} connection
     * @param {MessageNode} node
     * @return {Promise<ConnectionWithPackets>}
     */
    MCOTServer.prototype._setOptions = function (connection, node) {
        return __awaiter(this, void 0, void 0, function () {
            var setOptionsMessage, pReply, rPacket;
            return __generator(this, function (_a) {
                setOptionsMessage = node;
                setOptionsMessage.data = node.serialize();
                // Update the appId
                setOptionsMessage.appId = connection.appId;
                pReply = new index_3.GenericReplyMessage();
                pReply.msgNo = 101;
                pReply.msgReply = 109;
                rPacket = new index_3.MessageNode(index_2.EMessageDirection.SENT);
                rPacket.deserialize(node.serialize());
                rPacket.updateBuffer(pReply.serialize());
                rPacket.dumpPacket();
                return [2 /*return*/, { connection: connection, packetList: [rPacket] }];
            });
        });
    };
    /**
     *
     * @param {ConnectionObj} connection
     * @param {MessageNode} node
     * @return {Promise<ConnectionWithPackets>}
     */
    MCOTServer.prototype._trackingMessage = function (connection, node) {
        return __awaiter(this, void 0, void 0, function () {
            var trackingMessage, pReply, rPacket;
            return __generator(this, function (_a) {
                trackingMessage = node;
                trackingMessage.data = node.serialize();
                // Update the appId
                trackingMessage.appId = connection.appId;
                pReply = new index_3.GenericReplyMessage();
                pReply.msgNo = 101;
                pReply.msgReply = 440;
                rPacket = new index_3.MessageNode(index_2.EMessageDirection.SENT);
                rPacket.deserialize(node.serialize());
                rPacket.updateBuffer(pReply.serialize());
                rPacket.dumpPacket();
                return [2 /*return*/, { connection: connection, packetList: [rPacket] }];
            });
        });
    };
    /**
     *
     * @param {module:ConnectionObj} connection
     * @param {module:MessageNode} node
     * @return {Promise<ConnectionWithPackets>}
     */
    MCOTServer.prototype._updatePlayerPhysical = function (connection, node) {
        return __awaiter(this, void 0, void 0, function () {
            var updatePlayerPhysicalMessage, pReply, rPacket;
            return __generator(this, function (_a) {
                updatePlayerPhysicalMessage = node;
                updatePlayerPhysicalMessage.data = node.serialize();
                // Update the appId
                updatePlayerPhysicalMessage.appId = connection.appId;
                pReply = new index_3.GenericReplyMessage();
                pReply.msgNo = 101;
                pReply.msgReply = 266;
                rPacket = new index_3.MessageNode(index_2.EMessageDirection.SENT);
                rPacket.deserialize(node.serialize());
                rPacket.updateBuffer(pReply.serialize());
                rPacket.dumpPacket();
                return [2 /*return*/, { connection: connection, packetList: [rPacket] }];
            });
        });
    };
    MCOTServer.prototype.getStockCarInfo = function (connection, packet) {
        return __awaiter(this, void 0, void 0, function () {
            var getStockCarInfoMessage, stockCarInfoMessage, responsePacket;
            return __generator(this, function (_a) {
                getStockCarInfoMessage = new index_3.GenericRequestMessage();
                getStockCarInfoMessage.deserialize(packet.data);
                getStockCarInfoMessage.dumpPacket();
                stockCarInfoMessage = new index_3.StockCarInfoMessage(200, 0, 105);
                stockCarInfoMessage.starterCash = 200;
                stockCarInfoMessage.dealerId = 8;
                stockCarInfoMessage.brand = 105;
                stockCarInfoMessage.addStockCar(new index_3.StockCar(113, 20, 0)); // Bel-air
                stockCarInfoMessage.addStockCar(new index_3.StockCar(104, 15, 1)); // Fairlane - Deal of the day
                stockCarInfoMessage.addStockCar(new index_3.StockCar(402, 20, 0)); // Century
                stockCarInfoMessage.dumpPacket();
                responsePacket = new index_3.MessageNode(index_2.EMessageDirection.SENT);
                responsePacket.deserialize(packet.serialize());
                responsePacket.updateBuffer(stockCarInfoMessage.serialize());
                responsePacket.dumpPacket();
                return [2 /*return*/, { connection: connection, packetList: [responsePacket] }];
            });
        });
    };
    /**
     * @param {ConnectionObj} connection
     * @param {MessageNode} packet
     * @return {Promise<{con: ConnectionObj, nodes: MessageNode[]}>}
     */
    MCOTServer.prototype.clientConnect = function (connection, packet) {
        return __awaiter(this, void 0, void 0, function () {
            var newMessage, result, connectionWithKey, customerId, personaId, personaName, sessionkey, stringKey, genericReplyMessage, responsePacket;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newMessage = new index_3.ClientConnectMessage(packet.data);
                        log.debug("[TCPManager] Looking up the session key for ".concat(newMessage.customerId, "..."));
                        return [4 /*yield*/, this.databaseManager.fetchSessionKeyByCustomerId(newMessage.customerId)];
                    case 1:
                        result = _a.sent();
                        log.debug("[TCPManager] Session Key located!");
                        connectionWithKey = connection;
                        customerId = newMessage.customerId, personaId = newMessage.personaId, personaName = newMessage.personaName;
                        sessionkey = result.sessionkey;
                        stringKey = Buffer.from(sessionkey, "hex");
                        connectionWithKey.setEncryptionKey(Buffer.from(stringKey.slice(0, 16)));
                        // Update the connection's appId
                        connectionWithKey.appId = newMessage.getAppId();
                        log.debug("cust: ".concat(customerId, " ID: ").concat(personaId, " Name: ").concat(personaName));
                        genericReplyMessage = new index_3.GenericReplyMessage();
                        genericReplyMessage.msgNo = 101;
                        genericReplyMessage.msgReply = 438;
                        responsePacket = new index_3.MessageNode(index_2.EMessageDirection.SENT);
                        responsePacket.deserialize(packet.serialize());
                        responsePacket.updateBuffer(genericReplyMessage.serialize());
                        responsePacket.dumpPacket();
                        return [2 /*return*/, { connection: connection, packetList: [responsePacket] }];
                }
            });
        });
    };
    /**
     * Route or process MCOTS commands
     * @param {MessageNode} node
     * @param {ConnectionObj} conn
     * @return {Promise<ConnectionObj>}
     */
    MCOTServer.prototype.processInput = function (node, conn) {
        return __awaiter(this, void 0, void 0, function () {
            var currentMessageNo, currentMessageString, _a, result, responsePackets, error_1, result, responsePackets, error_2, result, responsePackets, error_3, result, responsePackets, error_4, result, responsePackets, error_5, result, responsePackets, error_6, result, responsePackets, error_7, result, responsePackets, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        currentMessageNo = node.msgNo;
                        currentMessageString = this._MSG_STRING(currentMessageNo);
                        _a = currentMessageString;
                        switch (_a) {
                            case "MC_SET_OPTIONS": return [3 /*break*/, 1];
                            case "MC_TRACKING_MSG": return [3 /*break*/, 5];
                            case "MC_UPDATE_PLAYER_PHYSICAL": return [3 /*break*/, 8];
                            case "MC_CLIENT_CONNECT_MSG": return [3 /*break*/, 11];
                            case "MC_LOGIN": return [3 /*break*/, 15];
                            case "MC_LOGOUT": return [3 /*break*/, 18];
                            case "MC_GET_LOBBIES": return [3 /*break*/, 22];
                            case "MC_STOCK_CAR_INFO": return [3 /*break*/, 27];
                        }
                        return [3 /*break*/, 30];
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this._setOptions(conn, node)];
                    case 2:
                        result = _b.sent();
                        responsePackets = result.packetList;
                        return [4 /*yield*/, socketWriteIfOpen(result.connection, responsePackets)];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4:
                        error_1 = _b.sent();
                        if (error_1 instanceof Error) {
                            throw new TypeError("Error in MC_SET_OPTIONS: ".concat(error_1));
                        }
                        throw new Error("Error in MC_SET_OPTIONS, error unknown");
                    case 5:
                        _b.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this._trackingMessage(conn, node)];
                    case 6:
                        result = _b.sent();
                        responsePackets = result.packetList;
                        return [2 /*return*/, socketWriteIfOpen(result.connection, responsePackets)];
                    case 7:
                        error_2 = _b.sent();
                        if (error_2 instanceof Error) {
                            throw new TypeError("Error in MC_TRACKING_MSG: ".concat(error_2.message));
                        }
                        throw new Error("Error in MC_TRACKING_MSG, error unknown");
                    case 8:
                        _b.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, this._updatePlayerPhysical(conn, node)];
                    case 9:
                        result = _b.sent();
                        responsePackets = result.packetList;
                        return [2 /*return*/, socketWriteIfOpen(result.connection, responsePackets)];
                    case 10:
                        error_3 = _b.sent();
                        if (error_3 instanceof Error) {
                            throw new TypeError("Error in MC_UPDATE_PLAYER_PHYSICAL: ".concat(error_3.message));
                        }
                        throw new Error("Error in MC_UPDATE_PLAYER_PHYSICAL, error unknown");
                    case 11:
                        _b.trys.push([11, 14, , 15]);
                        return [4 /*yield*/, this.clientConnect(conn, node)];
                    case 12:
                        result = _b.sent();
                        responsePackets = result.packetList;
                        return [4 /*yield*/, socketWriteIfOpen(result.connection, responsePackets)];
                    case 13: 
                    // Write the socket
                    return [2 /*return*/, _b.sent()];
                    case 14:
                        error_4 = _b.sent();
                        if (error_4 instanceof Error) {
                            throw new TypeError("[TCPManager] Error writing to socket: ".concat(error_4.message));
                        }
                        throw new Error("[TCPManager] Error writing to socket, error unknown");
                    case 15:
                        _b.trys.push([15, 17, , 18]);
                        return [4 /*yield*/, this._login(conn, node)];
                    case 16:
                        result = _b.sent();
                        responsePackets = result.packetList;
                        // Write the socket
                        return [2 /*return*/, socketWriteIfOpen(result.connection, responsePackets)];
                    case 17:
                        error_5 = _b.sent();
                        if (error_5 instanceof Error) {
                            throw new TypeError("[TCPManager] Error writing to socket: ".concat(error_5));
                        }
                        throw new Error("[TCPManager] Error writing to socket, error unknown");
                    case 18:
                        _b.trys.push([18, 21, , 22]);
                        return [4 /*yield*/, this._logout(conn, node)];
                    case 19:
                        result = _b.sent();
                        responsePackets = result.packetList;
                        return [4 /*yield*/, socketWriteIfOpen(result.connection, responsePackets)];
                    case 20: 
                    // Write the socket
                    return [2 /*return*/, _b.sent()];
                    case 21:
                        error_6 = _b.sent();
                        if (error_6 instanceof Error) {
                            throw new TypeError("[TCPManager] Error writing to socket: ".concat(error_6.message));
                        }
                        throw new Error("[TCPManager] Error writing to socket, error unknown");
                    case 22: return [4 /*yield*/, this._getLobbies(conn, node)];
                    case 23:
                        result = _b.sent();
                        log.debug("Dumping Lobbies response packet...");
                        log.debug(result.packetList.join().toString());
                        responsePackets = result.packetList;
                        _b.label = 24;
                    case 24:
                        _b.trys.push([24, 26, , 27]);
                        return [4 /*yield*/, socketWriteIfOpen(result.connection, responsePackets)];
                    case 25: 
                    // Write the socket
                    return [2 /*return*/, _b.sent()];
                    case 26:
                        error_7 = _b.sent();
                        if (error_7 instanceof Error) {
                            throw new TypeError("[TCPManager] Error writing to socket: ".concat(error_7));
                        }
                        throw new Error("[TCPManager] Error writing to socket, error unknown");
                    case 27:
                        _b.trys.push([27, 29, , 30]);
                        return [4 /*yield*/, this.getStockCarInfo(conn, node)];
                    case 28:
                        result = _b.sent();
                        responsePackets = result.packetList;
                        // Write the socket
                        return [2 /*return*/, socketWriteIfOpen(result.connection, responsePackets)];
                    case 29:
                        error_8 = _b.sent();
                        if (error_8 instanceof Error) {
                            throw new TypeError("[TCPManager] Error writing to socket: ".concat(error_8.message));
                        }
                        throw new Error("[TCPManager] Error writing to socket, error unknown");
                    case 30:
                        {
                            node.setAppId(conn.appId);
                            throw new Error("Message Number Not Handled: ".concat(currentMessageNo, " (").concat(currentMessageString, ")\n      conID: ").concat(node.toFrom, "  PersonaID: ").concat(node.appId));
                        }
                        _b.label = 31;
                    case 31: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @param {MessageNode} msg
     * @param {ConnectionObj} con
     * @return {Promise<ConnectionObj>}
     */
    MCOTServer.prototype.messageReceived = function (message, con) {
        return __awaiter(this, void 0, void 0, function () {
            var newConnection, encryptedBuffer, deciphered;
            return __generator(this, function (_a) {
                newConnection = con;
                if (!newConnection.useEncryption && message.flags && 0x08) {
                    log.debug("Turning on encryption");
                    newConnection.useEncryption = true;
                }
                // If not a Heartbeat
                if (message.flags !== 80 && newConnection.useEncryption) {
                    if (!newConnection.isSetupComplete) {
                        throw new Error("Decrypt() not yet setup! Disconnecting...conId: ".concat(con.id));
                    }
                    if (message.flags - 8 >= 0) {
                        try {
                            encryptedBuffer = Buffer.from(message.data);
                            log.debug("Full packet before decrypting: ".concat(encryptedBuffer.toString("hex")));
                            log.debug("Message buffer before decrypting: ".concat(encryptedBuffer.toString("hex")));
                            log.debug("Using encryption id: ".concat(newConnection.getEncryptionId()));
                            deciphered = newConnection.decryptBuffer(encryptedBuffer);
                            log.debug("Message buffer after decrypting: ".concat(deciphered.toString("hex")));
                            if (deciphered.readUInt16LE(0) <= 0) {
                                throw new Error("Failure deciphering message, exiting.");
                            }
                            // Update the MessageNode with the deciphered buffer
                            message.updateBuffer(deciphered);
                        }
                        catch (error) {
                            if (error instanceof Error) {
                                throw new TypeError("Decrypt() exception thrown! Disconnecting...conId:".concat(newConnection.id, ": ").concat(error.message));
                            }
                            throw new Error("Decrypt() exception thrown! Disconnecting...conId:".concat(newConnection.id, ", error unknown"));
                        }
                    }
                }
                // Should be good to process now
                return [2 /*return*/, this.processInput(message, newConnection)];
            });
        });
    };
    MCOTServer.prototype.defaultHandler = function (rawPacket) {
        return __awaiter(this, void 0, void 0, function () {
            var connection, data, remoteAddress, localPort, messageNode;
            return __generator(this, function (_a) {
                connection = rawPacket.connection, data = rawPacket.data;
                remoteAddress = connection.remoteAddress, localPort = connection.localPort;
                messageNode = new index_3.MessageNode(index_2.EMessageDirection.RECEIVED);
                messageNode.deserialize(data);
                log.debug("Received TCP packet',\n    ".concat(JSON.stringify({
                    localPort: localPort,
                    remoteAddress: remoteAddress,
                    direction: messageNode.direction,
                    data: rawPacket.data.toString("hex")
                })));
                messageNode.dumpPacket();
                return [2 /*return*/, this.messageReceived(messageNode, connection)];
            });
        });
    };
    return MCOTServer;
}());
exports.MCOTServer = MCOTServer;
/**
 * Manages TCP connection packet processing
 */
function compressIfNeeded(connection, packet) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // Check if compression is needed
            if (packet.getLength() < 80) {
                log.debug("Too small, should not compress");
                return [2 /*return*/, { connection: connection, packet: packet, lastError: "Too small, should not compress" }];
            }
            else {
                log.debug("This packet should be compressed");
                /* TODO: Write compression.
                 *
                 * At this time we will still send the packet, to not hang connection
                 * Client will crash though, due to memory access errors
                 */
            }
            return [2 /*return*/, { connection: connection, packet: packet }];
        });
    });
}
exports.compressIfNeeded = compressIfNeeded;
function encryptIfNeeded(connection, packet) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // Check if encryption is needed
            if (packet.flags - 8 >= 0) {
                log.debug("encryption flag is set");
                packet.updateBuffer(connection.encryptBuffer(packet.data));
                log.debug("encrypted packet: ".concat(packet.serialize().toString("hex")));
            }
            return [2 /*return*/, { connection: connection, packet: packet }];
        });
    });
}
exports.encryptIfNeeded = encryptIfNeeded;
function socketWriteIfOpen(connection, packetList) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var updatedConnection, _i, _b, packet, compressedPacket, encryptedPacket, port;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    updatedConnection = {
                        connection: connection,
                        packetList: packetList
                    };
                    _i = 0, _b = updatedConnection.packetList;
                    _c.label = 1;
                case 1:
                    if (!(_i < _b.length)) return [3 /*break*/, 5];
                    packet = _b[_i];
                    return [4 /*yield*/, compressIfNeeded(connection, packet)];
                case 2:
                    compressedPacket = (_c.sent()).packet;
                    return [4 /*yield*/, encryptIfNeeded(connection, compressedPacket)];
                case 3:
                    encryptedPacket = (_c.sent()).packet;
                    // Log that we are trying to write
                    log.debug(" Atempting to write seq: ".concat(encryptedPacket.seq, " to conn: ").concat(updatedConnection.connection.id));
                    // Log the buffer we are writing
                    log.debug("Writting buffer: ".concat(encryptedPacket.serialize().toString("hex")));
                    if (connection.sock.writable) {
                        // Write the packet to socket
                        connection.sock.write(encryptedPacket.serialize());
                    }
                    else {
                        port = ((_a = connection.sock.localPort) === null || _a === void 0 ? void 0 : _a.toString()) || "";
                        throw new Error("Error writing ".concat(encryptedPacket.serialize(), " to ").concat(connection.sock.remoteAddress, " , ").concat(port));
                    }
                    _c.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/, updatedConnection.connection];
            }
        });
    });
}
exports.socketWriteIfOpen = socketWriteIfOpen;
