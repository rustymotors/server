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
import {
    type TServerLogger,
} from "rusty-motors-shared";

import { ServerLogger } from "rusty-motors-shared";

import { Socket } from "node:net";

import { UserStatusManager, getPortMessageType } from "rusty-motors-nps";
import { handleGameMessage, sendToGameSocket } from "./handleGameMessage.js";
import { Connection } from "rusty-motors-connection";
import { ClientConnectionManager } from "rusty-motors-mcots";

/**
 * Handle socket errors
 */
export function socketErrorHandler({
    connectionId,
    error,
    log,
}: {
    connectionId: string;
    error: NodeJS.ErrnoException;
    log: TServerLogger;
}) {
    // Handle socket errors
    if (error.code == "ECONNRESET") {
        log.debug(`Connection ${connectionId} reset`);
        return;
    }
    log.error(`Socket error: ${error.message} on connection ${connectionId}`);
    throw new Error(
        `Socket error: ${error.message} on connection ${connectionId}`,
    );
}

/**
 * Handle the end of a socket connection
 *
 * @param {object} options
 * @param {string} options.connectionId The connection ID
 * @param {ServerLogger} options.log The logger to use
 */
export function socketEndHandler({
    connectionId,
    log,
}: {
    connectionId: string;
    log: ServerLogger;
}) {
    log.debug(`Connection ${connectionId} ended`);

}

/**
 * Handle incoming TCP connections
 *
 * @param {object} options
 * @param {Socket} options.incomingSocket The incoming socket
 * @param {ServerLogger} options.log The logger to use
 *
 */
export function onSocketConnection({
    incomingSocket,
    log,
}: {
    incomingSocket: Socket;
    log: TServerLogger;
}) {
    log.setName("gateway:onSocketConnection");

    // Get the local port and remote address
    const { localPort, remoteAddress } = incomingSocket;

    if (localPort === undefined || remoteAddress === undefined) {
        log.error("localPort or remoteAddress is undefined");
        throw new Error("localPort or remoteAddress is undefined");
    }

    // This is a new connection so generate a new connection ID
    const connectionId = randomUUID();

    const userStatus = UserStatusManager.newUserStatus();

    if (localPort === 43300) {
        log.info("New connection on port 43300");
        ClientConnectionManager.addConnection(
            new Connection(incomingSocket, connectionId, log),
        );
        return;
    }


    incomingSocket.on("error", (error) =>
        socketErrorHandler({ connectionId: connectionId, error, log }),
    );

    // Add the data handler to the socket
    incomingSocket.on("data", (incomingDataAsBuffer: Buffer) => {
        // Get message type from the port
        let messageType = "Unknown";
        try {
            messageType = getPortMessageType(localPort);
            log.debug(`Message type: ${messageType}`);
        } catch (error) {
            log.error(
                `Error getting message type: ${(error as Error).message}`,
            );
            throw error;
        }

        if (messageType !== "Unknown") {
            // Call the message handler
            if (messageType === "Game") {
                const gameSocketCallback = (messages: Buffer[]) => {
                    sendToGameSocket(messages, incomingSocket, log);
                };

                return handleGameMessage(
                    connectionId,
                    userStatus,
                    incomingDataAsBuffer,
                    log,
                    gameSocketCallback,
                );
            }
        }
    });

    log.debug(`Client ${remoteAddress} connected to port ${localPort}`);

    if (localPort === 7003) {
        log.info("Sending ok to login packet");

        incomingSocket.write(Buffer.from([0x02, 0x30, 0x00, 0x00]));
    }
    log.resetName();
}

// Path: packages/gateway/src/index.ts
