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

import { Logger } from "pino";
import { decryptBuffer } from "../../gateway/src/encryption.js";
import { TBufferWithConnection, ClientConnection, ServiceResponse, ServiceArgs } from "../../interfaces/index.js";
import { MessageNode } from "../../shared/MessageNode.js";
import { ServerError } from "../../shared/errors/ServerError.js";
import { messageHandlers } from "./handlers.js";

/**
 *
 *
 * @param {MessageNode} message
 * @param {TBufferWithConnection} dataConnection
 * @return {boolean}
 */
function shouldMessageBeEncrypted(
    message: MessageNode,
    dataConnection: TBufferWithConnection,
): boolean {
    return message.flags !== 80 && dataConnection.connection.useEncryption;
}

/**
 *
 *
 * @param {MessageNode} message
 * @param {TBufferWithConnection} dataConnection
 * @param {Logger} log
 * @return {{err: Error | null, data: Buffer | null}}
 */
function decryptTransactionBuffer(
    message: MessageNode,
    dataConnection: TBufferWithConnection, // Legacy
    connection: ClientConnection,
    log: Logger,
): { err: Error | null; data: Buffer | null } {
    const encryptedBuffer = Buffer.from(message.data);
    log.debug(
        `Full packet before decrypting: ${encryptedBuffer.toString("hex")}`,
    );

    log.debug(
        `Message buffer before decrypting: ${encryptedBuffer.toString("hex")}`,
    );

    const result = decryptBuffer(
        dataConnection,
        connection,
        encryptedBuffer,
        log,
    );
    log.debug(
        `Message buffer after decrypting: ${result.data.toString("hex")}`,
    );

    if (result.data.readUInt16LE(0) <= 0) {
        return {
            err: new Error("Failure deciphering message, exiting."),
            data: null,
        };
    }
    return { err: null, data: result.data };
}

/**
 *
 *
 * @param {MessageNode} message
 * @param {TBufferWithConnection} dataConnection
 * @param {Logger} log
 * @return {{err: Error | null, data: Buffer | null}}
 */
function tryDecryptBuffer(
    message: MessageNode,
    dataConnection: TBufferWithConnection, // Legacy
    connection: ClientConnection,
    log: Logger,
): { err: Error | null; data: Buffer | null } {
    try {
        return {
            err: null,
            data: decryptTransactionBuffer(
                message,
                dataConnection,
                connection,
                log,
            ).data,
        };
    } catch (error) {
        return {
            err: new Error(
                `Decrypt() exception thrown! Disconnecting...conId:${
                    dataConnection.connectionId
                }: ${String(error)}`,
            ),
            data: null,
        };
    }
}

/**
 * Return the string representation of the numeric opcode
 *
 * @param {number} messageID
 * @return {string}
 */
function _MSG_STRING(messageID: number): string {
    const messageIds = [
        { id: 105, name: "MC_LOGIN" }, // 0x69
        { id: 106, name: "MC_LOGOUT" }, // 0x6a
        { id: 109, name: "MC_SET_OPTIONS" }, // 0x6d
        { id: 141, name: "MC_STOCK_CAR_INFO" }, // 0x8d
        { id: 213, name: "MC_LOGIN_COMPLETE" }, // 0xd5
        { id: 266, name: "MC_UPDATE_PLAYER_PHYSICAL" }, // 0x10a
        { id: 324, name: "MC_GET_LOBBIES" }, // 0x144
        { id: 325, name: "MC_LOBBIES" }, // 0x145
        { id: 391, name: "MC_CLUB_GET_INVITATIONS" }, // 0x187
        { id: 438, name: "MC_CLIENT_CONNECT_MSG" }, // 0x1b6
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
 * @param {TBufferWithConnection} dataConnection
 * @param {MessageNode} node
 * @param {Logger} log
 * @returns {Promise<ServiceResponse>}
 */
async function processInput(
    dataConnection: TBufferWithConnection,
    node: MessageNode,
    log: Logger,
): Promise<ServiceResponse> {
    const currentMessageNo = node.msgNo;
    const currentMessageString = _MSG_STRING(currentMessageNo);

    log.debug(
        `We are attempting to process a message with id ${currentMessageNo}(${currentMessageString})`,
    );

    const result = messageHandlers.find(
        (msg) => msg.name === currentMessageString,
    );

    if (typeof result !== "undefined") {
        try {
            const responsePackets = await result.handler(
                dataConnection.connection,
                node,
                log,
            );
            return responsePackets;
        } catch (error) {
            const err = new Error(`Error handling packet: ${String(error)}`);
            throw err;
        }
    }

    node.setAppId(dataConnection.connection.personaId);

    const err = new Error(
        `Message Number Not Handled: ${currentMessageNo} (${currentMessageString}`,
    );
    throw err;
}

/**
 *
 * @param {MessageNode} message
 * @param {TBufferWithConnection} dataConnection
 * @param {Logger} log
 * @returns {Promise<ServiceResponse>}
 */
async function messageReceived(
    message: MessageNode,
    dataConnection: TBufferWithConnection, // Legacy
    connection: ClientConnection,
    log: Logger,
): Promise<ServiceResponse> {
    // If not a Heartbeat
    if (shouldMessageBeEncrypted(message, dataConnection)) {
        if (
            typeof dataConnection.connection.encryptionSession === "undefined"
        ) {
            const err = new Error(
                `Unabel to locate the encryptors on connection id ${dataConnection.connectionId}`,
            );
            throw err;
        }

        if (message.flags - 8 >= 0) {
            const result = tryDecryptBuffer(
                message,
                dataConnection,
                connection,
                log,
            );
            if (result.err !== null || result.data === null) {
                const err = new Error(String(result.err));
                throw err;
            }
            // Update the MessageNode with the deciphered buffer
            message.updateBuffer(result.data);
        }
    }

    log.debug("Calling processInput()");
    return processInput(dataConnection, message, log);
}

export async function handleData(args: ServiceArgs): Promise<ServiceResponse> {
    const { legacyConnection: dataConnection, connection, log } = args;
    const { connection: legacyConnection, data } = dataConnection;
    const { remoteAddress, localPort } = legacyConnection.socket;

    if (
        typeof localPort === "undefined" ||
        typeof remoteAddress === "undefined"
    ) {
        const err = new Error(
            "Either localPort or remoteAddress is missing on socket.Can not continue.",
        );
        throw err;
    }

    const messageNode = new MessageNode("received");
    messageNode.deserialize(data);

    log.debug(
        `[handle]Received TCP packet',
      ${JSON.stringify({
          localPort,
          remoteAddress,
          direction: messageNode.direction,
          data: data.toString("hex"),
      })} `,
    );
    messageNode.dumpPacket();

    if (typeof connection === "undefined") {
        const err = new ServerError(
            `Unable to locate connection for socket ${remoteAddress}:${localPort}`,
        );
        throw err;
    }

    try {
        const processedPacket = await messageReceived(
            messageNode,
            dataConnection,
            connection,
            log,
        );
        log.debug("Back in transacation server");
        return {
            connection: processedPacket.connection,
            messages: processedPacket.messages,
            log,
        };
    } catch (error) {
        const err = new Error(`Error processing packet: ${String(error)} `);
        throw err;
    }
}
