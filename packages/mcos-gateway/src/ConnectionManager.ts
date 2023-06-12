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

import { ISocket, Sentry, TServerLogger, TSocketWithConnectionInfo } from "mcos/shared";
import { randomUUID } from "node:crypto";
import { Connection } from "../../../src/rebirth/Connection.js";
import { ServerError } from "../../../src/rebirth/ServerError.js";

/** @type {TSocketWithConnectionInfo[]} */
const connectionList: TSocketWithConnectionInfo[] = [];

/**
 *
 *
 * @export
 * @return {TSocketWithConnectionInfo[]}
 */
export function getAllConnections(): TSocketWithConnectionInfo[] {
    return connectionList;
}

/**
 * Update the internal connection record
 *
 * @param {string} connectionId
 * @param {TSocketWithConnectionInfo} updatedConnection
 * @param {TServerLogger} log
 */
export function updateConnection(
    connectionId: string,
    updatedConnection: TSocketWithConnectionInfo,
    log: TServerLogger
) {
    log("debug", `Updating connection with id: ${connectionId}`);
    try {
        const index = connectionList.findIndex((c) => {
            return c.id === connectionId;
        });
        connectionList.splice(index, 1);
        connectionList.push(updatedConnection);
    } catch (error) {
        Sentry.captureException(error);
        const err = new Error(`Error updating connection, ${String(error)}`);
        Sentry.addBreadcrumb({ level: "error", message: err.message });
        throw err;
    }
}

/**
 * Locate connection by remoteAddress and localPort in the connections array
 * @param {string} remoteAddress
 * @param {number} localPort
 * @return {TSocketWithConnectionInfo | undefined}
 */
function findConnectionByAddressAndPort(
    remoteAddress: string,
    localPort: number
): TSocketWithConnectionInfo | undefined {
    return connectionList.find((c) => {
        return c.remoteAddress === remoteAddress && c.localPort === localPort;
    });
}

/**
 * Creates a new connection object for the socket and adds to list
 * @param {string} connectionId
 * @param {Socket} socket
 * @param {TServerLogger} log
 * @returns {TSocketWithConnectionInfo}
 */
function createNewConnection(
    connectionId: string,
    socket: ISocket,
    log: TServerLogger
): TSocketWithConnectionInfo {
    const { localPort, remoteAddress } = socket;

    const connectionRecord = new Connection();
    connectionRecord.id = connectionId;

    if (
        typeof localPort === "undefined" ||
        typeof remoteAddress === "undefined"
    ) {
        const err = new Error(
            `Either localPort or remoteAddress is missing on socket. Can not continue.`
        );
        Sentry.addBreadcrumb({ level: "error", message: err.message });
        throw err;
    }

    /** @type {TSocketWithConnectionInfo} */
    const newConnectionRecord: TSocketWithConnectionInfo = {
        connectionId: connectionId,
        socket,
        remoteAddress,
        localPort,
        seq: 0,
        id: connectionId,
        personaId: 0,
        lastMessageTimestamp: 0,
        inQueue: true,
        useEncryption: false,
    };
    log("debug", `new connection created with id ${connectionId}`);
    return newConnectionRecord;
}

/**
 * Return an existing connection, or a new one
 *
 * @param {Socket} socket
 * @param {TServerLogger} log
 * @return {TSocketWithConnectionInfo}
 */
export function findOrNewConnection(
    socket: ISocket,
    log: TServerLogger
): TSocketWithConnectionInfo {
    const { localPort, remoteAddress } = socket;

    Sentry.setTags({
        remoteAddress: remoteAddress || "empty",
        localPort: localPort || "empty",
    });

    if (
        typeof localPort === "undefined" ||
        typeof remoteAddress === "undefined"
    ) {
        const err = new Error(
            `Either localPort or remoteAddress is missing on socket. Can not continue.`
        );
        Sentry.addBreadcrumb({ level: "error", message: err.message });
        log("err", err.message);
        throw err;
    }

    const existingConnection = findConnectionByAddressAndPort(
        remoteAddress,
        localPort
    );
    if (typeof existingConnection !== "undefined") {
        log(
            "debug",
            `I have seen connections from ${remoteAddress} on ${localPort} before`
        );

        // Attach the socket to the existing connection
        existingConnection.socket = socket;
        log("debug", "[M] Returning found connection after attaching socket");
        return existingConnection;
    }

    // Get a new connection id
    const newConnectionId = randomUUID();
    log("debug", `Creating new connection with id ${newConnectionId}`);

    // Create a new connection
    const newConnection = createNewConnection(newConnectionId, socket, log);
    log(
        "debug",
        `I have not seen connections from ${socket.remoteAddress} on ${socket.localPort} before, adding it.`
    );
    // Add the new connection to the list
    connectionList.push(newConnection);
    log(
        "debug",
        `Connection with id of ${newConnection.id} has been added. The connection list now contains ${connectionList.length} connections.`
    );
    return newConnection;
}

/**
 * Class to manage connections
 */
export class ConnectionManager {
    connections: Connection[] = [];
    static instance: ConnectionManager;

    constructor() {
        if (ConnectionManager.instance) {
            return ConnectionManager.instance;
        }
        ConnectionManager.instance = this;
    }

    /**
     * Find a connection by id
     * @param {string} connectionId
     * @return {Connection}
     * @throws {ServerError} if connection is not found
     */
    findConnectionByID(connectionId: string): Connection {
        const connection = this.connections.find((c) => {
            return c.id === connectionId;
        });
        if (typeof connection === "undefined") {
            throw new ServerError(
                `Could not find connection with id ${connectionId}`
            );
        }
        return connection;
    }

