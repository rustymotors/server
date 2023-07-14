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

import {
    GetServerLogger,
    Message,
    MessageHeader,
    ServerError,
    toHex,
} from "@mcos/shared";
import {
    GameMessage,
    TConnection,
    BuiltinError,
    NetworkSocket,
    ClientMessage,
    ConnectionHandler,
    MessageProcessor,
    Logger,
    SocketOnDataHandler,
    TSocketEndHandler,
    TSocketErrorHandler,
    SocketWithConnectionInfo,
    ServerConfiguration,
    ConnectionRecord,
    ClientConnection,
    WebConnectionHandler,
} from "@mcos/interfaces";
import { randomUUID } from "node:crypto";
import { Server as httpServer } from "node:http";
import {
    addConnection,
    createNewConnection,
    findConnectionByAddressAndPort,
    getConnectionManager,
} from "./ConnectionManager.js";
import { dataHandler } from "./sockets.js";
import { httpListener as httpHandler } from "./web.js";
export { getAdminServer } from "./AdminServer.js";
export { getAllConnections } from "./ConnectionManager.js";

export const defaultLog = GetServerLogger("info");

/**
 *
 * @param {object} options
 * @param {ISocket} options.sock
 * @param {IError} options.error
 * @param {TServerLogger} options.log
 * @returns {void}
 */
export function socketErrorHandler({
    sock,
    error,
    log,
}: {
    sock: NetworkSocket;
    error: BuiltinError;
    log: Logger;
}): void {
    // Check if the socket is still writable
    if (!sock.writable) {
        // Close the socket
        sock.destroy();
    }

    // Handle socket errors
    if (error.message.includes("ECONNRESET")) {
        log("debug", "Connection was reset");
        return;
    }
    throw new ServerError(`Socket error: ${error.message}`);
}

export function socketDataHandler({
    processMessage = dataHandler,
    data,
    logger,
    config,
    connection,
    connectionRecord,
}: {
    processMessage?: MessageProcessor;
    data: Buffer;
    logger: Logger;
    config: ServerConfiguration;
    connection: ClientConnection;
    connectionRecord: SocketWithConnectionInfo;
}): void {
    // Received data from the client
    // Pass it to the data handler
    logger("debug", `Received data: ${toHex(data)}`);
    const msgHeader = MessageHeader.deserialize(data);

    let message: Message | ClientMessage | GameMessage;

    // Get the signature from the message header
    const signature = msgHeader.signature;

    // Check the signature. If it's not TOMC, then this is a TCP message
    if (signature !== "TOMC") {
        logger("debug", "Recieved TCP message");
        const header = new MessageHeader();
        const msgHeader = header.deserialize(data);
        logger("debug", `Message Header: ${msgHeader.toString()}`);

        // Deserialize the message into a TCPMessage object
        message = Message.deserialize(data);
    } else {
        // This is an MCOTS message
        logger("debug", "Recieved MCOTS message");

        // Deserialize the message into a Message object
        message = Message.deserialize(data);
    }

    logger("debug", `Message Node: ${message.toString()}`);

    // Set the connection ID on the message
    message.connectionId = connection.id;

    // Pass the data to the data handler along with the connection record
    processMessage({
        data,
        connectionRecord,
        config,
        logger,
        connection,
        message,
    }).catch((reason: Error) =>
        logger(
            "err",
            `There was an error in the data handler: ${reason.message}`
        )
    );
}

/**
 * Handle the end of a socket connection
 */
export function socketEndHandler({
    log,
    connectionRecord,
}: {
    log: Logger;
    connectionRecord: SocketWithConnectionInfo;
}): void {
    log("debug", "Socket ended");
    // Remove the connection from the connection manager
    getConnectionManager().removeConnection(connectionRecord.id);
}

export function validateAddressAndPort(
    localPort: number | undefined,
    remoteAddress: string | undefined
) {
    if (localPort === undefined || remoteAddress === undefined) {
        throw new Error("localPort or remoteAddress is undefined");
    }
}

/**
 * Handle incoming TCP connections
 *
 */
export function rawConnectionHandler({
    incomingSocket,
    config,
    log,
    onSocketData = socketDataHandler,
    onSocketError = socketErrorHandler,
    onSocketEnd = socketEndHandler,
}: {
    incomingSocket: NetworkSocket;
    config: ServerConfiguration;
    log: Logger;
    onSocketData?: SocketOnDataHandler;
    onSocketError?: TSocketErrorHandler;
    onSocketEnd?: TSocketEndHandler;
}): void {
    // Get the local port and remote address
    const { localPort, remoteAddress } = incomingSocket;

    validateAddressAndPort(localPort, remoteAddress);

    // Look for an existing connection
    let connectionRecord: SocketWithConnectionInfo | undefined;
    let connection: ClientConnection | undefined;
    const newConnectionId = randomUUID();
    connectionRecord = findConnectionByAddressAndPort(
        String(incomingSocket.remoteAddress),
        incomingSocket.localPort || 0
    );
    if (connectionRecord) {
        log("debug", `Found existing connection ${connectionRecord.id}`);
        connectionRecord.socket = incomingSocket;
    } else {
        log("debug", "No existing connection found");
        connectionRecord = createNewConnection(
            newConnectionId,
            incomingSocket,
            log
        );
        addConnection(connectionRecord);
    }
    connection = getConnectionManager().findConnectionBySocket(incomingSocket);
    if (!connection) {
        connection =
            getConnectionManager().newConnectionFromSocket(incomingSocket);
        getConnectionManager().addConnection(connection);
    }

    log("debug", `Client ${remoteAddress} connected to port ${localPort}`);

    // Set up event handlers
    incomingSocket.on("end", () => {
        onSocketEnd({
            sock: incomingSocket,
            log,
            connectionRecord: connectionRecord as SocketWithConnectionInfo,
        });
    });
    incomingSocket.on("data", (data) => {
        onSocketData({
            socket: incomingSocket,
            data: data as Buffer,
            logger: log,
            config,
            connection: connection as ClientConnection,
            connectionRecord: connectionRecord as SocketWithConnectionInfo,
        });
    });
    incomingSocket.on("error", (err) => {
        onSocketError({
            sock: incomingSocket,
            error: ServerError.fromUnknown(err),
            log,
        });
    });
}

/**
 *
 * Listen for incoming connections on a socket
 *
 */
export function socketConnectionHandler({
    onTCPConnection = rawConnectionHandler,
    onHTTPConnection = httpHandler,
    incomingSocket,
    config,
    log,
}: {
    onTCPConnection?: ConnectionHandler;
    onHTTPConnection?: WebConnectionHandler;
    incomingSocket: NetworkSocket;
    config: ServerConfiguration;
    log: Logger;
}): void {
    log(
        "debug",
        `[gate]Connection from ${incomingSocket.remoteAddress} on port ${incomingSocket.localPort}`
    );

    // Is this an HTTP request? If so, handle it differently
    if (incomingSocket.localPort === 3000) {
        log("debug", "Web request");
        // This is an HTTP request
        const newServer = new httpServer((req, res) => {
            onHTTPConnection(req, res, config, log);
        });
        // Send the socket to the http server instance
        newServer.emit("connection", incomingSocket);

        return; // Don't do anything else
    }

    // This is a 'normal' TCP socket.
    // Pass it to the TCP listener
    onTCPConnection({ incomingSocket, config, log });
}
