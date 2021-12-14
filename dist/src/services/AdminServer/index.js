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
exports.AdminServer = void 0;
const mco_logger_1 = require("@drazisil/mco-logger");
const https_1 = require("https");
const index_1 = __importDefault(require("../../../config/index"));
const ssl_options_1 = require("../@drazisil/ssl-options");
const { log } = mco_logger_1.Logger.getInstance();
/**
 * SSL web server for managing the state of the system
 * @module AdminServer
 */
/**
 *
 * @property {config} config
 * @property {MCServer} mcServer
 * @property {Server} httpServer
 */
class AdminServer {
    static _instance;
    config;
    mcServer;
    serviceName;
    httpsServer;
    static getInstance(mcServer) {
        if (!AdminServer._instance) {
            AdminServer._instance = new AdminServer(mcServer);
        }
        return AdminServer._instance;
    }
    constructor(mcServer) {
        this.config = index_1.default;
        this.mcServer = mcServer;
        this.serviceName = 'mcoserver:AdminServer;';
    }
    /**
     *
     * @return {string}
     */
    _handleGetConnections() {
        const connections = this.mcServer.mgr.dumpConnections();
        let responseText = '';
        for (const [index, connection] of connections.entries()) {
            const displayConnection = `
        index: ${index} - ${connection.id}
            remoteAddress: ${connection.remoteAddress}:${connection.localPort}
            Encryption ID: ${connection.enc.getId()}
            inQueue:       ${connection.inQueue}
        `;
            responseText += displayConnection;
        }
        return responseText;
    }
    /**
     *
     * @return {string}
     */
    _handleResetAllQueueState() {
        this.mcServer.mgr.resetAllQueueState();
        const connections = this.mcServer.mgr.dumpConnections();
        let responseText = 'Queue state reset for all connections\n\n';
        for (const [index, connection] of connections.entries()) {
            const displayConnection = `
        index: ${index} - ${connection.id}
            remoteAddress: ${connection.remoteAddress}:${connection.localPort}
            Encryption ID: ${connection.enc.getId()}
            inQueue:       ${connection.inQueue}
        `;
            responseText += displayConnection;
        }
        return responseText;
    }
    /**
     * @return {void}
     * @param {import("http").IncomingMessage} request
     * @param {import("http").ServerResponse} response
     */
    _httpsHandler(request, response) {
        log('info', `[Admin] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`, { service: 'mcoserver:AdminServer' });
        log('info', `Requested recieved,
      ${JSON.stringify({
            url: request.url,
            remoteAddress: request.socket.remoteAddress,
        })}`, { service: 'mcoserver:AdminServer' });
        switch (request.url) {
            case '/admin/connections':
                response.setHeader('Content-Type', 'text/plain');
                return response.end(this._handleGetConnections());
            case '/admin/connections/resetAllQueueState':
                response.setHeader('Content-Type', 'text/plain');
                return response.end(this._handleResetAllQueueState());
            default:
                if (request.url && request.url.startsWith('/admin')) {
                    return response.end('Jiggawatt!');
                }
                response.statusCode = 404;
                response.end('Unknown request.');
                break;
        }
    }
    /**
     * @returns {void}
     * @param {import("net").Socket} socket
     */
    _socketEventHandler(socket) {
        socket.on('error', error => {
            throw new Error(`[AdminServer] SSL Socket Error: ${error.message}`);
        });
    }
    /**
     *
     * @param {module:config.config} config
     * @return {Promise<void>}
     */
    start() {
        const config = this.config;
        try {
            const sslOptions = ssl_options_1._sslOptions(config.certificate, this.serviceName);
            /** @type {import("https").Server} */
            this.httpsServer = https_1.createServer(sslOptions, (
            /** @type {import("http").IncomingMessage} */ request, 
            /** @type {import("http").ServerResponse} */ response) => {
                this._httpsHandler(request, response);
            });
        }
        catch (error) {
            throw new Error(`${error.message}, ${error.stack}`);
        }
        this.httpsServer.on('connection', this._socketEventHandler);
        return this.httpsServer.listen({ port: 88, host: '0.0.0.0' }, () => {
            log('debug', 'port 88 listening', {
                service: 'mcoserver:AdminServer',
            });
        });
    }
}
exports.AdminServer = AdminServer;
//# sourceMappingURL=index.js.map