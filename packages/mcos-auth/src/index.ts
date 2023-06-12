// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017>  <Drazi Crendraven>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { ISocket, Sentry, TServerLogger } from "mcos/shared";
import { IncomingMessage, ServerResponse } from "node:http";

/**
 * Handles web-based user logins
 * Please use {@link AuthLogin.getInstance()}
 * @classdesc
 */
export class AuthLogin {
    /**
     *
     *
     * @private
     * @static
     * @type {AuthLogin}
     * @memberof AuthLogin
     */
    static _instance: AuthLogin;

    /** @type {TServerLogger} */
    _log: TServerLogger;

    /**
     *
     * @param {TServerLogger} log
     */
    constructor(log: TServerLogger) {
        this._log = log;
    }

    /**
     * Get the single instance of the class
     *
     * @static
     * @param {TServerLogger} log
     * @return {AuthLogin}
     * @memberof AuthLogin
     */
    static getInstance(log: TServerLogger): AuthLogin {
        if (!AuthLogin._instance) {
            AuthLogin._instance = new AuthLogin(log);
        }
        return AuthLogin._instance;
    }

    /**
     *
     * @private
     * @return {string}
     * @memberof! WebServer
     */
    _handleGetTicket(): string {
        return "Valid=TRUE\nTicket=d316cd2dd6bf870893dfbaaf17f965884e";
    }

    // File deepcode ignore NoRateLimitingForExpensiveWebOperation: Not using express, unsure how to handle rate limiting on raw http
    /**
     * Handle incoming http requests
     *
     * @returns {ServerResponse}
     * @param {IncomingMessage} request
     * @param {ServerResponse} response
     */
    handleRequest(request: IncomingMessage, response: ServerResponse): ServerResponse {
        this._log(
            "debug",
            `[Web] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`
        );
        if (request.url?.startsWith("/AuthLogin")) {
            response.setHeader("Content-Type", "text/plain");
            return response.end(this._handleGetTicket());
        }

        return response.end("Unknown request.");
    }

    /**
     * @private
     * @param {Socket} socket
     */
    _socketEventHandler(socket: ISocket) {
        socket.on("error", (error) => {
            const err = new Error(
                `[AuthLogin] SSL Socket Error: ${error.message}`
            );
            Sentry.addBreadcrumb({ level: "error", message: err.message });
            throw err;
        });
    }
}
