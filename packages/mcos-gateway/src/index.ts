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

import { createServer as createSocketServer } from "node:net";
import {
    findOrNewConnection,
    getConnectionManager,
} from "./ConnectionManager.js";
import { dataHandler } from "./sockets.js";
import { httpListener as httpHandler } from "./web.js";
export { getAllConnections } from "./ConnectionManager.js";
export { AdminServer } from "./adminServer.js";
import Sentry from "@sentry/node";
import {
    IConnection,
    IError,
    IMessage,
    ISocket,
    ITCPMessage,
    TServerConfiguration,
    TServerLogger,
    TSocketWithConnectionInfo,
    toHex,
} from "mcos/shared";
import { Server } from "node:http";
import { Message } from "../../../src/rebirth/Message.js";
import { MessageHeader } from "../../../src/rebirth/MessageHeader.js";
import { TCPHeader } from "../../../src/rebirth/TCPHeader.js";
import { TCPMessage } from "../../../src/rebirth/TCPMessage.js";
import { ServerError } from "../../../src/rebirth/ServerError.js";

Sentry.init({
    dsn: "https://9cefd6a6a3b940328fcefe45766023f2@o1413557.ingest.sentry.io/4504406901915648",

    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0,
});

const listeningPortList = [
    3000, 6660, 7003, 8228, 8226, 8227,
    /// 9000, 9001, 9002, 9003, 9004, 9005, 9006, 9007, 9008, 9009, 9010, 9011, 9012, 9013, 9014,
    43200,
    43300, 43400, 53303,
];

/**
 *
 * @param {any} error
 * @param {TServerLogger} log
 * @returns {void}
 */
export function onSocketError(
    sock: ISocket,
    error: IError,
    log: TServerLogger
): void {
    const message = String(error);
    if (message.includes("ECONNRESET")) {
        log("debug", "Connection was reset");
        return;
    }
    Sentry.captureException(error);
    throw new ServerError(`Socket error: ${String(error)}`);
}

export function onSocketData(
    sock: ISocket,
    data: Buffer,
    log: TServerLogger,
    config: TServerConfiguration,
    connection: IConnection,
    connectionRecord: TSocketWithConnectionInfo
): void {
    // Received data from the client
    // Pass it to the data handler
    log("debug", `Received data: ${toHex(data)}`);
    const msgHeader = MessageHeader.deserialize(data);

    let message: IMessage | ITCPMessage;

    // Get the signature from the message header
    const signature = msgHeader.signature;

    // Check the signature. If it's not TOMC, then this is a TCP message
    if (signature !== "TOMC") {
        log("debug", "Recieved TCP message");
        const msgHeader = TCPHeader.deserialize(data);
        log("debug", `Message Header: ${msgHeader.toString()}`);

        // Deserialize the message into a TCPMessage object
        message = TCPMessage.deserialize(data);
    } else {
        // This is an MCOTS message
        log("debug", "Recieved MCOTS message");

        // Deserialize the message into a Message object
        message = Message.deserialize(data);
    }

    log("debug", `Message Node: ${message.toString()}`);

    if (connection.appID !== 0 && message instanceof Message) {
        message.appID = connection.appID;
    }

    // Set the connection ID on the message
    message.connectionId = connection.id;

    // Pass the data to the data handler along with the connection record
    dataHandler(data, connectionRecord, config, log, connection, message).catch(
        (reason: Error) =>
            log(
                "err",
                `There was an error in the data handler: ${reason.message}`
            )
    );
}
/**
 * Handle incoming TCP connections
 * @param {Socket} incomingSocket
 * @param {TServerConfiguration} config
 * @param {TServerLogger} log
 */
export function TCPListener(
    incomingSocket: ISocket,
    config: TServerConfiguration,
    log: TServerLogger
) {
    // Get the local port and remote address
    const { localPort, remoteAddress } = incomingSocket;

    validateAddressAndPort(localPort, remoteAddress);

    // Get a connection record for this socket. If one doesn't exist, create it
    const connectionRecord = findOrNewConnection(incomingSocket, log);
    const connection =
        getConnectionManager().findConnectionBySocket(incomingSocket);

    log("debug", `Client ${remoteAddress} connected to port ${localPort}`);

    // Set up event handlers
    incomingSocket.on("end", () => {
        log(
            "debug",
            `Client ${remoteAddress} disconnected from port ${localPort}`
        );
    });
    incomingSocket.on("data", (data) => {
        onSocketData(
            incomingSocket,
            data,
            log,
            config,
            connection,
            connectionRecord
        );
    });
    incomingSocket.on("error", (err) => {
        onSocketError(incomingSocket, err, log);
    });
}

/**
 *
 * Listen for incoming connections on a socket
 * @param {Socket} incomingSocket
 * @param {TServerConfiguration} config
 * @param {TServerLogger} log
 * @returns {void}
 */
function socketListener(
    incomingSocket: ISocket,
    config: TServerConfiguration,
    log: TServerLogger
): void {
    log(
        "debug",
        `[gate]Connection from ${incomingSocket.remoteAddress} on port ${incomingSocket.localPort}`
    );

    // Is this an HTTP request? If so, handle it differently
    if (incomingSocket.localPort === 3000) {
        log("debug", "Web request");
        // This is an HTTP request
        const newServer = new Server((req, res) => {
            httpHandler(req, res, config, log);
        });
        // Send the socket to the http server instance
        newServer.emit("connection", incomingSocket);

        return; // Don't do anything else
    }

    // This is a 'normal' TCP socket.
    // Pass it to the TCP listener
    TCPListener(incomingSocket, config, log);
}

/**
 *
 * @param {number} port
 * @param {TServerLogger} log
 */
function serverListener(port: number, log: TServerLogger) {
    const listeningPort = String(port).length ? String(port) : "unknown";
    log("debug", `Listening on port ${listeningPort}`);
}

/**
 *
 * Start listening on ports
 * @author Drazi Crendraven
 * @param {TServerConfiguration} config
 * @param {TServerLogger} log
 */
export function startListeners(
    config: TServerConfiguration,
    log: TServerLogger
) {
    const ALLOWED_BACKLOG_COUNT = 0;
    log("info", "Server starting");

    listeningPortList.forEach((port) => {
        const newServer = createSocketServer((s) => {
            socketListener(s, config, log);
        });

        newServer.listen(port, "0.0.0.0", ALLOWED_BACKLOG_COUNT, () => {
            return serverListener(port, log);
        });
    });
}
function validateAddressAndPort(
    localPort: number | undefined,
    remoteAddress: string | undefined
) {
    if (localPort === undefined || remoteAddress === undefined) {
        throw new Error("localPort or remoteAddress is undefined");
    }
}
