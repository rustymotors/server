"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShardServer = void 0;
// @ts-check
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
const mco_logger_1 = require("@drazisil/mco-logger");
const fs_1 = require("fs");
const http_1 = __importDefault(require("http"));
const mco_common_1 = require("../mco-common");
const mco_types_1 = require("../mco-types");
const server_config_1 = __importDefault(require("./server.config"));
const shard_entry_1 = require("./shard-entry");
// This section of the server can not be encrypted. This is an intentional choice for compatibility
// deepcode ignore HttpToHttps: This is intentional. See above note.
const { log } = mco_logger_1.Logger.getInstance();
/**
 * Manages patch and update server connections
 * Also handles the shard list, and some utility endpoints
 * TODO: Document the endpoints
 * @module PatchServer
 */
/**
 * @class
 * @property {config.config} config
 * @property {string[]} banList
 * @property {string[]} possibleShards
 * @property {Server} serverPatch
 */
class ShardServer {
    static _instance;
    _config;
    _possibleShards = [];
    _server;
    _serviceName = 'MCOServer:Shard';
    static getInstance() {
        if (!ShardServer._instance) {
            ShardServer._instance = new ShardServer();
        }
        return ShardServer._instance;
    }
    constructor() {
        this._config = server_config_1.default;
        this._server = http_1.default.createServer((request, response) => {
            this._handleRequest(request, response);
        });
        this._server.on('error', error => {
            process.exitCode = -1;
            log('error', `Server error: ${error.message}`, {
                service: this._serviceName,
            });
            log('info', `Server shutdown: ${process.exitCode}`, {
                service: this._serviceName,
            });
            process.exit();
        });
    }
    /**
     * Generate a shard list web document
     *
     * @return {string}
     * @memberof! PatchServer
     */
    _generateShardList() {
        // const { host } = this._config.serverSettings
        const host = 'localhost';
        const shardClockTower = new shard_entry_1.ShardEntry('The Clocktower', 'The Clocktower', 44, host, 8226, host, 7003, host, 0, '', 'Group-1', 88, 2, host, 80);
        this._possibleShards.push(shardClockTower.formatForShardList());
        const shardTwinPinesMall = new shard_entry_1.ShardEntry('Twin Pines Mall', 'Twin Pines Mall', 88, host, 8226, host, 7003, host, 0, '', 'Group-1', 88, 2, host, 80);
        this._possibleShards.push(shardTwinPinesMall.formatForShardList());
        /** @type {string[]} */
        const activeShardList = [];
        activeShardList.push(shardClockTower.formatForShardList());
        return activeShardList.join('\n');
    }
    /**
     *
     * @return {string}
     * @memberof! WebServer
     */
    _handleGetCert() {
        return fs_1.readFileSync(this._config.certificate.certFilename).toString();
    }
    /**
     *
     * @return {string}
     * @memberof! WebServer
     */
    _handleGetKey() {
        return fs_1.readFileSync(this._config.certificate.publicKeyFilename).toString();
    }
    /**
     *
     * @return {string}
     * @memberof! WebServer
     */
    _handleGetRegistry() {
        const { host: ipServer } = this._config.serverSettings;
        return `Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\EACom\\AuthAuth]
"AuthLoginBaseService"="AuthLogin"
"AuthLoginServer"="${ipServer}"

[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Electronic Arts\\Motor City]
"GamePatch"="games/EA_Seattle/MotorCity/MCO"
"UpdateInfoPatch"="games/EA_Seattle/MotorCity/UpdateInfo"
"NPSPatch"="games/EA_Seattle/MotorCity/NPS"
"PatchServerIP"="${ipServer}"
"PatchServerPort"="80"
"CreateAccount"="${ipServer}/SubscribeEntry.jsp?prodID=REG-MCO"
"Language"="English"

[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Electronic Arts\\Motor City\\1.0]
"ShardUrl"="http://${ipServer}/ShardList/"
"ShardUrlDev"="http://${ipServer}/ShardList/"

[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Electronic Arts\\Motor City\\AuthAuth]
"AuthLoginBaseService"="AuthLogin"
"AuthLoginServer"="${ipServer}"

[HKEY_LOCAL_MACHINE\\Software\\WOW6432Node\\Electronic Arts\\Network Play System]
"Log"="1"

`;
    }
    /**
     * @return {void}
     * @memberof ! PatchServer
     * @param {import("http").IncomingMessage} request
     * @param {import("http").ServerResponse} response
     */
    _handleRequest(request, response) {
        if (request.url === '/cert') {
            response.setHeader('Content-disposition', 'attachment; filename=cert.pem');
            return response.end(this._handleGetCert());
        }
        if (request.url === '/key') {
            response.setHeader('Content-disposition', 'attachment; filename=pub.key');
            return response.end(this._handleGetKey());
        }
        if (request.url === '/registry') {
            response.setHeader('Content-disposition', 'attachment; filename=mco.reg');
            return response.end(this._handleGetRegistry());
        }
        if (request.url === '/') {
            response.statusCode = 404;
            return response.end('Hello, world!');
        }
        if (request.url === '/ShardList/') {
            log('debug', `Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`, { service: this._serviceName });
            response.setHeader('Content-Type', 'text/plain');
            return response.end(this._generateShardList());
        }
        // Is this a hacker?
        response.statusCode = 404;
        response.end('');
        // Unknown request, log it
        log('info', `Unknown Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`, { service: this._serviceName });
    }
    start() {
        const host = server_config_1.default.serverSettings.host || 'localhost';
        const port = 82;
        return this._server.listen({ port, host }, () => {
            log('debug', `port ${port} listening`, { service: this._serviceName });
            log('info', 'Patch server is listening...', {
                service: this._serviceName,
            });
            // Register service with router
            mco_common_1.RoutingMesh.getInstance().registerServiceWithRouter(mco_types_1.EServerConnectionName.SHARD, host, port);
        });
    }
}
exports.ShardServer = ShardServer;
//# sourceMappingURL=index.js.map