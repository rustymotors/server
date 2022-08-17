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

import { logger } from "mcos-logger/src/index.js";
import type { ISocketRecord } from "mcos-types/types.js";
import { randomUUID } from "node:crypto";
import type { Socket } from "node:net";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const log = logger.child({ service: "mcos:gateway:connections" });

/** @type {ISocketRecord[]} */
const socketRecords: ISocketRecord[] = [];

/**
 *
 * Return all socket records
 * @export
 * @return {ISocketRecord[]}
 */
export function fetchSocketRecords(): ISocketRecord[] {
    return socketRecords;
}

/**
 * Locate socket record by remoteAddress and localPort in the socket records list
 * @param {string} remoteAddress
 * @param {number} localPort
 * @return {ISocketRecord | undefined}
 */
function findSocketRecordByAddressAndPort(
    remoteAddress: string,
    localPort: number
): ISocketRecord | undefined {
    return socketRecords.find((c) => {
        return (
            c.socket.remoteAddress === remoteAddress &&
            c.socket.localPort === localPort
        );
    });
}

/**
 * Creates a new connection object for the socket and adds to list
 * @param {string} connectionId
 * @param {Socket} socket
 * @returns {ISocketRecord}
 */
export function createSocketRecord(
    connectionId: string,
    socket: Socket
): ISocketRecord {
    const { localPort, remoteAddress } = socket;

    if (
        typeof localPort === "undefined" ||
        typeof remoteAddress === "undefined"
    ) {
        const errMessage = `Either localPort or remoteAddress is missing on socket. Can not continue.`;
        log.error(errMessage);
        throw new Error(errMessage);
    }

    /** @type {ISocketRecord} */
    const newSocketRecord: ISocketRecord = {
        socket,
        id: connectionId,
    };
    return newSocketRecord;
}

/**
 * Add new connection to internal list
 *
 * @param {ISocketRecord} connection
 * @return {ISocketRecord[]} the updated list of records
 */
function addSocketRecord(connection: ISocketRecord): ISocketRecord[] {
    socketRecords.push(connection);
    return socketRecords;
}

/**
 * Return an existing connection, or a new one
 *
 * @param {Socket} socket
 * @return {ISocketRecord}
 */
export async function findOrNewConnection(
    socket: Socket
): Promise<ISocketRecord> {
    const { localPort, remoteAddress } = socket;

    if (addressOrPortIsEmpty(localPort, remoteAddress) === false) {
        throw new Error(
            `Either localPort or remoteAddress is missing. Unusable socket.`
        );
    }

    const existingConnection = findSocketRecordByAddressAndPort(
        remoteAddress as string,
        localPort as number
    );

    if (typeof existingConnection !== "undefined") {
        log.info(
            `I have seen connections from ${socket.remoteAddress} on ${socket.localPort} before`
        );

        existingConnection.socket = socket;
        log.debug("[M] Returning found connection after attaching socket");
        return existingConnection;
    }

    const newConnectionId = randomUUID();
    log.debug(`Creating new connection with id ${newConnectionId}`);
    const newSocketRecord = createSocketRecord(newConnectionId, socket);
    log.info(
        `I have not seen connections from ${socket.remoteAddress} on ${socket.localPort} before, adding it.`
    );
    const updatedSocketRecordsList = addSocketRecord(newSocketRecord);

    // Let's make sure we have a connection record
    await addNewConnection(newSocketRecord);

    log.debug(
        `Socket record with id of ${newSocketRecord.id} has been added. The connection list now contains ${updatedSocketRecordsList.length} connections.`
    );
    return newSocketRecord;
}

async function addNewConnection(socketRecord: ISocketRecord): Promise<void> {
    await prisma.connection.upsert({
        where: {
            id: socketRecord.id,
        },
        create: {
            id: socketRecord.id,
            remoteAddress: socketRecord.socket.remoteAddress || "",
            localPort: socketRecord.socket.localPort || 0,
            sequence: 0,
            personaId: 0,
            lastTimeStamp: 0,
            inQueue: true,
            useEncryption: false,
        },
        update: {},
    });
}

/**
 * Check if either remoteAddress or localPort are undefined
 * @param {number} localPort
 * @param {string} remoteAddress
 * @returns {boolean}
 */
function addressOrPortIsEmpty(
    localPort: number | undefined,
    remoteAddress: string | undefined
): boolean {
    if (
        typeof localPort === "undefined" ||
        typeof remoteAddress === "undefined"
    ) {
        return false;
    }
    return true;
}

/**
 * Is this an MCOT bound packet?
 *
 * @export
 * @param {Buffer} inputBuffer
 * @return {boolean}
 */
export function isMCOT(inputBuffer: Buffer): boolean {
    return inputBuffer.toString("utf8", 2, 6) === "TOMC";
}
