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

import { Sentry } from "mcos/shared";
import { randomUUID } from "node:crypto";

/** @type {import("mcos/shared").TSocketWithConnectionInfo[]} */
const connectionList = [];

/**
 *
 *
 * @export
 * @return {import("mcos/shared").TSocketWithConnectionInfo[]}
 */
export function getAllConnections() {
    return connectionList;
}

/**
 * Update the internal connection record
 *
 * @param {string} connectionId
 * @param {import("mcos/shared").TSocketWithConnectionInfo} updatedConnection
 * @param {import("mcos/shared").TServerLogger} log
 */
export function updateConnection(connectionId, updatedConnection, log) {
    log("debug", `Updating connection with id: ${connectionId}`);
    try {
        const index = connectionList.findIndex((c) => {
            return c.id === connectionId;
        });
        connectionList.splice(index, 1);
        connectionList.push(updatedConnection);
    } catch (error) {
        const err = new Error(`Error updating connection, ${String(error)}`);
        Sentry.addBreadcrumb({ level: "error", message: err.message });
        throw err;
    }
}

/**
 * Locate connection by remoteAddress and localPort in the connections array
 * @param {string} remoteAddress
 * @param {number} localPort
 * @return {import("mcos/shared").TSocketWithConnectionInfo | undefined}
 */
function findConnectionByAddressAndPort(remoteAddress, localPort) {
    return connectionList.find((c) => {
        return c.remoteAddress === remoteAddress && c.localPort === localPort;
    });
}

/**
 * Creates a new connection object for the socket and adds to list
 * @param {string} connectionId
 * @param {import('node:net').Socket} socket
 * @param {import("mcos/shared").TServerLogger} log
 * @returns {import("mcos/shared").TSocketWithConnectionInfo}
 */
function createNewConnection(connectionId, socket, log) {
    const { localPort, remoteAddress } = socket;

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

    /** @type {import("mcos/shared").TSocketWithConnectionInfo} */
    const newConnectionRecord = {
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
    return newConnectionRecord;
}

/**
 * Add new connection to internal list
 *
 * @param {import("mcos/shared").TSocketWithConnectionInfo} connection
 * @return {import("mcos/shared").TSocketWithConnectionInfo[]}
 */
function addConnection(connection) {
    connectionList.push(connection);
    return connectionList;
}

/**
 * Return an existing connection, or a new one
 *
 * @param {import('node:net').Socket} socket
 * @param {import("mcos/shared").TServerLogger} log
 * @return {import("mcos/shared").TSocketWithConnectionInfo}
 */
export function findOrNewConnection(socket, log) {
    const { localPort, remoteAddress } = socket;

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

    const existingConnection = findConnectionByAddressAndPort(
        remoteAddress,
        localPort
    );
    if (typeof existingConnection !== "undefined") {
        log(
            "debug",
            `I have seen connections from ${socket.remoteAddress} on ${socket.localPort} before`
        );

        // Modern
        existingConnection.socket = socket;
        log("debug", "[M] Returning found connection after attaching socket");
        return existingConnection;
    }

    const newConnectionId = randomUUID();
    log("debug", `Creating new connection with id ${newConnectionId}`);
    const newConnection = createNewConnection(newConnectionId, socket, log);
    log(
        "debug",
        `I have not seen connections from ${socket.remoteAddress} on ${socket.localPort} before, adding it.`
    );
    const updatedConnectionList = addConnection(newConnection);
    log(
        "debug",
        `Connection with id of ${newConnection.id} has been added. The connection list now contains ${updatedConnectionList.length} connections.`
    );
    return newConnection;
}

/**
 * Is this an MCOT bound packet?
 *
 * @export
 * @param {Buffer} inputBuffer
 * @return {boolean}
 */
export function isMCOT(inputBuffer) {
    return inputBuffer.toString("utf8", 2, 6) === "TOMC";
}