    /**
     * Find a connection by socket. If not found, create a new one
     * @param {Socket} socket
     * @return {Connection}
     */
    findConnectionBySocket(socket: ISocket): Connection {
        const connection = this.connections.find((c) => {
            return c.socket === socket;
        });
        if (typeof connection === "undefined") {
            const newConnection = this.newConnectionFromSocket(socket);
            this.addConnection(newConnection);
            return newConnection;
        }
        return connection;
    }

    /**
     * Add a connection to the list if it does not already exist
     * @param {Connection} connection
     * @return {void}
     */
    addConnection(connection: Connection): void {
        const existingConnection = this.findConnectionByID(connection.id);
        if (typeof existingConnection !== "undefined") {
            return;
        }
        this.connections.push(connection);
    }

    /**
     * Remove a connection from the list by id if it exists
     * @param {string} connectionId
     * @return {void}
     */
    removeConnection(connectionId: string): void {
        const index = this.connections.findIndex((c) => {
            return c.id === connectionId;
        });
        if (index === -1) {
            return;
        }
        this.connections.splice(index, 1);
    }

    /**
     * Remove a connection from the list by socket if it exists
     * @param {Socket} socket
     * @return {void}
     */
    removeConnectionBySocket(socket: ISocket): void {
        const index = this.connections.findIndex((c) => {
            return c.socket === socket;
        });
        if (index === -1) {
            return;
        }
        this.connections.splice(index, 1);
    }

    /**
     * Remove all connections with a given appID
     * @param {number} appID
     * @return {void}
     */
    removeConnectionsByAppID(appID: number): void {
        for (let i = 0; i < this.connections.length; i++) {
            if (this.connections[i].appID === appID) {
                this.connections.splice(i, 1);
            }
        }
    }

    /**
     * Get all connections
     * @return {Connection[]}
     */
    getAllConnections(): Connection[] {
        return this.connections;
    }

    /**
     * Format connections as HTML
     * @param {Connection[]} connections
     * @return {string}
     */
    formatConnectionsAsHTML(connections: Connection[]): string {
        let html = "";
        html += "<table>";
        html += "<tr>";
        html += "<th>Connection ID</th>";
        html += "<th>App ID</th>";
        html += "<th>Status</th>";
        html += "<th>IP</th>";
        html += "<th>Port</th>";
        html += "<th>inQueue</th>";
        html += "</tr>";
        for (const connection of connections) {
            html += "<tr>";
            html += `<td>${connection.id}</td>`;
            html += `<td>${connection.appID}</td>`;
            html += `<td>${connection.status}</td>`;
            html += `<td>${connection.ip}</td>`;
            html += `<td>${connection.port}</td>`;
            html += `<td>${connection.inQueue}</td>`;
            html += "</tr>";
        }
        html += "</table>";
        return html;
    }

    /**
     * Format connections as JSON
     * @param {Connection[]} connections
     * @return {string}
     */
    formatConnectionsAsJSON(connections: Connection[]): string {
        let json = "";
        json += "[";
        for (const connection of connections) {
            json += "{";
            json += `"id": "${connection.id}",`;
            json += `"appID": ${connection.appID},`;
            json += `"status": ${connection.status},`;
            json += `"ip": "${connection.ip}",`;
            json += `"port": ${connection.port},`;
            json += `"inQueue": ${connection.inQueue}`;
            json += "},";
        }
        json += "]";
        return json;
    }

    /**
     * Get list of connections in queue
     * @return {Connection[]}
     */
    getQueue(): Connection[] {
        const queue: Connection[] = [];
        for (const connection of this.connections) {
            if (connection.inQueue) {
                queue.push(connection);
            }
        }
        return queue;
    }

    /**
     * Create a new connection from a socket
     * @param {Socket} socket
     * @return {Connection}
     * @throws {ServerError} if socket is missing localPort or remoteAddress
     */
    newConnectionFromSocket(socket: ISocket): Connection {
        const existingConnection = this.findConnectionBySocket(socket);
        if (typeof existingConnection !== "undefined") {
            return existingConnection;
        }

        const connection = new Connection();
        connection.socket = socket;
        if (typeof socket.localPort === "undefined") {
            throw new ServerError(`Socket has no localPort`);
        }
        connection.port = socket.localPort;
        if (typeof socket.remoteAddress === "undefined") {
            throw new ServerError(`Socket has no remoteAddress`);
        }
        connection.ip = socket.remoteAddress;
        return connection;
    }

    /**
     * Find a connection by id and update its status
     * @param {string} connectionId
     * @param {number} status
     * @return {void}
     * @throws {ServerError} if connection is not found
     */
    updateConnectionStatus(connectionId: string, status: number): void {
        const connection = this.findConnectionByID(connectionId);
        connection.status = status;
    }

    /**
     * Find a connection by id and update its socket
     * @param {string} connectionId
     * @param {Socket} socket
     * @return {void}
     * @throws {ServerError} if connection is not found
     */
    updateConnectionSocket(connectionId: string, socket: ISocket): void {
        const connection = this.findConnectionByID(connectionId);
        connection.socket = socket;
    }
}

/**
 * Get an instance of ConnectionManager
 * @return {ConnectionManager}
 * @static
 * @memberof ConnectionManager
 */
export function getConnectionManager(): ConnectionManager {
    return new ConnectionManager();
}
