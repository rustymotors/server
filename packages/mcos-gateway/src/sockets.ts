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
import { logger } from "mcos-logger/src/index.js";
import { receiveTransactionsData } from "../../mcos-transactions/src/index.js";
import type { InterServiceTransfer, ISocketRecord } from "mcos-types/types.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const log = logger.child({ service: "mcos:gateway:sockets" });

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

// TODO: #1193 Remove commented out code

/**
 * The onData handler
 * takes the data buffer and creates a {@link BufferWithConnection} object
 * @param {Buffer} data
 * @param {ISocketRecord} socketWithId
 * @return {Promise<void>}
 */
export async function dataHandler(
    socketWithId: ISocketRecord,
    traceId: string,
    data: Buffer
): Promise<void> {
    log.debug(`data prior to proccessing: ${data.toString("hex")}`);

    const { localPort, remoteAddress } = socketWithId.socket;

    if (typeof localPort === "undefined") {
        // Somehow we have recived a connection without a local post specified
        log.error(
            `Error locating target port for socket, connection id: ${socketWithId.id}`
        );
        log.error("Closing socket.");
        socketWithId.socket.end();
        return;
    }

    if (typeof remoteAddress === "undefined") {
        // Somehow we have recived a connection without a local post specified
        log.error(
            `Error locating remote address for socket, connection id: ${socketWithId.id}`
        );
        log.error("Closing socket.");
        socketWithId.socket.end();
        return;
    }

    let result: InterServiceTransfer | null;

    // Route the data to the correct service
    // There are 2 happy paths from this point
    // * GameService
    // * TransactionService
    log.raw({
        level: "debug",
        message: "Packet received",
        otherKeys: {
            function: "gateway.dataHandler",
            connectionId: socketWithId.id,
            localPort: String(localPort),
            traceId,
        },
    });

    // These are game services

    result = await handleInboundGameData(
        traceId,
        localPort,
        socketWithId.id,
        data
    );

    if (typeof result === "undefined") {
        // Possibly a tranactions packet?

        // This is a transaction response.

        result = await handleInboundTransactionData(
            traceId,
            localPort,
            socketWithId.id,
            data
        );
    }

    if (result === null) {
        // This is probably an error, let's assume it's not. For now.
        // TODO: #1169 verify there are no happy paths where the services would return zero packets
        const message = "There were zero packets returned for processing";
        log.info(message);
        return;
    }

    const connectionRecord = await prisma.connection.findUnique({
        where: {
            id: socketWithId.id,
        },
    });

    if (connectionRecord === null) {
        throw new Error("Unable to locate connection!");
    }

    if (connectionRecord.useEncryption === true) {
        // We should check encryption here
    }

    log.debug(`Sending Message: ${toHex(result.data)}`);
    socketWithId.socket.write(result.data);
}

/**
 *
 *
 * @param {number} localPort
 * @param {string} connectionId
 * @param {Buffer} data
 * @return {Promise<InterServiceTransfer | void>}
 */
async function handleInboundGameData(
    traceId: string,
    localPort: number,
    connectionId: string,
    data: Buffer
): Promise<InterServiceTransfer | null> {
    let result: InterServiceTransfer | null = {
        traceId,
        targetService: "GATEWAY",
        connectionId,
        data,
    };
    let handledPackets = false;

    if (localPort === 8226) {
        result = await receiveLoginData({
            traceId,
            targetService: "LOGIN",
            connectionId,
            data,
        });
        log.debug("Back in socket manager");
        handledPackets = true;
    }

    if (localPort === 8228) {
        result = await receivePersonaData({
            traceId,
            targetService: "PERSONA",
            connectionId,
            data,
        });
        log.debug("Back in socket manager");
        handledPackets = true;
    }

    if (localPort === 7003) {
        result = await receiveLobbyData({
            traceId,
            targetService: "LOBBY",
            connectionId,
            data,
        });
        log.debug("Back in socket manager");
        handledPackets = true;
    }

    if (!handledPackets) {
        log.debug("The packet was not for a game service");
        return null;
    }

    // TODO: #1170 Create compression method and compress packet if needed
    return result;
}

/**
 *
 * @param {number} localPort
 * @param {string} connectionId
 * @param {Buffer} data
 * @return {Promise<InterServiceTransfer | void>}
 */
async function handleInboundTransactionData(
    traceId: string,
    localPort: number,
    connectionId: string,
    data: Buffer
): Promise<InterServiceTransfer | null> {
    let result: InterServiceTransfer = {
        traceId,
        targetService: "GATEWAY",
        connectionId,
        data,
    };
    let handledPackets = false;

    if (localPort === 43300) {
        result = await receiveTransactionsData({
            traceId,
            targetService: "TRANSACTION",
            connectionId,
            data,
        });
        log.debug("Back in socket manager");
        handledPackets = true;
    }

    if (!handledPackets) {
        log.debug("The packet was not for a transactions service");
        return null;
    }

    // TODO: #1170 Create compression method and compress packet if needed
    return result;
}
