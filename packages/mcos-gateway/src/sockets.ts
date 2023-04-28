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

import { ELOG_LEVEL, Sentry, TBinaryStructure, TBufferWithConnection, TMessageNode, TServerConfiguration, TServerLogger, TServiceResponse, TSocketWithConnectionInfo } from "mcos/shared";
import { receiveLobbyData } from "mcos/lobby";
import { receiveLoginData } from "mcos/login";
import { receivePersonaData } from "mcos/persona";
import { receiveTransactionsData } from "mcos/transactions";
import { findOrNewConnection, updateConnection } from "./connections.js";
import { MessageNode } from "./MessageNode.js";
import { interfaces } from "mocha";
import { Socket } from "net";
import { NPSMessage } from "../../../src/shared/NPSMessage.js";

/**
 * Convert to zero padded hex
 *
 * @export
 * @param {Buffer} data
 * @return {string}
 */
export function toHex(data: Buffer): string {
    /** @type {string[]} */
    const bytes: string[] = [];
    data.forEach((b) => {
        bytes.push(b.toString(16).toUpperCase().padStart(2, "0"));
    });
    return bytes.join("");
}

export interface TServiceRouter {
    (
        connection: TBufferWithConnection, 
        config: TServerConfiguration, 
        log: TServerLogger): Promise<TServiceResponse>
}

/**
 * @type {TServiceRouter}
 */
const serviceRouters: Record<number, TServiceRouter> = {
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
function sendMessages(messages: NPSMessage[] | TMessageNode[] | TBinaryStructure[], outboundConnection: TSocketWithConnectionInfo, log: TServerLogger) {
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
export async function dataHandler(data: Buffer, connection: TSocketWithConnectionInfo, config: TServerConfiguration, log: TServerLogger): Promise<void> {
    log("debug", `data prior to proccessing: ${data.toString("hex")}`);

    // Link the data and the connection together
    /** @type {TBufferWithConnection} */
    const networkBuffer: TBufferWithConnection = {
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
 * @param {Socket} socket
 * @param {TServerConfiguration} config
 * @param {TServerLogger} log
 * @return {void}
 */
export function TCPHandler(socket: Socket, config: any, log: TServerLogger): void {
    // Received a new connection
    // Turn it into a connection object
    const connectionRecord = findOrNewConnection(socket, log);

    const { localPort, remoteAddress } = socket;
    log("debug", `Client ${remoteAddress} connected to port ${localPort}`);
    if (socket.localPort === 7003 && connectionRecord.inQueue === true) {
        /**
         * Debug seems hard-coded to use the connection queue
         * Craft a packet that tells the client it's allowed to login
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
    socket.on("data", async (data: any) => {
        await dataHandler(data, connectionRecord, config, log);
    });
    socket.on("error", (error: any) => {
        const message = String(error);
        if (message.includes("ECONNRESET") === true) {
            return log("debug", "Connection was reset");
        }
        const err = new Error(`Socket error: ${String(error)}`);
        Sentry.addBreadcrumb({ level: "error", message: err.message });
        throw err;
    });
}
