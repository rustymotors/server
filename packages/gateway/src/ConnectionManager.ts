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

import { Sentry, Connection, ServerError } from "@mcos/shared";
import {
    IConnectionManager,
    NetworkSocket,
    EncryptionSession,
    Logger,
    SocketWithConnectionInfo,
    ClientConnection,
} from "@mcos/interfaces";

/** @deprecated use {@link ConnectionManager} instead */
export const connectionList: SocketWithConnectionInfo[] = [];

/**
 * Find a connection by id
 * @deprecated use {@link ConnectionManager.getAllConnections()} instead
 */
export function getAllConnections(): SocketWithConnectionInfo[] {
    return connectionList;
}

/**
 * Update the internal connection record
 *
 * @deprecated use one of the methods in {@link ConnectionManager} instead
 * @see {@link ConnectionManager.updateConnectionEncryption()} to update encryption session
 * @see {@link ConnectionManager.updateConnectionSocket()} to update socket
 * @see {@link ConnectionManager.updateConnectionStatus()} to update status
 */
export function updateConnection(
    connectionId: string,
    updatedConnection: SocketWithConnectionInfo,
    log: Logger
): void {
    log("debug", `Updating connection with id: ${connectionId}`);
    const index = connectionList.findIndex((c) => c.id === connectionId);
    if (index === -1) {
        const err = new ServerError(
            `Connection not found with id ${connectionId}`
        );
        Sentry.captureException(err);
        throw err;
    }
    connectionList.splice(index, 1, updatedConnection);
}

/**
 * Locate connection by remoteAddress and localPort in the connections array
 * @deprecated use {@link ConnectionManager.findConnectionByAddressAndPort()} instead
 */
export function findConnectionByAddressAndPort(
    remoteAddress: string,
    localPort: number
): SocketWithConnectionInfo | undefined {
    return connectionList.find((c) => {
        return c.remoteAddress === remoteAddress && c.localPort === localPort;
    });
}

/**
 * Creates a new connection object for the socket and adds to list
 * @deprecated use {@link ConnectionManager.newConnectionFromSocket()} instead
 */
export function createNewConnection(
    connectionId: string,
    socket: NetworkSocket,
    log: Logger
): SocketWithConnectionInfo {
    const { localPort, remoteAddress } = socket;

    const connectionRecord = new Connection();
    connectionRecord.id = connectionId;

    if (
        typeof localPort === "undefined" ||
        typeof remoteAddress === "undefined"
    ) {
        const err = new Error(
            "Either localPort or remoteAddress is missing on socket. Can not continue."
        );
        Sentry.addBreadcrumb({ level: "error", message: err.message });
        throw err;
    }

    const newConnectionRecord: SocketWithConnectionInfo = {
        connectionId,
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
 * Add a connection to the list
 * @deprecated use {@link ConnectionManager.addConnection()} instead
 */
export function addConnection(connection: SocketWithConnectionInfo): void {
    connectionList.push(connection);
}

export function emptyConnectionList(): void {
    connectionList.splice(0, connectionList.length);
}

/**
 * Class to manage connections
 */
export class ConnectionManager implements IConnectionManager {
    emptyLegacyConnectionList() {
        emptyConnectionList();
    }
    connections: Connection[] = [];
    static instance: ConnectionManager;

    /**
     * Find a connection by id
     * @param {string} connectionId
     * @return {Connection}
     * @throws {ServerError} if connection is not found
     */
    findConnectionByID(connectionId: string): ClientConnection | undefined {
        return this.connections.find((c) => {
            return c.id === connectionId;
        });
    }

    /**
     * Find a connection by socket. Returns undefined if not found
     * @param {Socket} socket
     * @return {Connection | undefined}
     */
    findConnectionBySocket(socket: NetworkSocket): ClientConnection | undefined {
        return this.connections.find((c) => {
            return c.socket === socket;
        });
    }

    findConnectionByAddressAndPort(
        remoteAddress: string,
        localPort: number
    ): ClientConnection | undefined {
        return this.connections.find((c) => {
            return (
                c.ip === remoteAddress && c.port === localPort && c.status !== 0
            );
        });
    }

    /**
     * Find all connections with a given remoteAddress
     */
    findConnectionsByAddress(remoteAddress: string): ClientConnection[] {
        const connections: ClientConnection[] = [];
        for (const connection of this.connections) {
            if (connection.ip === remoteAddress) {
                connections.push(connection);
            }
        }
        return connections;
    }
    emptyConnectionList() {
        this.connections = [];
    }

    /**
     * Add a connection to the list if it does not already exist
     * @param {Connection} connection
     * @return {void}
     */
    addConnection(connection: ClientConnection): void {
        const existingConnection = this.connections.find((c) => {
            return c.id === connection.id;
        });
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
    removeConnectionBySocket(socket: NetworkSocket): void {
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
     * @return {IConnection[]}
     */
    getAllConnections(): ClientConnection[] {
        return this.connections;
    }

    /**
     * Format connections as HTML
     * @param {Connection[]} connections
     * @return {string}
     */
    formatConnectionsAsHTML(connections: ClientConnection[]): string {
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
    formatConnectionsAsJSON(connections: ClientConnection[]): string {
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
    getQueue(): ClientConnection[] {
        const queue: ClientConnection[] = [];
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
    newConnectionFromSocket(socket: NetworkSocket): ClientConnection {
        const connection = new Connection();
        connection.socket = socket;
        if (
            typeof socket.localPort === "undefined" ||
            typeof socket.remoteAddress === "undefined"
        ) {
            const errorMesssage = "".concat(
                "Socket is missing localPort or remoteAddress",
                " ",
                "localPort:",
                " ",
                String(socket.localPort),
                " ",
                "remoteAddress:",
                " ",
                String(socket.remoteAddress)
            );
            throw new ServerError(errorMesssage);
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
        if (typeof connection === "undefined") {
            throw new ServerError("Connection not found");
        }
        connection.status = status;
    }

    /**
     * Find a connection by id and update its socket
     * @param {string} connectionId
     * @param {Socket} socket
     * @return {void}
     * @throws {ServerError} if connection is not found
     */
    updateConnectionSocket(connectionId: string, socket: NetworkSocket): void {
        const connection = this.findConnectionByID(connectionId);
        if (typeof connection === "undefined") {
            throw new ServerError("Connection not found");
        }
        connection.socket = socket;
    }

    updateConnectionEncryption(
        connectionId: string,
        encryptionSession: EncryptionSession,
        useEncryption: boolean
    ): void {
        const connection = this.connections.find((c) => {
            return c.id === connectionId;
        });
        if (typeof connection === "undefined") {
            throw new ServerError("Connection not found");
        }
        connection.encryptionSession = encryptionSession;
        connection.useEncryption = useEncryption;
    }
}

/**
 * Get an instance of ConnectionManager
 * @return {ConnectionManager}
 * @static
 * @memberof ConnectionManager
 */
export function getConnectionManager(): ConnectionManager {
    if (typeof ConnectionManager.instance === "undefined") {
        ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
}
