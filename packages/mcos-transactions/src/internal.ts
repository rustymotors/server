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
import { decryptBuffer, generateEncryptionPair } from "./encryption.js";
import { messageHandlers } from "./handlers.js";
import { MessageNode } from "./MessageNode.js";
import { Connection, PrismaClient } from "@prisma/client";
import type { TLobbyMessage } from "./TLobbyMessage.js";
import type { EncryptionSession } from "mcos-types";
const prisma = new PrismaClient();

const log = logger.child({ service: "mcos:transactions" });

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
 *
 *
 * @param {MessageNode} message
 * @param {BufferWithConnection} dataConnection
 * @return {boolean}
 */
function shouldMessageBeEncrypted(
    connection: Connection,
    message: MessageNode
): boolean {
    return message.flags !== 80 && connection.useEncryption === true;
}

/**
 *
 * @param {Connection} connection
 * @param {MessageNode} encryptedMessage
 * @return {Buffer}
 */
async function decryptTransactionBuffer(
    traceId: string,
    connection: Connection,
    encryptedMessage: MessageNode
): Promise<MessageNode> {
    log.raw({
        level: "debug",
        message: "Session lookup",
        otherKeys: {
            function: "transaction.decryptTransactionBuffer",
            connectionId: connection.id,
            traceId,
        },
    });
    const encryptedBuffer = Buffer.from(encryptedMessage.data);
    log.debug(
        `Full packet before decrypting: ${encryptedBuffer.toString("hex")}`
    );

    log.debug(
        `Message buffer before decrypting: ${encryptedBuffer.toString("hex")}`
    );

    const decryptedData = await decryptBuffer(
        traceId,
        connection,
        encryptedBuffer
    );
    log.debug(
        `Message buffer after decrypting: ${decryptedData.toString("hex")}`
    );

    if (decryptedData.readUInt16LE(0) <= 0) {
        throw new Error("Failure deciphering message, exiting.");
    }
    encryptedMessage.updateBuffer(decryptedData);
    return encryptedMessage;
}

/**
 * Return the string representation of the numeric opcode
 *
 * @param {number} messageID
 * @return {string}
 */
function _MSG_STRING(messageID: number): string {
    const messageIds = [
        { id: 105, name: "MC_LOGIN" },
        { id: 106, name: "MC_LOGOUT" },
        { id: 109, name: "MC_SET_OPTIONS" },
        { id: 141, name: "MC_STOCK_CAR_INFO" },
        { id: 213, name: "MC_LOGIN_COMPLETE" },
        { id: 266, name: "MC_UPDATE_PLAYER_PHYSICAL" },
        { id: 324, name: "MC_GET_LOBBIES" },
        { id: 325, name: "MC_LOBBIES" },
        { id: 438, name: "MC_CLIENT_CONNECT_MSG" },
        { id: 440, name: "MC_TRACKING_MSG" },
    ];
    const result = messageIds.find((id) => id.id === messageID);

    if (typeof result !== "undefined") {
        return result.name;
    }

    return "Unknown";
}

/**
 * Route or process MCOTS commands
 */
async function processInput(
    traceId: string,
    connection: Connection,
    node: MessageNode
): Promise<MessageNode | TLobbyMessage | void> {
    const currentMessageNo = node.msgNo;
    const currentMessageString = _MSG_STRING(currentMessageNo);

    log.raw({
        level: "debug",
        message: "Handling packet",
        otherKeys: {
            function: "transaction.processInput",
            connectionId: connection.id,
            traceId,
            currentMessageNo: String(currentMessageNo),
            currentMessageString,
        },
    });

    log.debug(
        `We are attempting to process a message with id ${currentMessageNo}(${currentMessageString})`
    );

    const result = messageHandlers.find(
        (msg) => msg.name === currentMessageString
    );

    if (typeof result !== "undefined") {
        try {
            log.raw({
                level: "debug",
                message: "Calling handler",
                otherKeys: {
                    function: "transaction.processInput",
                    connectionId: connection.id,
                    traceId,
                    currentMessageString,
                },
            });
            const responsePackets = await result.handler(
                traceId,
                connection,
                node
            );
            return responsePackets;
        } catch (error) {
            throw new Error(`Error in processInput: ${String(error)}`);
        }
    }

    node.setAppId(connection.personaId);
    throw new Error(
        `Message Number Not Handled: ${currentMessageNo} (${currentMessageString})`
    );
}

