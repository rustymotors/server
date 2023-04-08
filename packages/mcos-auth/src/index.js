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
    static _instance;

    /** @type {import("mcos/shared").TServerLogger} */
    #log;

    /**
     *
     * @param {import("mcos/shared").TServerLogger} log
     */
    constructor(log) {
        this.#log = log;
    }

    /**
     * Get the single instance of the class
     *
     * @static
     * @param {import("mcos/shared").TServerLogger} log
     * @return {AuthLogin}
     * @memberof AuthLogin
     */
    static getInstance(log) {
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
    _handleGetTicket() {
        return "Valid=TRUE\nTicket=d316cd2dd6bf870893dfbaaf17f965884e";
    }

    // File deepcode ignore NoRateLimitingForExpensiveWebOperation: Not using express, unsure how to handle rate limiting on raw http
    /**
     * Handle incoming http requests
     *
     * @returns {import('node:http').ServerResponse}
     * @param {import('node:http').IncomingMessage} request
     * @param {import('node:http').ServerResponse} response
     */
    handleRequest(request, response) {
        this.#log.info(
            `[Web] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`
        );
        if (request.url && request.url.startsWith("/AuthLogin")) {
            response.setHeader("Content-Type", "text/plain");
            return response.end(this._handleGetTicket());
        }

        return response.end("Unknown request.");
    }

    /**
     * @private
     * @param {import('node:net').Socket} socket
     */
    _socketEventHandler(socket) {
        socket.on("error", (error) => {
            throw new Error(`[AuthLogin] SSL Socket Error: ${error.message}`);
        });
    }
}
