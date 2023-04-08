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

import * as http from "node:http";
import { createServer as createSocketServer } from "node:net";
import { findOrNewConnection } from "./connections.js";
import { dataHandler } from "./sockets.js";
import { httpListener as httpHandler } from "./web.js";
export { getAllConnections } from "./connections.js";
export { AdminServer } from "./adminServer.js";
import { readFileSync } from "node:fs";

const listeningPortList = [
    3000, 6660, 7003, 8228, 8226, 8227, 9000, 9001, 9002, 9003, 9004, 9005,
    9006, 9007, 9008, 9009, 9010, 9011, 9012, 9013, 9014, 43200, 43300, 43400,
    53303,
];

/**
 *
 * @param {any} error
 * @param {import("mcos/shared").TServerLogger} log
 * @returns
 */
function onSocketError(error, log) {
    const message = String(error);
    if (message.includes("ECONNRESET") === true) {
        return log.info("Connection was reset");
    }
    log.error(new Error(`Socket error: ${String(error)}`));
}

/**
 *
 * @param {import('node:net').Socket} incomingSocket
 * @param {import("mcos/shared").TServerLogger} log
 */
function TCPListener(incomingSocket, log) {
    // Get a connection record
    const connectionRecord = findOrNewConnection(incomingSocket, log);

    const { localPort, remoteAddress } = incomingSocket;
    log.info(`Client ${remoteAddress} connected to port ${localPort}`);

    incomingSocket.on("end", () => {
        log.info(`Client ${remoteAddress} disconnected from port ${localPort}`);
    });
    incomingSocket.on("data", async (data) => {
        await dataHandler(data, connectionRecord, log);
    });
    incomingSocket.on("error", onSocketError);
}

/**
 *
 * @param {import('node:net').Socket} incomingSocket
 * @param {import("mcos/shared").TServerConfiguration} config
 * @param {import("mcos/shared").TServerLogger} log
 * @returns
 */
function socketListener(incomingSocket, config, log) {
    log.info(
        `[gate]Connection from ${incomingSocket.remoteAddress} on port ${incomingSocket.localPort}`
    );

    let exitCode = 0;

    /** @type {string} */
    let cert;

    try {
        cert = readFileSync("./data/mcouniverse.crt", { encoding: "utf8" });
    } catch (error) {
        log.error(
            new Error(`Unable to read certificate file: ${String(error)}`)
        );
        exitCode = -1;
        process.exit(exitCode);
    }

    /** @type {string} */
    let key;

    try {
        key = readFileSync("./data/private_key.pem", { encoding: "utf8" });
    } catch (error) {
        log.error(new Error(`Unable to read private file`));
        exitCode = -1;
        process.exit(exitCode);
    }

    // Is this an HTTP request?
    if (incomingSocket.localPort === 3000) {
        log.info("Web request");
        const newServer = new http.Server((req, res) => {
            httpHandler(req, res, config, log)
        });
        // Send the socket to the http server instance
        newServer.emit("connection", incomingSocket);

        return;
    }

    // This is a 'normal' TCP socket
    TCPListener(incomingSocket, log);
}

/**
 *
 * @param {number} port
 * @param {import("mcos/shared").TServerLogger} log
 */
function serverListener(port, log) {
    const listeningPort = String(port).length ? String(port) : "unknown";
    log.info(`Listening on port ${listeningPort}`);
}

/**
 *
 * Start listening on ports
 * @author Drazi Crendraven
 * @param {import("mcos/shared").TServerConfiguration} config
 * @param {import("mcos/shared").TServerLogger} log
 */
export function startListeners(config, log) {
    log.info("Server starting");

    listeningPortList.forEach((port) => {
        const newServer = createSocketServer((s) => {
            socketListener(s, config, log);
        });
        newServer.listen(port, "0.0.0.0", 0, () => {
            return serverListener(port, log);
        });
    });
}
