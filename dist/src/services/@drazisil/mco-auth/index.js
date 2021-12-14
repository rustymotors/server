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
exports.AuthLogin = void 0;
const https_1 = __importDefault(require("https"));
const mco_logger_1 = require("@drazisil/mco-logger");
const server_config_1 = __importDefault(require("./server.config"));
const fs_1 = require("fs");
const mco_types_1 = require("../mco-types");
const mco_common_1 = require("../mco-common");
const { log } = mco_logger_1.Logger.getInstance();
/**
 * Handles web-based user logins
 * @module AuthLogin
 */
/**
 * @class
 * @property {Object} config
 * @property {Object} config.certificate
 * @property {string} config.certificate.privateKeyFilename
 * @property {string} config.certificate.publicKeyFilename
 * @property {string} config.certificate.certFilename
 * @property {Object} config.serverSettings
 * @property {string} config.serverSettings.ipServer
 * @property {Object} config.serviceConnections
 * @property {string} config.serviceConnections.databaseURL
 * @property {string} config.defaultLogLevel
 * @property {Server} httpsServer
 */
class AuthLogin {
    static _instance;
    config;
    _serviceName = 'MCOServer:Auth';
    _server;
    static getInstance() {
        if (!AuthLogin._instance) {
            AuthLogin._instance = new AuthLogin();
        }
        return AuthLogin._instance;
    }
    constructor() {
        this.config = server_config_1.default;
        this._server = https_1.default.createServer(this._sslOptions(), (request, response) => {
            this.handleRequest(request, response);
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
        this._server.on('tlsClientError', error => {
            log('warn', `[AuthLogin] SSL Socket Client Error: ${error.message}`, {
                service: this._serviceName,
            });
        });
    }
    /**
     *
     * @return {string}
     * @memberof! WebServer
     */
    _handleGetTicket() {
        return 'Valid=TRUE\nTicket=d316cd2dd6bf870893dfbaaf17f965884e';
    }
    // File deepcode ignore NoRateLimitingForExpensiveWebOperation: Not using express, unsure how to handle rate limiting on raw http
    /**
     * @returns {void}
     * @memberof ! WebServer
     * @param {import("http").IncomingMessage} request
     * @param {import("http").ServerResponse} response
     */
    handleRequest(request, response) {
        log('info', `[Web] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`, { service: this._serviceName });
        if (request.url && request.url.startsWith('/AuthLogin')) {
            response.setHeader('Content-Type', 'text/plain');
            return response.end(this._handleGetTicket());
        }
        return response.end('Unknown request.');
    }
    /**
     * @returns {void}
     * @param {import("net").Socket} socket
     */
    _socketEventHandler(socket) {
        socket.on('error', error => {
            throw new Error(`[AuthLogin] SSL Socket Error: ${error.message}`);
        });
    }
    /**
     *
     * @returns {Promise<import("https").Server>}
     * @memberof! WebServer
     */
    async start() {
        const host = server_config_1.default.serverSettings.host || 'localhost';
        const port = 443;
        return this._server.listen({ port, host }, () => {
            log('debug', `port ${port} listening`, {
                service: this._serviceName,
            });
            log('info', 'Auth server listening', {
                service: this._serviceName,
            });
            // Register service with router
            mco_common_1.RoutingMesh.getInstance().registerServiceWithRouter(mco_types_1.EServerConnectionName.AUTH, host, port);
        });
    }
    _sslOptions() {
        log('debug', `Reading ${this.config.certificate.certFilename}`, {
            service: this._serviceName,
        });
        let cert;
        let key;
        try {
            cert = fs_1.readFileSync(this.config.certificate.certFilename, {
                encoding: 'utf-8',
            });
        }
        catch (error) {
            throw new Error(`Error loading ${this.config.certificate.certFilename}: (${error}), server must quit!`);
        }
        try {
            key = fs_1.readFileSync(this.config.certificate.privateKeyFilename, {
                encoding: 'utf-8',
            });
        }
        catch (error) {
            throw new Error(`Error loading ${this.config.certificate.privateKeyFilename}: (${error}), server must quit!`);
        }
        return {
            cert,
            honorCipherOrder: true,
            key,
            rejectUnauthorized: false,
        };
    }
}
exports.AuthLogin = AuthLogin;
//# sourceMappingURL=index.js.map