async function messageReceived(
    traceId: string,
    connection: Connection,
    message: MessageNode
): Promise<MessageNode | TLobbyMessage | void> {
    // if (message.flags && 0x08) {
    //     selectEncryptors(dataConnection.)
    //   log.debug('Turning on encryption')
    //   newConnection.useEncryption = true
    // }

    // If not a Heartbeat
    if (shouldMessageBeEncrypted(connection, message)) {
        // Get connection record
        log.raw({
            level: "debug",
            message: "Session lookup",
            otherKeys: {
                function: "transaction.messageReceived",
                connectionId: connection.id,
                traceId,
            },
        });

        const sessionRecord = prisma.session.findFirst({
            where: {
                connectionId: connection.id,
            },
        });

        if (sessionRecord === null) {
            const errMessage = `Unabel to locate the encryptors on connection id ${connection.id}`;
            log.error(errMessage);
            throw new Error(errMessage);
        }

        log.raw({
            level: "debug",
            message: "Session found",
            otherKeys: {
                function: "transaction.messageReceived",
                connectionId: connection.id,
                traceId,
            },
        });

        if (message.flags - 8 >= 0) {
            message = await decryptTransactionBuffer(
                traceId,
                connection,
                message
            );

            // Update the MessageNode with the deciphered buffer
        }
    }

    log.debug("Calling processInput()");
    const responsePacket = await processInput(traceId, connection, message);
    return responsePacket;
}

/**
 * @param {Connection} connection
 * @param {Buffer} data
 * @return {Promise<Buffer>}
 */
export async function handleData(
    traceId: string,
    connection: Connection,
    data: Buffer
): Promise<Buffer> {
    const messageNode = new MessageNode("received");
    messageNode.deserialize(data);
    log.raw({
        level: "debug",
        message: "Received packet",
        otherKeys: {
            function: "transaction.handleData",
            connectionId: connection.id,
            traceId,
            rawData: data.toString("hex"),
        },
    });
    messageNode.dumpPacket();

    if (messageNode.flags && 8 > 0) {
        // Message is encrypted, message number is not usable. yet.
        log.raw({
            level: "debug",
            message: "Session lookup",
            otherKeys: {
                function: "transaction.handleData",
                connectionId: connection.id,
                traceId,
            },
        });
        const sessionRecord = await prisma.session.findFirst({
            where: {
                connectionId: connection.id,
            },
        });

        if (sessionRecord === null) {
            throw new Error(
                `Unable to locate session for id: ${connection.id}`
            );
        }

        log.raw({
            level: "debug",
            message: "Session found",
            otherKeys: {
                function: "transaction.handleData",
                connectionId: connection.id,
                traceId,
            },
        });

        const encrypters: EncryptionSession = generateEncryptionPair(
            traceId,
            connection,
            sessionRecord
        );
        messageNode.updateBuffer(
            encrypters.tsDecipher.update(messageNode.data)
        );

        log.raw({
            level: "debug",
            message: "Packet decrypted",
            otherKeys: {
                function: "transaction.handleData",
                connectionId: connection.id,
                traceId,
                msgId: String(messageNode.msgNo),
                rawData: toHex(messageNode.rawPacket),
            },
        });

        log.debug(
            `Message number after attempting decryption: ${messageNode.msgNo}`
        );
        log.trace(
            `Raw Packet after decryption: ${toHex(messageNode.rawPacket)}`
        );
    } else {
        log.raw({
            level: "debug",
            message: "Packet does not appear to be encrypted",
            otherKeys: {
                function: "transaction.handleData",
                connectionId: connection.id,
                traceId,
                msgId: String(messageNode.msgNo),
            },
        });
        log.debug(
            `Message with id of: ${messageNode.msgNo} does not appear to be encrypted`
        );
    }

    const processedPacket = await messageReceived(
        traceId,
        connection,
        messageNode
    );
    log.debug("Back in transacation server");

    if (typeof processedPacket === "undefined") {
        throw new Error("We really should not have a void here!");
    }

    return processedPacket.serialize();
}
