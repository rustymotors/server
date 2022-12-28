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

import { readFileSync } from "node:fs";
import { ShardEntry } from "./shard-entry.js";
import { createServer } from "node:https";
import process from 'node:process'
import createDebug from 'debug'
import { createLogger } from 'bunyan'

const appName = 'mcos'

const debug = createDebug(appName)
const log = createLogger({ name: appName })

// This section of the server can not be encrypted. This is an intentional choice for compatibility
// deepcode ignore HttpToHttps: This is intentional. See above note.

/**
 * Read the TLS certificate file
 * @return {string}
 */
export function handleGetCert() {
    const { CERTIFICATE_FILE} = process.env
    if (typeof CERTIFICATE_FILE === "undefined") {
        throw new Error("Please set CERTIFICATE_FILE");
    }
    return readFileSync(CERTIFICATE_FILE).toString();
}

/**
 * Generate Windows registry configuration file for clients
 * @return {string}
 */
export function handleGetRegistry() {
    const { EXTERNAL_HOST } = process.env
    if (typeof EXTERNAL_HOST === "undefined") {
        throw new Error("Please set EXTERNAL_HOST");
    }
    const externalHost = EXTERNAL_HOST;
    const patchHost = externalHost;
    const authHost = externalHost;
    const shardHost = externalHost;
    return `Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\EACom\\AuthAuth]
"AuthLoginBaseService"="AuthLogin"
"AuthLoginServer"="${authHost}"

[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Electronic Arts\\Motor City]
"GamePatch"="games/EA_Seattle/MotorCity/MCO"
"UpdateInfoPatch"="games/EA_Seattle/MotorCity/UpdateInfo"
"NPSPatch"="games/EA_Seattle/MotorCity/NPS"
"PatchServerIP"="${patchHost}"
"PatchServerPort"="80"
"CreateAccount"="${authHost}/SubscribeEntry.jsp?prodID=REG-MCO"
"Language"="English"

[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Electronic Arts\\Motor City\\1.0]
"ShardUrl"="http://${shardHost}/ShardList/"
"ShardUrlDev"="http://${shardHost}/ShardList/"

[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Electronic Arts\\Motor City\\AuthAuth]
"AuthLoginBaseService"="AuthLogin"
"AuthLoginServer"="${authHost}"

[HKEY_LOCAL_MACHINE\\Software\\WOW6432Node\\Electronic Arts\\Network Play System]
"Log"="1"

`;
}

/**
 *  Read TLS public key file to string
 * @return {string}
 */
export function handleGetKey() {
    const { PUBLIC_KEY_FILE } = process.env
    if (typeof PUBLIC_KEY_FILE === "undefined") {
        throw new Error("Please set PUBLIC_KEY_FILE");
    }
    return readFileSync(PUBLIC_KEY_FILE).toString();
}

/**
 * Manages patch and update server connections
 * Also handles the shard list, and some utility endpoints
 */

/**
 *
 *
 * @export
 * @class ShardServer
 */
export class ShardServer {
    /**
     *
     *
     * @static
     * @type {ShardServer}
     * @memberof ShardServer
     */
    static instance;

    /**
     *
     *
     * @private
     * @type {import('node:http').Server}
     * @memberof ShardServer
     */
    _server;
    /** @type {string[]} */
    _possibleShards = [];

    /**
     * Return the instance of the ShardServer class
     * @returns {ShardServer}
     */
    static getInstance() {
        if (typeof ShardServer.instance === "undefined") {
            ShardServer.instance = new ShardServer();
        }
        return ShardServer.instance;
    }

    /**
     * Creates an instance of ShardServer.
     *
     * Please use {@link ShardServer.getInstance()} instead
     * @memberof ShardServer
     */
    constructor() {
        this._server = createServer(this.handleRequest.bind(this));
        /** @type {string[]} */
        this._possibleShards = [];

        this._server.on("error", (error) => {
            process.exitCode = -1;
            log.error(`Server error: ${error.message}`);
            log.info(`Server shutdown: ${process.exitCode}`);
            process.exit();
        });
    }

    /**
     * Generate a shard list web document
     *
     * @private
     * @return {string}
     * @memberof! PatchServer
     */
    _generateShardList() {
        const {EXTERNAL_HOST } = process.env
        if (typeof EXTERNAL_HOST === "undefined") {
            throw new Error("Please set EXTERNAL_HOST");
        }
        const shardHost = EXTERNAL_HOST;
        const shardClockTower = new ShardEntry(
            "The Clocktower",
            "The Clocktower",
            44,
            shardHost,
            8226,
            shardHost,
            7003,
            shardHost,
            0,
            "",
            "Group-1",
            88,
            2,
            shardHost,
            80
        );

        this._possibleShards.push(shardClockTower.formatForShardList());

        const shardTwinPinesMall = new ShardEntry(
            "Twin Pines Mall",
            "Twin Pines Mall",
            88,
            shardHost,
            8226,
            shardHost,
            7003,
            shardHost,
            0,
            "",
            "Group-1",
            88,
            2,
            shardHost,
            80
        );

        this._possibleShards.push(shardTwinPinesMall.formatForShardList());

        /** @type {string[]} */
        const activeShardList = [];
        activeShardList.push(shardClockTower.formatForShardList());

        return activeShardList.join("\n");
    }

    /**
     * Handle incoming http requests
     * @return {import("node:http").ServerResponse}
     * @param {import("http").IncomingMessage} request
     * @param {import("http").ServerResponse} response
     */
    // deepcode ignore NoRateLimitingForExpensiveWebOperation: Very unlikely to be DDos'ed
    handleRequest(
        request,
        response
    ) {
        if (request.url === "/cert") {
            response.setHeader(
                "Content-disposition",
                "attachment; filename=cert.pem"
            );
            return response.end(handleGetCert());
        }

        if (request.url === "/key") {
            response.setHeader(
                "Content-disposition",
                "attachment; filename=pub.key"
            );
            return response.end(handleGetKey());
        }

        if (request.url === "/registry") {
            response.setHeader(
                "Content-disposition",
                "attachment; filename=mco.reg"
            );
            return response.end(handleGetRegistry());
        }

        if (request.url === "/") {
            response.statusCode = 404;
            return response.end("Hello, world!");
        }

        if (request.url === "/ShardList/") {
            debug(
                `Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`
            );

            response.setHeader("Content-Type", "text/plain");
            return response.end(this._generateShardList());
        }

        // Is this a hacker?
        response.statusCode = 404;
        response.end("");

        // Unknown request, log it
        log.info(
            `Unknown Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`
        );
        return response;
    }

    /**
     * Start the shard server listener
     * @returns {import("node:http").Server}
     */
    start() {
        const host = "0.0.0.0";
        const port = 80;
        debug(`Attempting to bind to port ${port}`);
        return this._server.listen({ port, host }, () => {
            debug(`port ${port} listening`);
            log.info("Shard server is listening...");
        });
    }
}
