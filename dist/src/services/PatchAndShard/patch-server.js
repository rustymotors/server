"use strict";
// @ts-check
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatchServer = exports.CastanetResponse = void 0;
// This section of the server can not be encrypted. This is an intentional choice for compatibility
// deepcode ignore HttpToHttps: This is intentional. See above note.
const fs_1 = require("fs");
const http_1 = require("http");
const mco_logger_1 = __importDefault(require("@drazisil/mco-logger"));
const index_1 = __importDefault(require("../../../config/index"));
const shard_entry_1 = require("./shard-entry");
/**
 * A simulated patch server response
 * @type {ICastanetResponse}
 */
exports.CastanetResponse = {
    body: Buffer.from('cafebeef00000000000003', 'hex'),
    header: {
        type: 'Content-Type',
        value: 'application/octet-stream',
    },
};
/**
 * @class
 * @property {config.config} config
 * @property {string[]} banList
 * @property {string[]} possibleShards
 * @property {Server} serverPatch
 */
class PatchServer {
    config;
    banList;
    possibleShards;
    serverPatch;
    serviceName;
    constructor() {
        this.config = index_1.default;
        /**
         * @type {string[]}
         */
        this.banList = [];
        /**
         * @type {string[]}
         */
        this.possibleShards = [];
        this.serverPatch = http_1.createServer((request, response) => {
            this._httpHandler(request, response);
        });
        this.serverPatch.on('error', error => {
            if (error.message.includes('EACCES')) {
                process.exitCode = -1;
                throw new Error('Unable to start server on port 80! Have you granted access to the node runtime?');
            }
            throw error;
        });
        this.serviceName = 'mcoserver:PatchServer';
    }
    /**
     * Simulate a response from a update server
     *
     * @return {ICastanetResponse}
     * @memberof! PatchServer
     */
    _patchUpdateInfo() {
        return exports.CastanetResponse;
    }
    /**
     * Simulate a response from a patch server
     *
     * @return {ICastanetResponse}
     * @memberof! PatchServer
     */
    _patchNPS() {
        return exports.CastanetResponse;
    }
    /**
     * Simulate a response from a patch server
     *
     * @return {ICastanetResponse}
     * @memberof! PatchServer
     */
    _patchMCO() {
        return exports.CastanetResponse;
    }
    /**
     * Generate a shard list web document
     *
     * @return {string}
     * @memberof! PatchServer
     */
    _generateShardList() {
        const { ipServer } = this.config.serverSettings;
        const shardClockTower = new shard_entry_1.ShardEntry('The Clocktower', 'The Clocktower', 44, ipServer, 8226, ipServer, 7003, ipServer, 0, '', 'Group-1', 88, 2, ipServer, 80);
        this.possibleShards.push(shardClockTower.formatForShardList());
        const shardTwinPinesMall = new shard_entry_1.ShardEntry('Twin Pines Mall', 'Twin Pines Mall', 88, ipServer, 8226, ipServer, 7003, ipServer, 0, '', 'Group-1', 88, 2, ipServer, 80);
        this.possibleShards.push(shardTwinPinesMall.formatForShardList());
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
        return fs_1.readFileSync(this.config.certificate.certFilename).toString();
    }
    /**
     *
     * @return {string}
     * @memberof! WebServer
     */
    _handleGetKey() {
        return fs_1.readFileSync(this.config.certificate.publicKeyFilename).toString();
    }
    /**
     *
     * @return {string}
     * @memberof! WebServer
     */
    _handleGetRegistry() {
        const { ipServer } = this.config.serverSettings;
        const dynamicRegistryFile = `Windows Registry Editor Version 5.00

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
        return dynamicRegistryFile;
    }
    /**
     * @return {void}
     * @memberof ! PatchServer
     * @param {import("http").IncomingMessage} request
     * @param {import("http").ServerResponse} response
     */
    _httpHandler(request, response) {
        let responseData;
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
        switch (request.url) {
            case '/ShardList/':
                mco_logger_1.default.debug(`[PATCH] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`, { service: this.serviceName });
                response.setHeader('Content-Type', 'text/plain');
                response.end(this._generateShardList());
                break;
            case '/games/EA_Seattle/MotorCity/UpdateInfo':
                mco_logger_1.default.log(`[PATCH] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`, { service: this.serviceName });
                responseData = this._patchUpdateInfo();
                response.setHeader(responseData.header.type, responseData.header.value);
                response.end(responseData.body);
                break;
            case '/games/EA_Seattle/MotorCity/NPS':
                mco_logger_1.default.log(`[PATCH] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`, { service: this.serviceName });
                responseData = this._patchNPS();
                response.setHeader(responseData.header.type, responseData.header.value);
                response.end(responseData.body);
                break;
            case '/games/EA_Seattle/MotorCity/MCO':
                mco_logger_1.default.log(`[PATCH] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`, { service: this.serviceName });
                responseData = this._patchMCO();
                response.setHeader(responseData.header.type, responseData.header.value);
                response.end(responseData.body);
                break;
            default:
                // Is this a hacker?
                response.statusCode = 404;
                response.end('');
                // Unknown request, log it
                mco_logger_1.default.log(`[PATCH] Unknown Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`, { service: this.serviceName });
                break;
        }
    }
    /**
     *
     * @param {string} banIP
     * @return {void}
     * @memberof! PatchServer
     */
    _addBan(banIP) {
        this.banList.push(banIP);
    }
    /**
     *
     * @return {string[]}
     * @memberof! PatchServer
     */
    _getBans() {
        return this.banList;
    }
    /**
     *
     * @return {void}
     * @memberof! PatchServer
     */
    _clearBans() {
        this.banList = [];
    }
    /**
     *
     * @memberof! PatchServer
     * @return {Promise<import("http").Server>}
     */
    async start() {
        const { serviceName } = this;
        if (this.serverPatch === undefined) {
            throw new Error('Patch server is not defined');
        }
        return this.serverPatch.listen({ port: '80', host: '0.0.0.0' }, () => {
            mco_logger_1.default.debug('port 80 listening', { service: serviceName });
            mco_logger_1.default.log('[patchServer] Patch server is listening...', {
                service: serviceName,
            });
        });
    }
}
exports.PatchServer = PatchServer;
//# sourceMappingURL=patch-server.js.map