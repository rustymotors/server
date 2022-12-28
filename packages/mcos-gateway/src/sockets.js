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

import { receiveLobbyData } from "../../mcos-lobby/src/index.js";
import { receiveLoginData } from "../../mcos-login/src/index.js";
import { receivePersonaData } from "../../mcos-persona/src/index.js";
import { receiveTransactionsData } from "../../mcos-transactions/src/index.js";
import { findOrNewConnection, updateConnection } from "./connections.js";
import { MessageNode } from "./MessageNode.js";
import createDebug from 'debug'
import { createLogger } from 'bunyan'

const appName = 'mcos:gateway:socket'

//#region Init
const debug = createDebug(appName)
const log = createLogger({ name: appName })

/**
 * Convert to zero padded hex
 *
 * @export
 * @param {Buffer} data
 * @return {string}
 */
export function toHex(data) {
    /** @type {string[]} */
    const bytes = [];
    data.forEach((b) => {
        bytes.push(b.toString(16).toUpperCase().padStart(2, "0"));
    });
    return bytes.join("");
}

/**
 * @global
 * @typedef {object} BufferWithConnection
 * @property {string} connectionId
 * @property {import("./connections.js").SocketWithConnectionInfo} connection
 * @property {Buffer} data
 * @property {number} timestamp
 */

/**
 * @global
 * @typedef {import('./BinaryStructure.js').BinaryStructure} TSMessageBase
 */

/**
 * N+ messages, ready for sending, with related connection
 * @global
 * @typedef {object} MessageArrayWithConnection
 * @property {import("./connections.js").SocketWithConnectionInfo} connection
 * @property {import('./NPSMessage.js').NPSMessage[] | MessageNode[] | TSMessageBase[]} messages
 */

/**
 * @global
 * @typedef {MessageArrayWithConnection} ServiceResponse
 */

/**
 * @type {Record<number, (arg0: BufferWithConnection) => Promise<ServiceResponse>>}
 */
const serviceRouters = {
    8226: receiveLoginData,
    8228: receivePersonaData,
    7003: receiveLobbyData,
    43300: receiveTransactionsData
}

/**
 * The onData handler
 * takes the data buffer and creates a {@link BufferWithConnection} object
 * @param {Buffer} data
 * @param {import("./connections.js").SocketWithConnectionInfo} connection
 * @return {Promise<void>}
 */
export async function dataHandler(
    data,
    connection
) {
    debug(`data prior to proccessing: ${data.toString("hex")}`);

    // Link the data and the connection together
    /** @type {BufferWithConnection} */
    const networkBuffer = {
        connectionId: connection.id,
        connection,
        data,
        timestamp: Date.now(),
    };

    const { localPort, remoteAddress } = networkBuffer.connection.socket;

    if (typeof localPort === "undefined" || typeof remoteAddress === "undefined") {
        // Somehow we have recived a connection without a local post specified
        log.error(
            `Error locating remote address or target port for socket, connection id: ${networkBuffer.connectionId}`
        );
        log.error("Closing socket.");
        networkBuffer.connection.socket.end();
        return;
    }

    // Move remote address and local port forward
    networkBuffer.connection.remoteAddress = remoteAddress;
    networkBuffer.connection.localPort = localPort;

    // Route the data to the correct service
    // There are 2 happy paths from this point
    // * GameService
    // * TransactionService

    debug(`I have a packet on port ${localPort}`);

    if (typeof serviceRouters[localPort] !== "undefined") {
        try {
            /** @type {ServiceResponse} */
            const result = await serviceRouters[localPort](networkBuffer)

            const messages = result.messages;

            const outboundConnection = result.connection;

            const packetCount = messages.length;
            debug(`There are ${packetCount} messages ready for sending`);

            sendMessages(messages, outboundConnection);

            // Update the connection
                updateConnection(outboundConnection.id, outboundConnection);
        } catch (error) {
            log.error(
                `There was an error processing the packet: ${String(
                    error
                )}`
            );
            process.exitCode = -1;
            return;
        }
    }
}

/**
 * 
 * @param {import("./NPSMessage.js").NPSMessage[] | MessageNode[] | import("./BinaryStructure.js").BinaryStructure[]} messages 
 * @param {import("./connections.js").SocketWithConnectionInfo} outboundConnection 
 */
function sendMessages(messages, outboundConnection) {
    messages.forEach((f) => {
        if (outboundConnection.useEncryption === true &&
            f instanceof MessageNode) {
            if (typeof outboundConnection.encryptionSession ===
                "undefined" ||
                typeof f.data === "undefined") {
                const errMessage = "There was a fatal error attempting to encrypt the message!";
                debug(
                    `usingEncryption? ${outboundConnection.useEncryption}, packetLength: ${f.data.byteLength}/${f.dataLength}`
                );
                log.error(errMessage);
            } else {
                debug(
                    `Message prior to encryption: ${toHex(f.serialize())}`
                );
                f.updateBuffer(
                    outboundConnection.encryptionSession.tsCipher.update(
                        f.data
                    )
                );
            }
        }

        debug(`Sending Message: ${toHex(f.serialize())}`);
        outboundConnection.socket.write(f.serialize());
    });
}

/**
 * Server listener method
 *
 * @param {import('node:net').Socket} socket
 * @return {void}
 */
export function TCPHandler(socket) {
    // Received a new connection
    // Turn it into a connection object
    const connectionRecord = findOrNewConnection(socket);

    const { localPort, remoteAddress } = socket;
    log.info(`Client ${remoteAddress} connected to port ${localPort}`);
    if (socket.localPort === 7003 && connectionRecord.inQueue === true) {
        /**
         * Debug seems hard-coded to use the connection queue
         * Craft a packet that tells the client it's allowed to login
         */

        log.info("Sending OK to Login packet");
        debug("[listen2] In tcpListener(pre-queue)");
        socket.write(Buffer.from([0x02, 0x30, 0x00, 0x00]));
        debug("[listen2] In tcpListener(post-queue)");
        connectionRecord.inQueue = false;
    }

    socket.on("end", () => {
        log.info(`Client ${remoteAddress} disconnected from port ${localPort}`);
    });
    socket.on("data", async (data) => {
        await dataHandler(data, connectionRecord);
    });
    socket.on("error", (error) => {
        const message = String(error);
        if (message.includes("ECONNRESET") === true) {
            return log.warn("Connection was reset");
        }
        log.error(`Socket error: ${String(error)}`);
    });
}

