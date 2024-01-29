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
import * as Sentry from "@sentry/node";
import {
    OnDataHandler,
    addSocket,
    fetchStateFromDatabase,
    getOnDataHandler,
    removeSocket,
    wrapSocket,
} from "../../shared/State.js";

import { ServerLogger, getServerLogger } from "../../shared/log.js";

import { Socket } from "node:net";
import { getGatewayServer } from "./GatewayServer.js";
import { SerializedBuffer } from "../../shared/messageFactory.js";

import {
    MessageProcessorError,
    PortMapError,
    getGameMessageProcessor,
    getPortMessageType,
    GameMessage,
    getWord,
} from "../../../lib/nps/index.js";
import { SocketCallback } from "../../../lib/nps/messageProcessors/index.js";
import { getAsHex } from "../../../lib/nps/utils/pureGet.js";

/**
 * @typedef {object} OnDataHandlerArgs
 * @property {object} args
 * @property {string} args.connectionId The connection id of the socket that
 *                                  received the data.
 * @property {module:packages/shared/RawMessage} args.message The data that was received.
 * @property {module:shared/log.ServerLogger} [args.log=getServerLogger({ module: "gateway" })] The logger to use.
 *                                                                    response
 *                                                                to the
 *                                                           data.
 */

/**
 * @typedef {function} OnDataHandler
 * @param {OnDataHandlerArgs} args The arguments for the handler.
 * @returns {ServiceResponse} The
 *                                                                     response
 *                                                                  to the
 *                                                            data.
 */

/**
 * Handle socket errors
 */
export function socketErrorHandler({
    connectionId,
    error,
    log = getServerLogger({
        module: "socketErrorHandler",
    }),
}: {
    connectionId: string;
    error: NodeJS.ErrnoException;
    log?: ServerLogger;
}) {
    // Handle socket errors
    if (error.code == "ECONNRESET") {
        log.debug(`Connection ${connectionId} reset`);
        return;
    }
    throw new Error(
        `Socket error: ${error.message} on connection ${connectionId}`,
    );
}

/**
 * Handle the end of a socket connection
 *
 * @param {object} options
 * @param {string} options.connectionId The connection ID
 * @param {ServerLogger} [options.log=getServerLogger({ module: "socketEndHandler" })] The logger to use
 */
export function socketEndHandler({
    connectionId,
    log = getServerLogger({
        module: "socketEndHandler",
    }),
}: {
    connectionId: string;
    log?: ServerLogger;
}) {
    log.debug(`Connection ${connectionId} ended`);

    // Remove the socket from the global state
    removeSocket(fetchStateFromDatabase(), connectionId).save();
}

/**
 * Handle incoming TCP connections
 *
 * @param {object} options
 * @param {module:net.Socket} options.incomingSocket The incoming socket
 * @param {ServerLogger} [options.log=getServerLogger({ module: "onDataHandler" })] The logger to use
 *
 */
