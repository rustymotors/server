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
    createServer as createSocketServer,
    Server as tcpServer,
} from "node:net";
import {
    addConnection,
    createNewConnection,
    findConnectionByAddressAndPort,
    getConnectionManager,
} from "./ConnectionManager.js";
import { dataHandler } from "./sockets.js";
import { httpListener as httpHandler } from "./web.js";
export { getAllConnections } from "./ConnectionManager.js";
export { AdminServer } from "./adminServer.js";
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
    GetServerLogger,
} from "mcos/shared";
import { Server as httpServer } from "node:http";
import { Message } from "../../../src/rebirth/Message.js";
import { MessageHeader } from "../../../src/rebirth/MessageHeader.js";
import { TCPHeader } from "../../../src/rebirth/TCPHeader.js";
import { TCPMessage } from "../../../src/rebirth/TCPMessage.js";
import { ServerError } from "../../../src/rebirth/ServerError.js";
import { randomUUID } from "node:crypto";

const defaultLog = GetServerLogger();

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
    sock: ISocket;
    error: IError;
    log: TServerLogger;
}): void {
    if (error.message.includes("ECONNRESET")) {
        log("debug", "Connection was reset");
        return;
    }
    throw new ServerError(`Socket error: ${error.message}`);
}

export function socketDataHandler({
    socket,
    processData = dataHandler,
    data,
    logger,
    config,
    connection,
    connectionRecord,
}: {
    socket: ISocket;
    processData: Function;
    data: Buffer;
    logger: TServerLogger;
    config: TServerConfiguration;
    connection: IConnection;
    connectionRecord: TSocketWithConnectionInfo;
}): void {
    // Received data from the client
    // Pass it to the data handler
    logger("debug", `Received data: ${toHex(data)}`);
    const msgHeader = MessageHeader.deserialize(data);

    let message: IMessage | ITCPMessage;

    // Get the signature from the message header
    const signature = msgHeader.signature;

    // Check the signature. If it's not TOMC, then this is a TCP message
    if (signature !== "TOMC") {
        logger("debug", "Recieved TCP message");
        const msgHeader = TCPHeader.deserialize(data);
        logger("debug", `Message Header: ${msgHeader.toString()}`);

        // Deserialize the message into a TCPMessage object
        message = TCPMessage.deserialize(data);
    } else {
        // This is an MCOTS message
        logger("debug", "Recieved MCOTS message");

        // Deserialize the message into a Message object
        message = Message.deserialize(data);
    }

    logger("debug", `Message Node: ${message.toString()}`);

    if (connection.appID !== 0 && message instanceof Message) {
        message.appID = connection.appID;
    }

    // Set the connection ID on the message
    message.connectionId = connection.id;

    // Pass the data to the data handler along with the connection record
    processData(
        data,
        connectionRecord,
        config,
        logger,
        connection,
        message
    ).catch((reason: Error) =>
        logger(
            "err",
            `There was an error in the data handler: ${reason.message}`
        )
    );
}

export function socketEndHandler(
    sock: ISocket,
    log: TServerLogger,
    connectionRecord: TSocketWithConnectionInfo
): void {
    log("debug", "Socket ended");
    // Remove the connection from the connection manager
    getConnectionManager().removeConnection(connectionRecord.connectionId);
}

/**
 * Handle incoming TCP connections
 *
 * @param {object} options
 * @param {Socket} options.incomingSocket
 * @param {TServerConfiguration} options.config
 * @param {TServerLogger} options.log
 * @param {Function} options.onSocketData
 * @param {Function} options.onSocketError
 * @param {Function} options.onSocketEnd
 */
export function rawConnectionHandler({
    incomingSocket,
    config,
    log,
    onSocketData = socketDataHandler,
    onSocketError = socketErrorHandler,
    onSocketEnd = socketEndHandler,
}: {
    incomingSocket: ISocket;
    config: TServerConfiguration;
    log: TServerLogger;
    onSocketData?: Function;
    onSocketError?: Function;
    onSocketEnd?: Function;
}): void {
    // Get the local port and remote address
    const { localPort, remoteAddress } = incomingSocket;

    validateAddressAndPort(localPort, remoteAddress);

    // Look for an existing connection
    let connectionRecord: TSocketWithConnectionInfo | undefined;
    let connection: IConnection | undefined;
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
        addConnection(connectionRecord, log);
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
        onSocketEnd(incomingSocket, log, connectionRecord);
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
        onSocketError({ sock: incomingSocket, error: err as Error, log });
    });
}

/**
 *
 * Listen for incoming connections on a socket
 *
 * @param {object} options
 * @param {Function} options.onConnection
 * @param {Function} options.onHTTPConnection
 * @param {Socket} options.incomingSocket
 * @param {TServerConfiguration} options.config
 * @param {TServerLogger} options.log
 * @returns {void}
 */
export function socketConnectionHandler({
    onConnection = rawConnectionHandler,
    onHTTPConnection = httpHandler,
    incomingSocket,
    config,
    log,
}: {
    onConnection?: Function;
    onHTTPConnection?: Function;
    incomingSocket: ISocket;
    config: TServerConfiguration;
    log: TServerLogger;
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
    onConnection({ incomingSocket, config, log });
}

export function validateAddressAndPort(
    localPort: number | undefined,
    remoteAddress: string | undefined
) {
    if (localPort === undefined || remoteAddress === undefined) {
        throw new Error("localPort or remoteAddress is undefined");
    }
}

// TODO: Add a way to stop the server
/**
 * Gateway server
 *
 * @param {object} options
 * @param {TServerConfiguration} options.config
 * @param {TServerLogger} options.log
 * @param {number} options.backlogAllowedCount
 * @param {Function} options.serverListener
 * @param {number[]} options.listeningPortList
 * @returns {GatewayServer}
 */
export class GatewayServer {
    private readonly config: TServerConfiguration;
    private readonly log: TServerLogger;
    private readonly backlogAllowedCount: number;
    private readonly listeningPortList: number[];
    private readonly servers: tcpServer[];
    private readonly socketListener: Function;
    // Singleton instance of GatewayServer
    static _instance: GatewayServer;

    constructor({
        config = undefined,
        log = defaultLog,
        backlogAllowedCount = 0,
        listeningPortList = [],
        onSocketConnection = socketConnectionHandler,
    }: {
        config?: TServerConfiguration;
        log?: TServerLogger;
        backlogAllowedCount?: number;
        serverListener?: Function;
        listeningPortList?: number[];
        onSocketConnection?: Function;
    }) {
        if (config === undefined) {
            throw new Error("config is undefined");
        }

        this.config = config;
        this.log = log;
        this.backlogAllowedCount = backlogAllowedCount;
        this.listeningPortList = listeningPortList;
        this.servers = [];
        this.socketListener = onSocketConnection;

        // If the singleton instance already exists, return it
        if (GatewayServer._instance) {
            return GatewayServer._instance;
        }

        // Set the singleton instance
        GatewayServer._instance = this;
    }

    public start() {
        this.log("info", "Server starting");

        if (this.listeningPortList.length === 0) {
            throw new Error("No listening ports specified");
        }

        this.listeningPortList.forEach((port) => {
            const server = createSocketServer((s) => {
                this.socketListener({
                    incomingSocket: s,
                    config: this.config,
                    log: this.log,
                });
            });

            server.listen(port, "0.0.0.0", this.backlogAllowedCount, () => {
                this.log("debug", `Listening on port ${port}`);
            });

            this.servers.push(server);
        });
    }
}
