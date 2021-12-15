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
exports.ConnectionManager = void 0;
var index_1 = require("../database/index");
var index_2 = require("../message-types/index");
var index_3 = require("../types/index");
var encryption_mgr_1 = require("./encryption-mgr");
var nps_packet_manager_1 = require("./nps-packet-manager");
var tcpConnection_1 = require("./tcpConnection");
var transactions_1 = require("../transactions");
var index_4 = require("../logger/index");
var index_5 = require("../server/index");
var packetFactory_1 = require("../server/packetFactory");
var crypto_1 = require("crypto");
var log = index_4.logger.child({
    service: "mcoserver:ConnectionMgr"
});
var ConnectionManager = /** @class */ (function () {
    function ConnectionManager() {
        this.connections = [];
        /**
         * @type {string[]}
         */
        this.banList = [];
        this.databaseMgr = index_1.DatabaseManager.getInstance();
    }
    ConnectionManager.getInstance = function () {
        if (!ConnectionManager._instance) {
            ConnectionManager._instance = new ConnectionManager();
        }
        return ConnectionManager._instance;
    };
    ConnectionManager.prototype.newConnection = function (connectionId, socket) {
        var newConnection = new tcpConnection_1.TCPConnection(connectionId, socket);
        newConnection.setManager(this);
        newConnection.setEncryptionManager(new encryption_mgr_1.EncryptionManager());
        return newConnection;
    };
    /**
     * Check incoming data and route it to the correct handler based on localPort
     */
    ConnectionManager.prototype.processData = function (rawPacket) {
        return __awaiter(this, void 0, void 0, function () {
            var npsPacketManager, data, _a, remoteAddress, localPort, packetType, _b, opCode, msgName, newError, error_1, newError, newNode;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        npsPacketManager = new nps_packet_manager_1.NPSPacketManager();
                        data = rawPacket.data;
                        _a = rawPacket.connection, remoteAddress = _a.remoteAddress, localPort = _a.localPort;
                        // Log the packet as debug
                        log.debug("logging raw packet,\n      ".concat(JSON.stringify({
                            remoteAddress: remoteAddress,
                            localPort: localPort,
                            data: data.toString("hex")
                        })));
                        packetType = 'tcp';
                        if ((0, index_5.isMCOT)(rawPacket.data)) {
                            packetType = "tomc";
                        }
                        return [4 /*yield*/, (0, packetFactory_1.wrapPacket)(rawPacket, packetType).processPacket()];
                    case 1:
                        _c.sent();
                        _b = localPort;
                        switch (_b) {
                            case 8226: return [3 /*break*/, 2];
                            case 8228: return [3 /*break*/, 2];
                            case 7003: return [3 /*break*/, 2];
                            case 43300: return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 7];
                    case 2:
                        try {
                            opCode = rawPacket.data.readInt16BE(0);
                            msgName = this.getNameFromOpCode(rawPacket.data.readInt16BE(0));
                            log.debug("Recieved NPS packet,\n            ".concat(JSON.stringify({
                                opCode: opCode,
                                msgName: msgName,
                                localPort: localPort
                            })));
                        }
                        catch (error) {
                            if (error instanceof Error) {
                                newError = new Error("Error in the recieved packet: ".concat(error.message));
                                log.error(newError.message);
                                throw newError;
                            }
                            throw error;
                        }
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, npsPacketManager.processNPSPacket(rawPacket)];
                    case 4: return [2 /*return*/, _c.sent()];
                    case 5:
                        error_1 = _c.sent();
                        if (error_1 instanceof Error) {
                            newError = new Error("There was an error processing the data: ".concat(error_1.message));
                            log.error(newError.message);
                            throw newError;
                        }
                        throw error_1;
                    case 6:
                        {
                            log.debug("Recieved MCOTS packet");
                            newNode = new index_2.MessageNode(index_3.EMessageDirection.RECEIVED);
                            newNode.deserialize(rawPacket.data);
                            log.debug(JSON.stringify(newNode));
                            return [2 /*return*/, transactions_1.MCOTServer.getInstance().defaultHandler(rawPacket)];
                        }
                        _c.label = 7;
                    case 7:
                        log.debug(JSON.stringify(rawPacket));
                        throw new Error("We received a packet on port ".concat(localPort, ". We don't what to do yet, going to throw so the message isn't lost."));
                }
            });
        });
    };
    /**
     * Get the name connected to the NPS opcode
     * @param {number} opCode
     * @return {string}
     */
    ConnectionManager.prototype.getNameFromOpCode = function (opCode) {
        var opCodeName = index_3.NPS_COMMANDS.find(function (code) { return code.value === opCode; });
        if (opCodeName === undefined) {
            throw new Error("Unable to locate name for opCode ".concat(opCode));
        }
        return opCodeName.name;
    };
    /**
     * Get the name connected to the NPS opcode
     * @param {string} name
     * @return {number}
     */
    ConnectionManager.prototype.getOpcodeFromName = function (name) {
        var opCode = index_3.NPS_COMMANDS.find(function (code) { return code.name === name; });
        if (opCode === undefined) {
            throw new Error("Unable to locate opcode for name ".concat(name));
        }
        return opCode.value;
    };
    /**
     *
     * @return {string[]}
     */
    ConnectionManager.prototype.getBans = function () {
        return this.banList;
    };
    /**
     * Locate connection by remoteAddress and localPort in the connections array
     * @param {string} remoteAddress
     * @param {number} localPort
     * @memberof ConnectionMgr
     * @return {module:ConnectionObj}
     */
    ConnectionManager.prototype.findConnectionByAddressAndPort = function (remoteAddress, localPort) {
        return this.connections.find(function (connection) {
            var match = remoteAddress === connection.remoteAddress &&
                localPort === connection.localPort;
            return match;
        });
    };
    /**
     * Locate connection by id in the connections array
     */
    ConnectionManager.prototype.findConnectionById = function (connectionId) {
        var results = this.connections.find(function (connection) { return connectionId === connection.id; });
        if (results === undefined) {
            throw new Error("Unable to locate connection for id ".concat(connectionId));
        }
        return results;
    };
    ConnectionManager.prototype._updateConnectionByAddressAndPort = function (address, port, newConnection) {
        return __awaiter(this, void 0, void 0, function () {
            var index;
            return __generator(this, function (_a) {
                if (newConnection === undefined) {
                    throw new Error("Undefined connection: ".concat(JSON.stringify({
                        remoteAddress: address,
                        localPort: port
                    })));
                }
                try {
                    index = this.connections.findIndex(function (connection) {
                        return connection.remoteAddress === address && connection.localPort === port;
                    });
                    this.connections.splice(index, 1);
                    this.connections.push(newConnection);
                }
                catch (error) {
                    process.exitCode = -1;
                    throw new Error("Error updating connection, ".concat(JSON.stringify({
                        error: error,
                        connections: this.connections
                    })));
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Return an existing connection, or a new one
     */
    ConnectionManager.prototype.findOrNewConnection = function (socket) {
        var remoteAddress = socket.remoteAddress, localPort = socket.localPort;
        if (!remoteAddress) {
            throw new Error("No address in socket: ".concat(JSON.stringify({
                remoteAddress: remoteAddress,
                localPort: localPort
            })));
        }
        if (!localPort) {
            throw new Error("No localPort in socket: ".concat(JSON.stringify({
                remoteAddress: remoteAddress,
                localPort: localPort
            })));
        }
        var con = this.findConnectionByAddressAndPort(remoteAddress, localPort);
        if (con !== undefined) {
            log.info("I have seen connections from ".concat(remoteAddress, " on ").concat(localPort, " before"));
            con.sock = socket;
            return con;
        }
        var newConnection = this.newConnection((0, crypto_1.randomUUID)(), socket);
        log.info("I have not seen connections from ".concat(remoteAddress, " on ").concat(localPort, " before, adding it."));
        this.connections.push(newConnection);
        return newConnection;
    };
    /**
     *
     * @return {void}
     */
    ConnectionManager.prototype.resetAllQueueState = function () {
        this.connections = this.connections.map(function (connection) {
            connection.inQueue = true;
            return connection;
        });
    };
    /**
     * Dump all connections for debugging
     */
    ConnectionManager.prototype.dumpConnections = function () {
        return this.connections;
    };
    return ConnectionManager;
}());
exports.ConnectionManager = ConnectionManager;
