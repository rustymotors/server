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
exports.PersonaServer = void 0;
var index_1 = require("../logger/index");
var index_2 = require("../types/index");
var index_3 = require("../message-types/index");
var log = index_1.logger.child({ service: "mcoserver:PersonaServer" });
/**
 * @class
 * @property {IPersonaRecord[]} personaList
 */
var PersonaServer = /** @class */ (function () {
    function PersonaServer() {
        this.personaList = [
            {
                customerId: 2868969472,
                id: Buffer.from([0x00, 0x00, 0x00, 0x01]),
                maxPersonas: Buffer.from([0x01]),
                name: this._generateNameBuffer("Doc Joe"),
                personaCount: Buffer.from([0x00, 0x01]),
                shardId: Buffer.from([0x00, 0x00, 0x00, 0x2c])
            },
            {
                customerId: 5551212,
                id: Buffer.from([0x00, 0x84, 0x5f, 0xed]),
                maxPersonas: Buffer.from([0x02]),
                name: this._generateNameBuffer("Dr Brown"),
                personaCount: Buffer.from([0x00, 0x01]),
                shardId: Buffer.from([0x00, 0x00, 0x00, 0x2c])
            },
            {
                customerId: 5551212,
                id: Buffer.from([0x00, 0x84, 0x5f, 0xee]),
                maxPersonas: Buffer.from([0x02]),
                name: this._generateNameBuffer("Morty Dr"),
                personaCount: Buffer.from([0x00, 0x01]),
                shardId: Buffer.from([0x00, 0x00, 0x00, 0x2c])
            },
        ];
    }
    PersonaServer.getInstance = function () {
        if (!PersonaServer._instance) {
            PersonaServer._instance = new PersonaServer();
        }
        return PersonaServer._instance;
    };
    PersonaServer.prototype._generateNameBuffer = function (name) {
        var nameBuffer = Buffer.alloc(30);
        Buffer.from(name, "utf8").copy(nameBuffer);
        return nameBuffer;
    };
    PersonaServer.prototype.handleSelectGamePersona = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var requestPacket, packetContent, responsePacket;
            return __generator(this, function (_a) {
                log.debug("_npsSelectGamePersona...");
                requestPacket = new index_3.NPSMessage(index_2.EMessageDirection.RECEIVED).deserialize(data);
                log.debug("NPSMsg request object from _npsSelectGamePersona: ".concat(JSON.stringify({
                    NPSMsg: requestPacket.toJSON()
                })));
                requestPacket.dumpPacket();
                packetContent = Buffer.alloc(251);
                responsePacket = new index_3.NPSMessage(index_2.EMessageDirection.SENT);
                responsePacket.msgNo = 519;
                responsePacket.setContent(packetContent);
                log.debug("NPSMsg response object from _npsSelectGamePersona',\n      ".concat(JSON.stringify({
                    NPSMsg: responsePacket.toJSON()
                })));
                responsePacket.dumpPacket();
                log.debug("[npsSelectGamePersona] responsePacket's data prior to sending: ".concat(responsePacket.getPacketAsString()));
                return [2 /*return*/, responsePacket];
            });
        });
    };
    PersonaServer.prototype.createNewGameAccount = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var requestPacket, rPacket;
            return __generator(this, function (_a) {
                requestPacket = new index_3.NPSMessage(index_2.EMessageDirection.RECEIVED).deserialize(data);
                log.debug("NPSMsg request object from _npsNewGameAccount',\n      ".concat(JSON.stringify({
                    NPSMsg: requestPacket.toJSON()
                })));
                requestPacket.dumpPacket();
                rPacket = new index_3.NPSMessage(index_2.EMessageDirection.SENT);
                rPacket.msgNo = 1537;
                log.debug("NPSMsg response object from _npsNewGameAccount',\n      ".concat(JSON.stringify({
                    NPSMsg: rPacket.toJSON()
                })));
                rPacket.dumpPacket();
                return [2 /*return*/, rPacket];
            });
        });
    };
    //  * TODO: Change the persona record to show logged out. This requires it to exist first, it is currently hard-coded
    //  * TODO: Locate the connection and delete, or reset it.
    PersonaServer.prototype.logoutGameUser = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var requestPacket, packetContent, responsePacket;
            return __generator(this, function (_a) {
                log.debug("[personaServer] Logging out persona...");
                requestPacket = new index_3.NPSMessage(index_2.EMessageDirection.RECEIVED).deserialize(data);
                log.debug("NPSMsg request object from _npsLogoutGameUser',\n      ".concat(JSON.stringify({
                    NPSMsg: requestPacket.toJSON()
                })));
                requestPacket.dumpPacket();
                packetContent = Buffer.alloc(257);
                responsePacket = new index_3.NPSMessage(index_2.EMessageDirection.SENT);
                responsePacket.msgNo = 1554;
                responsePacket.setContent(packetContent);
                log.debug("NPSMsg response object from _npsLogoutGameUser',\n      ".concat(JSON.stringify({
                    NPSMsg: responsePacket.toJSON()
                })));
                responsePacket.dumpPacket();
                log.debug("[npsLogoutGameUser] responsePacket's data prior to sending: ".concat(responsePacket.getPacketAsString()));
                return [2 /*return*/, responsePacket];
            });
        });
    };
    /**
     * Handle a check token packet
     *
     * @param {Buffer} data
     * @return {Promise<NPSMsg>}
     */
    PersonaServer.prototype.validateLicencePlate = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var requestPacket, customerId, plateName, packetContent, responsePacket;
            return __generator(this, function (_a) {
                log.debug("_npsCheckToken...");
                requestPacket = new index_3.NPSMessage(index_2.EMessageDirection.RECEIVED).deserialize(data);
                log.debug("NPSMsg request object from _npsCheckToken',\n      ".concat(JSON.stringify({
                    NPSMsg: requestPacket.toJSON()
                })));
                requestPacket.dumpPacket();
                customerId = data.readInt32BE(12);
                plateName = data.slice(17).toString();
                log.debug("customerId: ".concat(customerId));
                log.debug("Plate name: ".concat(plateName));
                packetContent = Buffer.alloc(256);
                responsePacket = new index_3.NPSMessage(index_2.EMessageDirection.SENT);
                responsePacket.msgNo = 519;
                responsePacket.setContent(packetContent);
                log.debug("NPSMsg response object from _npsCheckToken',\n      ".concat(JSON.stringify({
                    NPSMsg: responsePacket.toJSON()
                })));
                responsePacket.dumpPacket();
                log.debug("[npsCheckToken] responsePacket's data prior to sending: ".concat(responsePacket.getPacketAsString()));
                return [2 /*return*/, responsePacket];
            });
        });
    };
    /**
     * Handle a get persona maps packet
     *
     * @param {Buffer} data
     * @return {Promise<NPSMsg>}
     */
    PersonaServer.prototype.validatePersonaName = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var requestPacket, customerId, requestedPersonaName, serviceName, packetContent, responsePacket;
            return __generator(this, function (_a) {
                log.debug("_npsValidatePersonaName...");
                requestPacket = new index_3.NPSMessage(index_2.EMessageDirection.RECEIVED).deserialize(data);
                log.debug("NPSMsg request object from _npsValidatePersonaName',\n      ".concat(JSON.stringify({
                    NPSMsg: requestPacket.toJSON()
                })));
                requestPacket.dumpPacket();
                customerId = data.readInt32BE(12);
                requestedPersonaName = data
                    .slice(18, data.lastIndexOf(0x00))
                    .toString();
                serviceName = data.slice(data.indexOf(0x0a) + 1).toString();
                log.debug(JSON.stringify({ customerId: customerId, requestedPersonaName: requestedPersonaName, serviceName: serviceName }));
                packetContent = Buffer.alloc(256);
                responsePacket = new index_3.NPSMessage(index_2.EMessageDirection.SENT);
                responsePacket.msgNo = 1537;
                responsePacket.setContent(packetContent);
                log.debug("NPSMsg response object from _npsValidatePersonaName',\n      ".concat(JSON.stringify({
                    NPSMsg: responsePacket.toJSON()
                })));
                responsePacket.dumpPacket();
                log.debug("[npsValidatePersonaName] responsePacket's data prior to sending: ".concat(responsePacket.getPacketAsString()));
                return [2 /*return*/, responsePacket];
            });
        });
    };
    /**
     *
     *
     * @param {Socket} socket
     * @param {NPSMsg} packet
     * @return {void}
     * @memberof PersonaServer
     */
    PersonaServer.prototype.sendPacket = function (socket, packet) {
        try {
            socket.write(packet.serialize());
        }
        catch (error) {
            if (error instanceof Error) {
                throw new TypeError("Unable to send packet: ".concat(error));
            }
            throw new Error("Unable to send packet, error unknown");
        }
    };
    /**
     *
     * @param {number} customerId
     * @return {Promise<IPersonaRecord[]>}
     */
    PersonaServer.prototype.getPersonasByCustomerId = function (customerId) {
        var results = this.personaList.filter(function (persona) { return persona.customerId === customerId; });
        return results;
    };
    /**
     *
     * @param {number} id
     * @return {Promise<IPersonaRecord[]>}
     */
    PersonaServer.prototype.getPersonasByPersonaId = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                results = this.personaList.filter(function (persona) {
                    var match = id === persona.id.readInt32BE(0);
                    return match;
                });
                if (results.length === 0) {
                    throw new Error("Unable to locate a persona for id: ".concat(id));
                }
                return [2 /*return*/, results];
            });
        });
    };
    /**
     * Lookup all personas owned by the customer id
     * TODO: Store in a database, instead of being hard-coded
     *
     * @param {number} customerId
     * @return {Promise<IPersonaRecord[]>}
     */
    PersonaServer.prototype.getPersonaMapsByCustomerId = function (customerId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (customerId) {
                    case 2868969472:
                    case 5551212:
                        return [2 /*return*/, this.getPersonasByCustomerId(customerId)];
                    default:
                        return [2 /*return*/, []];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle a get persona maps packet
     * @param {Buffer} data
     * @return {Promise<NPSMsg>}
     */
    PersonaServer.prototype.getPersonaMaps = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var requestPacket, customerId, personas, responsePacket, personaMapsMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log.debug("_npsGetPersonaMaps...");
                        requestPacket = new index_3.NPSMessage(index_2.EMessageDirection.RECEIVED).deserialize(data);
                        log.debug("NPSMsg request object from _npsGetPersonaMaps',\n      ".concat(JSON.stringify({
                            NPSMsg: requestPacket.toJSON()
                        })));
                        log.debug("NPSMsg request object from _npsGetPersonaMaps',\n      ".concat(JSON.stringify({
                            NPSMsg: requestPacket.toJSON()
                        })));
                        requestPacket.dumpPacket();
                        customerId = Buffer.alloc(4);
                        data.copy(customerId, 0, 12);
                        return [4 /*yield*/, this.getPersonaMapsByCustomerId(customerId.readUInt32BE(0))];
                    case 1:
                        personas = _a.sent();
                        log.debug("".concat(personas.length, " personas found for ").concat(customerId.readUInt32BE(0)));
                        personaMapsMessage = new index_3.NPSPersonaMapsMessage(index_2.EMessageDirection.SENT);
                        if (personas.length === 0) {
                            throw new Error("No personas found for customer Id: ".concat(customerId.readUInt32BE(0)));
                        }
                        else {
                            try {
                                personaMapsMessage.loadMaps(personas);
                                responsePacket = new index_3.NPSMessage(index_2.EMessageDirection.SENT);
                                responsePacket.msgNo = 1543;
                                responsePacket.setContent(personaMapsMessage.serialize());
                                log.debug("NPSMsg response object from _npsGetPersonaMaps: ".concat(JSON.stringify({
                                    NPSMsg: responsePacket.toJSON()
                                })));
                                responsePacket.dumpPacket();
                            }
                            catch (error) {
                                if (error instanceof Error) {
                                    throw new TypeError("Error serializing personaMapsMsg: ".concat(error));
                                }
                                throw new Error("Error serializing personaMapsMsg, error unknonw");
                            }
                        }
                        return [2 /*return*/, responsePacket];
                }
            });
        });
    };
    PersonaServer.prototype.dataHandler = function (rawPacket) {
        return __awaiter(this, void 0, void 0, function () {
            var connection, data, sock, localPort, remoteAddress, updatedConnection, requestCode, responsePacket, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        connection = rawPacket.connection, data = rawPacket.data;
                        sock = connection.sock, localPort = connection.localPort, remoteAddress = connection.remoteAddress;
                        updatedConnection = connection;
                        log.debug("Received Persona packet',\n      ".concat(JSON.stringify({
                            localPort: localPort,
                            remoteAddress: remoteAddress,
                            data: rawPacket.data.toString("hex")
                        })));
                        requestCode = data.readUInt16BE(0).toString(16);
                        _a = requestCode;
                        switch (_a) {
                            case "503": return [3 /*break*/, 1];
                            case "507": return [3 /*break*/, 3];
                            case "50f": return [3 /*break*/, 5];
                            case "532": return [3 /*break*/, 7];
                            case "533": return [3 /*break*/, 9];
                            case "534": return [3 /*break*/, 11];
                        }
                        return [3 /*break*/, 13];
                    case 1: return [4 /*yield*/, this.handleSelectGamePersona(data)];
                    case 2:
                        // NPS_REGISTER_GAME_LOGIN = 0x503
                        responsePacket = _b.sent();
                        this.sendPacket(sock, responsePacket);
                        return [2 /*return*/, updatedConnection];
                    case 3: return [4 /*yield*/, this.createNewGameAccount(data)];
                    case 4:
                        // NPS_NEW_GAME_ACCOUNT == 0x507
                        responsePacket = _b.sent();
                        this.sendPacket(sock, responsePacket);
                        return [2 /*return*/, updatedConnection];
                    case 5: return [4 /*yield*/, this.logoutGameUser(data)];
                    case 6:
                        // NPS_REGISTER_GAME_LOGOUT = 0x50F
                        responsePacket = _b.sent();
                        this.sendPacket(sock, responsePacket);
                        return [2 /*return*/, updatedConnection];
                    case 7: return [4 /*yield*/, this.getPersonaMaps(data)];
                    case 8:
                        // NPS_GET_PERSONA_MAPS = 0x532
                        responsePacket = _b.sent();
                        this.sendPacket(sock, responsePacket);
                        return [2 /*return*/, updatedConnection];
                    case 9: return [4 /*yield*/, this.validatePersonaName(data)];
                    case 10:
                        // NPS_VALIDATE_PERSONA_NAME   = 0x533
                        responsePacket = _b.sent();
                        this.sendPacket(sock, responsePacket);
                        return [2 /*return*/, updatedConnection];
                    case 11: return [4 /*yield*/, this.validateLicencePlate(data)];
                    case 12:
                        // NPS_CHECK_TOKEN   = 0x534
                        responsePacket = _b.sent();
                        this.sendPacket(sock, responsePacket);
                        return [2 /*return*/, updatedConnection];
                    case 13: throw new Error("[personaServer] Unknown code was received ".concat(JSON.stringify({
                        requestCode: requestCode,
                        localPort: localPort
                    })));
                }
            });
        });
    };
    return PersonaServer;
}());
exports.PersonaServer = PersonaServer;
