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

import { randomUUID } from "node:crypto";
import createDebug from 'debug'
import { createLogger } from 'bunyan'

const appName = 'mcos'

//#region Init
const debug = createDebug(appName)
const log = createLogger({ name: appName })

/**
 * @global
 * @typedef {object} EncryptionSession
 * @property {string} connectionId
 * @property {string} remoteAddress
 * @property {number} localPort
 * @property {string} sessionKey
 * @property {string} shortKey
 * @property {import('node:crypto').Cipher} gsCipher
 * @property {import('node:crypto').Decipher} gsDecipher
 * @property {import('node:crypto').Cipher} tsCipher
 * @property {import('node:crypto').Decipher} tsDecipher
 */

/**
 * Socket with connection properties
 * @global
 * @typedef {object} SocketWithConnectionInfo
 * @property {import('node:net').Socket} socket
 * @property {number} seq
 * @property {string} id
 * @property {string} remoteAddress
 * @property {number} localPort
 * @property {number} personaId
 * @property {number} lastMessageTimestamp
 * @property {boolean} inQueue
 * @property {boolean} useEncryption
 * @property {EncryptionSession} [encryptionSession]
 */


/** @type {SocketWithConnectionInfo[]} */
const connectionList = [];

/**
 *
 *
 * @export
 * @return {SocketWithConnectionInfo[]}
 */
export function getAllConnections() {
    return connectionList;
}

/**
 * Return an existing connection, or a new one
 *
 * @param {import('node:net').Socket} socket
 * @return {SocketWithConnectionInfo}
 */
export function selectConnection(socket) {
    const { localPort, remoteAddress } = socket;

    if (
        typeof localPort === "undefined" ||
        typeof remoteAddress === "undefined"
    ) {
        const errMessage = `Either localPort or remoteAddress is missing on socket. Can not continue.`;
        log.error(errMessage);
        throw new Error(errMessage);
    }

    const existingConnection = connectionList.find((c) => {
        return (
            c.socket.remoteAddress === remoteAddress &&
            c.localPort === localPort
        );
    });

    if (typeof existingConnection !== "undefined") {
        log.info(
            `I have seen connections from ${socket.remoteAddress} on ${socket.localPort} before`
        );
        existingConnection.socket = socket;
        debug("Returning found connection after attaching socket");
        return existingConnection;
    }

    const newConnectionId = randomUUID();
    debug(`Creating new connection with id ${newConnectionId}`);
    /** @type {SocketWithConnectionInfo} */
    const newConnection = {
        seq: 0,
        id: newConnectionId,
        socket,
        remoteAddress,
        localPort,
        personaId: 0,
        lastMessageTimestamp: 0,
        inQueue: true,
        useEncryption: false,
    };

    log.info(
        `I have not seen connections from ${socket.remoteAddress} on ${socket.localPort} before, adding it.`
    );

    connectionList.push(newConnection);

    debug(
        `Connection with id of ${newConnection.id} has been added. The connection list now contains ${connectionList.length} connections.`
    );
    return newConnection;
}

/**
 * Update the internal connection record
 *
 * @param {string} connectionId
 * @param {SocketWithConnectionInfo} updatedConnection
 */
export function updateConnection(
    connectionId,
    updatedConnection
) {
    log.trace(`Updating connection with id: ${connectionId}`);
    try {
        const index = connectionList.findIndex((c) => {
            return c.id === connectionId;
        });
        connectionList.splice(index, 1);
        connectionList.push(updatedConnection);
    } catch (error) {
        throw new Error(`Error updating connection, ${String(error)}`);
    }
}

/**
 * Locate connection by remoteAddress and localPort in the connections array
 * @param {string} remoteAddress
 * @param {number} localPort
 * @return {SocketWithConnectionInfo | undefined}
 */
function findConnectionByAddressAndPort(
    remoteAddress,
    localPort
) {
    return connectionList.find((c) => {
        return c.remoteAddress === remoteAddress && c.localPort === localPort;
    });
}

/**
 * Creates a new connection object for the socket and adds to list
 * @param {string} connectionId
 * @param {import('node:net').Socket} socket
 * @returns {SocketWithConnectionInfo}
 */
function createNewConnection(
    connectionId,
    socket
) {
    const { localPort, remoteAddress } = socket;

    if (
        typeof localPort === "undefined" ||
        typeof remoteAddress === "undefined"
    ) {
        const errMessage = `Either localPort or remoteAddress is missing on socket. Can not continue.`;
        log.error(errMessage);
        throw new Error(errMessage);
    }

    /** @type {SocketWithConnectionInfo} */
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
 * @param {SocketWithConnectionInfo} connection
 * @return {SocketWithConnectionInfo[]}
 */
function addConnection(
    connection
) {
    connectionList.push(connection);
    return connectionList;
}

/**
 * Return an existing connection, or a new one
 *
 * @param {import('node:net').Socket} socket
 * @return {SocketWithConnectionInfo}
 */
export function findOrNewConnection(socket) {
    const { localPort, remoteAddress } = socket;

    if (
        typeof localPort === "undefined" ||
        typeof remoteAddress === "undefined"
    ) {
        const errMessage = `Either localPort or remoteAddress is missing on socket. Can not continue.`;
        log.error(errMessage);
        throw new Error(errMessage);
    }

    const existingConnection = findConnectionByAddressAndPort(
        remoteAddress,
        localPort
    );
    if (typeof existingConnection !== "undefined") {
        log.info(
            `I have seen connections from ${socket.remoteAddress} on ${socket.localPort} before`
        );

        // Modern
        existingConnection.socket = socket;
        debug("[M] Returning found connection after attaching socket");
        return existingConnection;
    }

    const newConnectionId = randomUUID();
    debug(`Creating new connection with id ${newConnectionId}`);
    const newConnection = createNewConnection(newConnectionId, socket);
    log.info(
        `I have not seen connections from ${socket.remoteAddress} on ${socket.localPort} before, adding it.`
    );
    const updatedConnectionList = addConnection(newConnection);
    debug(
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
