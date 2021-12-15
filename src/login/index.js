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
exports.LoginServer = void 0;
var index_1 = require("../logger/index");
var index_2 = require("../database/index");
var index_3 = require("../message-types/index");
var log = index_1.logger.child({ service: "mcoserver:LoginServer" });
/**
 * Manages the initial game connection setup and teardown.
 * @module LoginServer
 */
/**
 * @class
 * @property {DatabaseManager} databaseManager
 */
var LoginServer = /** @class */ (function () {
    function LoginServer() {
        this.databaseManager = index_2.DatabaseManager.getInstance();
        // Intentionally empty
    }
    LoginServer.getInstance = function () {
        if (!LoginServer._instance) {
            LoginServer._instance = new LoginServer();
        }
        return LoginServer._instance;
    };
    /**
     *
     * @param {IRawPacket} rawPacket
     * @param {IServerConfig} config
     * @return {Promise<ConnectionObj>}
     */
    LoginServer.prototype.dataHandler = function (rawPacket) {
        return __awaiter(this, void 0, void 0, function () {
            var processed, connection, data, _a, localPort, remoteAddress, sock, requestCode, responsePacket, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        processed = true;
                        connection = rawPacket.connection, data = rawPacket.data;
                        _a = rawPacket.connection, localPort = _a.localPort, remoteAddress = _a.remoteAddress;
                        log.info("Received Login Server packet: ".concat(JSON.stringify({
                            localPort: localPort,
                            remoteAddress: remoteAddress
                        })));
                        sock = connection.sock;
                        requestCode = data.readUInt16BE(0).toString(16);
                        _b = requestCode;
                        switch (_b) {
                            case "501": return [3 /*break*/, 1];
                        }
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this._userLogin(connection, data)];
                    case 2:
                        responsePacket = _c.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        log.debug("Unknown nps code recieved',\n          ".concat(JSON.stringify({
                            requestCode: requestCode,
                            localPort: localPort,
                            data: rawPacket.data.toString("hex")
                        })));
                        processed = false;
                        _c.label = 4;
                    case 4:
                        if (processed && responsePacket) {
                            log.debug("responsePacket object from dataHandler',\n      ".concat(JSON.stringify({
                                userStatus: responsePacket.toString("hex")
                            })));
                            log.debug("responsePacket's data prior to sending: ".concat(responsePacket.toString("hex")));
                            sock.write(responsePacket);
                        }
                        return [2 /*return*/, connection];
                }
            });
        });
    };
    /**
     *
     * @param {string} contextId
     * @return {Promise<IUserRecordMini>}
     */
    LoginServer.prototype._npsGetCustomerIdByContextId = function (contextId) {
        return __awaiter(this, void 0, void 0, function () {
            var users, userRecord;
            return __generator(this, function (_a) {
                log.debug(">>> _npsGetCustomerIdByContextId");
                users = [
                    {
                        contextId: "5213dee3a6bcdb133373b2d4f3b9962758",
                        customerId: 2885746688,
                        userId: 2
                    },
                    {
                        contextId: "d316cd2dd6bf870893dfbaaf17f965884e",
                        customerId: 5551212,
                        userId: 1
                    },
                ];
                if (contextId.toString() === "") {
                    throw new Error("Unknown contextId: ".concat(contextId.toString()));
                }
                userRecord = users.filter(function (user) { return user.contextId === contextId; });
                if (typeof userRecord[0] === "undefined" || userRecord.length !== 1) {
                    log.debug("preparing to leave _npsGetCustomerIdByContextId after not finding record',\n        ".concat(JSON.stringify({
                        contextId: contextId
                    })));
                    throw new Error("Unable to locate user record matching contextId ".concat(contextId));
                }
                log.debug("preparing to leave _npsGetCustomerIdByContextId after finding record',\n      ".concat(JSON.stringify({
                    contextId: contextId,
                    userRecord: userRecord
                })));
                return [2 /*return*/, userRecord[0]];
            });
        });
    };
    /**
     * Process a UserLogin packet
     * Should return a @link {module:NPSMsg} object
     * @param {ConnectionObj} connection
     * @param {Buffer} data
     * @param {IServerConfig} config
     * @return {Promise<Buffer>}
     */
    LoginServer.prototype._userLogin = function (connection, data) {
        return __awaiter(this, void 0, void 0, function () {
            var sock, localPort, userStatus, customer, packetContent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sock = connection.sock;
                        localPort = sock.localPort;
                        userStatus = new index_3.NPSUserStatus(data);
                        log.info("Received login packet,\n      ".concat(JSON.stringify({
                            localPort: localPort,
                            remoteAddress: connection.remoteAddress
                        })));
                        userStatus.extractSessionKeyFromPacket(data);
                        log.debug("UserStatus object from _userLogin,\n      ".concat(JSON.stringify({
                            userStatus: userStatus.toJSON()
                        })));
                        userStatus.dumpPacket();
                        return [4 /*yield*/, this._npsGetCustomerIdByContextId(userStatus.contextId)];
                    case 1:
                        customer = _a.sent();
                        // Save sessionkey in database under customerId
                        log.debug("Preparing to update session key in db");
                        return [4 /*yield*/, this.databaseManager
                                .updateSessionKey(customer.customerId, userStatus.sessionkey, userStatus.contextId, connection.id)["catch"](function (error) {
                                if (error instanceof Error) {
                                    log.error("Unable to update session key 3: ".concat(error.message));
                                }
                                throw new Error("Error in userLogin");
                            })];
                    case 2:
                        _a.sent();
                        log.info("Session key updated");
                        packetContent = (0, index_3.premadeLogin)();
                        log.debug("Using Premade Login: ".concat(packetContent.toString("hex")));
                        // MsgId: 0x601
                        Buffer.from([0x06, 0x01]).copy(packetContent);
                        // Packet length: 0x0100 = 256
                        Buffer.from([0x01, 0x00]).copy(packetContent, 2);
                        // Load the customer id
                        packetContent.writeInt32BE(customer.customerId, 12);
                        // Don't use queue (+208, but I'm not sure if this includes the header or not)
                        Buffer.from([0x00]).copy(packetContent, 208);
                        /**
                         * Return the packet twice for debug
                         * Debug sends the login request twice, so we need to reply twice
                         * Then send ok to login packet
                         */
                        return [2 /*return*/, Buffer.concat([packetContent, packetContent])];
                }
            });
        });
    };
    return LoginServer;
}());
exports.LoginServer = LoginServer;
