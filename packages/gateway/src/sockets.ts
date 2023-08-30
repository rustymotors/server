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
    ClientConnection,
    ClientMessage,
    GameMessage,
    TBufferWithConnection,
    ServerConfiguration,
    Logger,
    ServiceResponse,
    Service,
    SocketWithConnectionInfo,
} from "@mcos/interfaces";
import { receiveLobbyData } from "@mcos/lobby";
import { receiveLoginData } from "@mcos/login";
import { receivePersonaData } from "@mcos/persona";
import { MessageNode, Sentry } from "@mcos/shared";
import { receiveTransactionsData } from "@mcos/transactions";
import { updateConnection } from "./ConnectionManager.js";

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

/**
 * @type {Service}
 */
const serviceRouters: Record<number, Service> = {
    8226: receiveLoginData,
    8228: receivePersonaData,
    7003: receiveLobbyData,
    43300: receiveTransactionsData,
};

/**
 *
 * @param {TNPSMessage[] | TransactionMessage[] | BinaryStructure[]} messages
 * @param {SocketWithConnectionInfo} outboundConnection
 * @param {Logger} log
 */
function sendMessages(
    messages: GameMessage[] | ClientMessage[] | MessageNode[],
    outboundConnection: SocketWithConnectionInfo,
    log: Logger,
) {
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
                    "There was a fatal error attempting to encrypt the message!",
                );
                log(
                    "debug",
                    `usingEncryption? ${outboundConnection.useEncryption}, packetLength: ${f.data.byteLength}/${f.dataLength}`,
                );
                Sentry.addBreadcrumb({ level: "error", message: err.message });
                throw err;
            } else {
                log(
                    "debug",
                    `Message prior to encryption: ${toHex(f.serialize())}`,
                );
                f.updateBuffer(
                    outboundConnection.encryptionSession.tsCipher.update(
                        f.data,
                    ),
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
 */
export async function dataHandler({
    data,
    connectionRecord,
    config,
    logger: log,
    connection,
}: {
    data: Buffer;
    connectionRecord: SocketWithConnectionInfo;
    config: ServerConfiguration;
    logger: Logger;
    connection: ClientConnection;
    message: ClientMessage | GameMessage;
}): Promise<void> {
    log("debug", `data prior to proccessing: ${data.toString("hex")}`);

    // Link the data and the connection together
    /** @type {TBufferWithConnection} */
    const networkBuffer: TBufferWithConnection = {
        connectionId: connectionRecord.id,
        connection: connectionRecord,
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
            `Error locating remote address or target port for socket, connection id: ${networkBuffer.connectionId}`,
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
            /** @type {ServiceResponse} */
            const result: ServiceResponse = await serviceRouters[localPort]({
                legacyConnection: networkBuffer,
                connection,
                config,
                log,
            });

            const messages = result.messages;

            const outboundConnection = result.connection;

            const packetCount = messages.length;
            log("debug", `There are ${packetCount} messages ready for sending`);

            sendMessages(messages, outboundConnection, log);

            // Update the connection
            updateConnection(outboundConnection.id, outboundConnection, log);
        } catch (error) {
            Sentry.captureException(error);
            process.exitCode = -1;
            const err = new Error(
                `There was an error processing the packet: ${String(error)}`,
            );
            Sentry.addBreadcrumb({ level: "error", message: err.message });
            throw err;
        }
    }
}
