"use strict";
// @ts-check
// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
exports.__esModule = true;
exports.AuthLogin = void 0;
var index_1 = require("../logger/index");
// import { EServerConnectionName, RoutingMesh } from "../router/index";
// import { SslOptions } from "../types/index";
var log = index_1.logger.child({ service: "MCOServer:Auth" });
/**
 * Handles web-based user logins
 */
var AuthLogin = /** @class */ (function () {
    function AuthLogin() {
        // this._server = createServer(this._sslOptions(), (request, response) => {
        //   this.handleRequest(request, response);
        // });
        // this._server.on("error", (error) => {
        //   process.exitCode = -1;
        //   log.error(`Server error: ${error.message}`);
        //   log.info(`Server shutdown: ${process.exitCode}`);
        //   process.exit();
        // });
        // this._server.on("tlsClientError", (error) => {
        //   log.warn(`[AuthLogin] SSL Socket Client Error: ${error.message}`);
        // });
    }
    // private _server: Server;
    AuthLogin.getInstance = function () {
        if (!AuthLogin._instance) {
            AuthLogin._instance = new AuthLogin();
        }
        return AuthLogin._instance;
    };
    /**
     *
     * @return {string}
     * @memberof! WebServer
     */
    AuthLogin.prototype._handleGetTicket = function () {
        return "Valid=TRUE\nTicket=d316cd2dd6bf870893dfbaaf17f965884e";
    };
    // File deepcode ignore NoRateLimitingForExpensiveWebOperation: Not using express, unsure how to handle rate limiting on raw http
    /**
     * @returns {void}
     * @memberof ! WebServer
     * @param {import("http").IncomingMessage} request
     * @param {import("http").ServerResponse} response
     */
    AuthLogin.prototype.handleRequest = function (request, response) {
        log.info("[Web] Request from ".concat(request.socket.remoteAddress, " for ").concat(request.method, " ").concat(request.url));
        if (request.url && request.url.startsWith("/AuthLogin")) {
            response.setHeader("Content-Type", "text/plain");
            return response.end(this._handleGetTicket());
        }
        return response.end("Unknown request.");
    };
    /**
     * @returns {void}
     * @param {import("net").Socket} socket
     */
    AuthLogin.prototype._socketEventHandler = function (socket) {
        socket.on("error", function (error) {
            throw new Error("[AuthLogin] SSL Socket Error: ".concat(error.message));
        });
    };
    return AuthLogin;
}());
exports.AuthLogin = AuthLogin;
