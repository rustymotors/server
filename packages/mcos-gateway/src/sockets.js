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
import { receiveLobbyData } from "mcos/lobby";
import { receiveLoginData } from "mcos/login";
import { receivePersonaData } from "mcos/persona";
import { receiveTransactionsData } from "mcos/transactions";
import { findOrNewConnection, updateConnection } from "./connections.js";
import { MessageNode } from "./MessageNode.js";
import { Socket } from "net";
import { toHex } from "../../../src/shared/index.js";

/**
 * @module mcos-gateway
 */

/**
 * @typedef {Function} TServiceRouter
 * @param {TBufferWithConnection} connection
 * @param {TServerConfiguration}config
 * @param {TServerLogger} log
 * @returns {Promise<TServiceResponse>}
 */

/**
 * @type {Record<number, TServiceRouter>}
 */
const serviceRouters = {
    8226: receiveLoginData,
    8228: receivePersonaData,
    7003: receiveLobbyData,
    43300: receiveTransactionsData,
};

/**
 *
 * @param {TNPSMessage[] | TMessageNode[] | TBinaryStructure[]} messages
 * @param {TSocketWithConnectionInfo} outboundConnection
 * @param {TServerLogger} log
 */
function sendMessages(messages, outboundConnection, log) {
    messages.forEach((f) => {
        if (
            outboundConnection.useEncryption === true &&
            f instanceof MessageNode
        ) {
            if (
                typeof outboundConnection.encryptionSession === "undefined" ||
                typeof f.data === "undefined"
            ) {
                const err = new Error(
                    "There was a fatal error attempting to encrypt the message!"
                );
                log(
                    "debug",
                    `usingEncryption? ${outboundConnection.useEncryption}, packetLength: ${f.data.byteLength}/${f.dataLength}`
                );
                Sentry.addBreadcrumb({ level: "error", message: err.message });
                throw err;
            } else {
                log(
                    "debug",
                    `Message prior to encryption: ${toHex(f.serialize())}`
                );
                f.updateBuffer(
                    outboundConnection.encryptionSession.tsCipher.update(f.data)
                );
            }
        }

        log("debug", `Sending Message: ${toHex(f.serialize())}`);
        outboundConnection.socket.write(f.serialize());
    });
}

/**
 * The onData handler
 * takes the data buffer and creates a {@link BufferWithConnection} object
 * @param {Buffer} data
 * @param {TSocketWithConnectionInfo} connection
 * @param {TServerConfiguration} config
 * @param {TServerLogger} log
 * @return {Promise<void>}
 */
export async function dataHandler(data, connection, config, log) {
    log("debug", `data prior to proccessing: ${data.toString("hex")}`);

    // Link the data and the connection together
    /** @type {TBufferWithConnection} */
    const networkBuffer = {
        connectionId: connection.id,
        connection,
        data,
        timeStamp: Date.now(),
    };

    const { localPort, remoteAddress } = networkBuffer.connection.socket;

    if (
        typeof localPort === "undefined" ||
        typeof remoteAddress === "undefined"
    ) {
        // Somehow we have recived a connection without a local post specified
        networkBuffer.connection.socket.end();
        const err = new Error(
            `Error locating remote address or target port for socket, connection id: ${networkBuffer.connectionId}`
        );
        Sentry.addBreadcrumb({ level: "error", message: err.message });
        throw err;
    }

    // Move remote address and local port forward
    networkBuffer.connection.remoteAddress = remoteAddress;
    networkBuffer.connection.localPort = localPort;

    // Route the data to the correct service
    // There are 2 happy paths from this point
    // * GameService
    // * TransactionService

    log("debug", `I have a packet on port ${localPort}`);

    if (typeof serviceRouters[localPort] !== "undefined") {
        try {
            /** @type {TServiceResponse} */
            const result = await serviceRouters[localPort](
                networkBuffer,
                config,
                log
            );

            const messages = result.messages;

            const outboundConnection = result.connection;

            const packetCount = messages.length;
            log("debug", `There are ${packetCount} messages ready for sending`);

            sendMessages(messages, outboundConnection, log);

            // Update the connection
            updateConnection(outboundConnection.id, outboundConnection, log);
        } catch (error) {
            process.exitCode = -1;
            const err = new Error(
                `There was an error processing the packet: ${String(error)}`
            );
            Sentry.addBreadcrumb({ level: "error", message: err.message });
            throw err;
        }
    }
}

/**
 * Server listener method
 *
 * @param {external:Socket} socket
 * @param {TServerConfiguration} config
 * @param {TServerLogger} log
 * @return {void}
 */
export function TCPHandler(socket, config, log) {
    // Received a new connection
    // Turn it into a connection object
    try {
        const connectionRecord = findOrNewConnection(socket, log);

        const { localPort, remoteAddress } = socket;
        log("debug", `Client ${remoteAddress} connected to port ${localPort}`);
        if (socket.localPort === 7003 && connectionRecord.inQueue === true) {
            /**
             * Debug seems hard-coded to use the connection queue
             * @todo Craft a packet that tells the client it's allowed to login
             */

            log("debug", "Sending OK to Login packet");
            log("debug", "[listen2] In tcpListener(pre-queue)");
            socket.write(Buffer.from([0x02, 0x30, 0x00, 0x00]));
            log("debug", "[listen2] In tcpListener(post-queue)");
            connectionRecord.inQueue = false;
        }

        socket.on("end", () => {
            log(
                "debug",
                `Client ${remoteAddress} disconnected from port ${localPort}`
            );
        });
        socket.on("data", async (/** @type {Buffer} */ data) => {
            await dataHandler(data, connectionRecord, config, log);
        });
    } catch (error) {
        // The socket was unable to be handled
        const err = new Error(`Socket handler error: ${String(error)}`);
        log("warning", err.message);
        Sentry.addBreadcrumb({ level: "error", message: err.message });
        Sentry.captureException(error);
    }
    socket.on("error", (/** @type {Error} */ error) => {
        const message = String(error);
        // The socket was reset
        if (message.includes("ECONNREFUSED") === true) {
            return log("debug", "Connection was refused");
        }
        if (message.includes("ECONNRESET") === true) {
            return log("debug", "Connection was reset");
        }
        const err = new Error(`Socket error: ${String(error)}`);
        Sentry.addBreadcrumb({ level: "error", message: err.message });
        throw err;
    });
}