export function onSocketConnection({
    incomingSocket,
    log = getServerLogger({
        module: "onDataHandler",
    }),
}: {
    incomingSocket: Socket;
    log?: ServerLogger;
}) {
    // Get the local port and remote address
    const { localPort, remoteAddress } = incomingSocket;

    if (localPort === undefined || remoteAddress === undefined) {
        throw new Error("localPort or remoteAddress is undefined");
    }

    // This is a new connection so generate a new connection ID
    const connectionId = randomUUID();

    // Wrap the socket and add it to the global state
    const wrappedSocket = wrapSocket(incomingSocket, connectionId);

    // Add the socket to the global state
    addSocket(fetchStateFromDatabase(), wrappedSocket).save();

    // This is a new TCP socket, so it's probably not using HTTP
    // Let's look for a port onData handler
    /** @type {OnDataHandler | undefined} */
    const portOnDataHandler: OnDataHandler | undefined = getOnDataHandler(
        fetchStateFromDatabase(),
        localPort,
    );

    // Throw an error if there is no onData handler
    if (!portOnDataHandler) {
        log.warn(`No onData handler for port ${localPort}`);
        return;
    }

    incomingSocket.on("error", (error) =>
        socketErrorHandler({ connectionId: connectionId, error }),
    );

    // Add the data handler to the socket
    incomingSocket.on("data", (incomingDataAsBuffer: Buffer) => {
        // Get message type from the port
        let messageType = "Unknown";
        try {
            messageType = getPortMessageType(localPort);
            log.debug(`Message type: ${messageType}`);
        } catch (error) {
            if (error instanceof PortMapError) {
                log.error(`Error getting message type: ${error}`);
            } else {
                throw error;
            }
        }

        if (messageType !== "Unknown") {
            const socketCallback = (messages: Buffer[]) => {
                sendToSocket(messages, incomingSocket, log);
            };

            // Call the message handler
            if (messageType === "Game") {
                handleGameMessage(
                    connectionId,
                    incomingDataAsBuffer,
                    log,
                    socketCallback,
                );
                return;
            }
        }

        // Normal handlers can handle the server message

        // Deserialize the raw message
        const rawMessage = new SerializedBuffer()._doDeserialize(
            incomingDataAsBuffer,
        );

        log.debug("Calling onData handler");

        portOnDataHandler({
            connectionId: connectionId,
            message: rawMessage,
        })
            .then(
                (
                    /** @type {import("../../shared/State.js").ServiceResponse} */ response: import("../../shared/State.js").ServiceResponse,
                ) => {
                    log.debug("onData handler returned");
                    const { messages } = response;

                    // Log the messages
                    log.trace(`Messages: ${messages.map((m) => m.toString())}`);

                    // Serialize the messages
                    const serializedMessages = messages.map((m) =>
                        m.serialize(),
                    );

                    sendToSocket(serializedMessages, incomingSocket, log);
                },
            )
            .catch((/** @type {Error} */ error: Error) => {
                log.error(`Error handling data: ${String(error)}`);

                // Call server shutdown
                getGatewayServer({}).shutdown();
            });
    });

    log.debug(`Client ${remoteAddress} connected to port ${localPort}`);

    if (localPort === 7003) {
        console.log("Sending ok to login packet");

        incomingSocket.write(Buffer.from([0x02, 0x30, 0x00, 0x00]));
    }
}

function sendToSocket(
    serializedMessages: Buffer[],
    incomingSocket: Socket,
    log: ServerLogger,
) {
    log.debug(`Sending {${serializedMessages.length}} messages to socket`);
    try {
        serializedMessages.forEach((m) => {
            incomingSocket.write(m);
            log.trace(`Sent ${m.length} bytes to socket: ${m.toString("hex")}`);
            log.trace("===========================================");
        });
    } catch (error) {
        log.error(`Error sending data: ${String(error)}`);
    }
}

export function processGameMessage(
    connectionId: string,
    message: GameMessage,
    log = getServerLogger({ module: "processGameMessage" }),
    socketCallback: SocketCallback,
) {
    log.debug(`Processing game message...`);

    // Get the message ID
    const messageId = message.header.getId();

    try {
        // Get the message processor
        const messageProcessor = getGameMessageProcessor(messageId);

        // Call the message processor
        messageProcessor(connectionId, message, socketCallback);
    } catch (error) {
        throw new MessageProcessorError(
            messageId,
            `Error processing message: ${error}`,
        );
    }
}

export function handleGameMessage(
    connectionId: string,
    bytes: Buffer,
    log = getServerLogger({ module: "handleGameMessage" }),
    socketCallback: SocketCallback,
) {
    log.debug(`Handling game message...`);

    // Log raw bytes
    log.trace(`Raw bytes: ${bytes.toString("hex")}`);

    // Try to identify the message version
    const version = GameMessage.identifyVersion(bytes);

    // Log the version
    log.debug(`Message version: ${version}`);

    // Try to parse it
    try {
        // Create a new message
        const message = new GameMessage(version);
        message.deserialize(bytes);

        // Process the message
        const t = Sentry.startTransaction({
            name: `Process message ${message.header.getId()}`,
        });
        processGameMessage(connectionId, message, log, socketCallback);
        t.finish();
    } catch (error) {
        if (error instanceof MessageProcessorError) {
            log.error(`Error processing message: ${error}`);
        } else {
            throw error;
        }
    }
}

export function handleServerMessage(
    connectionId: string,
    bytes: Buffer,
    log = getServerLogger({ module: "handleServerMessage" }),
    socketCallback: SocketCallback,
) {
    log.debug(`Handling server message...`);

    // If this is a Server message, it will "probably" be a ServerMessage
    // Try to parse it as a ServerMessage

    // TODO: Handle message
}
