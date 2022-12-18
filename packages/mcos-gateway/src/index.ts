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

import { logger } from "../../mcos-logger/src/index.js";
import * as http from "node:http";
import { createServer as createSocketServer, Socket } from "node:net";
import { selectConnection } from "./connections.js";
import { dataHandler } from "./sockets.js";
import { httpListener as httpHandler } from "./web.js";
export { getAllConnections } from "./connections.js";
export { AdminServer } from "./adminServer.js";

const log = logger.child({ service: "mcos:gateway" });

const listeningPortList = [
    80, 6660, 7003, 8228, 8226, 8227, 9000, 9001, 9002, 9003, 9004, 9005, 9006,
    9007, 9008, 9009, 9010, 9011, 9012, 9013, 9014, 43200, 43300, 43400, 53303,
];

function socketListener(incomingSocket: Socket): void {
    log.debug(
        `[gate]Connection from ${incomingSocket.remoteAddress} on port ${incomingSocket.localPort}`
    );

    // Is this an HTTP request?
    if (incomingSocket.localPort === 80) {
        log.debug("Web request");
        const newServer = new http.Server(httpHandler);
        // Send the socket to the http server instance
        newServer.emit("connection", incomingSocket);
        return;
    }

    // This is a 'normal' TCP socket
    TCPListener(incomingSocket);
}

function TCPListener(incomingSocket: Socket) {
    // Get a connection record
    const connectionRecord = selectConnection(incomingSocket);

    const { localPort, remoteAddress } = incomingSocket;
    log.info(`Client ${remoteAddress} connected to port ${localPort}`);

    incomingSocket.on("end", () => {
        log.info(`Client ${remoteAddress} disconnected from port ${localPort}`);
    });
    incomingSocket.on("data", async (data): Promise<void> => {
        await dataHandler(data, connectionRecord);
    });
    incomingSocket.on("error", onSocketError);
}

function onSocketError(error: Error): void {
    const message = String(error);
    if (message.includes("ECONNRESET") === true) {
        return log.warn("Connection was reset");
    }
    log.error(`Socket error: ${String(error)}`);
}

export function startListeners(): void {
    log.info("Server starting");

    listeningPortList.forEach((port) => {
        const newServer = createSocketServer((s) => {
            socketListener(s);
        });
        newServer.listen(port, "0.0.0.0", 0, () => {
            return serverListener(port);
        });
    });
}

function serverListener(port: number) {
    const listeningPort = String(port).length ? String(port) : "unknown";
    log.debug(`Listening on port ${listeningPort}`);
}
