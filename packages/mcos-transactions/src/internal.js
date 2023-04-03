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
    decryptBuffer,
    selectEncryptors,
} from "../../mcos-gateway/src/encryption.js";
import { messageHandlers } from "./handlers.js";
import log from "../../../log.js";
import { MessageNode } from "../../mcos-gateway/src/MessageNode.js";
import { toHex } from "../../mcos-gateway/src/BinaryStructure.js";

/**
 *
 *
 * @param {MessageNode} message
 * @param {import("../../mcos-gateway/src/sockets.js").BufferWithConnection} dataConnection
 * @return {boolean}
 */
function shouldMessageBeEncrypted(message, dataConnection) {
    return message.flags !== 80 && dataConnection.connection.useEncryption;
}

/**
 *
 *
 * @param {MessageNode} message
 * @param {import("../../mcos-gateway/src/sockets.js").BufferWithConnection} dataConnection
 * @return {{err: Error | null, data: Buffer | null}}
 */
function decryptTransactionBuffer(message, dataConnection) {
    const encryptedBuffer = Buffer.from(message.data);
    log.info(
        `Full packet before decrypting: ${encryptedBuffer.toString("hex")}`
    );

    log.info(
        `Message buffer before decrypting: ${encryptedBuffer.toString("hex")}`
    );

    const result = decryptBuffer(dataConnection, encryptedBuffer);
    log.info(`Message buffer after decrypting: ${result.data.toString("hex")}`);

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
 * @param {import("../../mcos-gateway/src/sockets.js").BufferWithConnection} dataConnection
 * @return {{err: Error | null, data: Buffer | null}}
 */
function tryDecryptBuffer(message, dataConnection) {
    try {
        return {
            err: null,
            data: decryptTransactionBuffer(message, dataConnection).data,
        };
    } catch (error) {
        return {
            err: new Error(
                `Decrypt() exception thrown! Disconnecting...conId:${
                    dataConnection.connectionId
                }: ${String(error)}`
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
function _MSG_STRING(messageID) {
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
 * @param {import("../../mcos-gateway/src/sockets.js").BufferWithConnection} dataConnection
 * @param {MessageNode} node
 * @returns {Promise<import("../../mcos-gateway/src/sockets.js").ServiceResponse>}
 */
async function processInput(dataConnection, node) {
    const currentMessageNo = node.msgNo;
    const currentMessageString = _MSG_STRING(currentMessageNo);

    log.info(
        `We are attempting to process a message with id ${currentMessageNo}(${currentMessageString})`
    );

    const result = messageHandlers.find(
        (msg) => msg.name === currentMessageString
    );

    if (typeof result !== "undefined") {
        try {
            const responsePackets = await result.handler(
                dataConnection.connection,
                node
            );
            return responsePackets;
        } catch (error) {
            throw new Error(`Error handling packet: ${String(error)}`);
        }
    }

    node.setAppId(dataConnection.connection.personaId);

    throw new Error(
        `Message Number Not Handled: ${currentMessageNo} (${currentMessageString}`
    );
}

/**
 *
 * @param {MessageNode} message
 * @param {import("../../mcos-gateway/src/sockets.js").BufferWithConnection} dataConnection
 * @returns {Promise<import("../../mcos-gateway/src/sockets.js").ServiceResponse>}
 */
async function messageReceived(message, dataConnection) {
    // if (message.flags && 0x08) {
    //     selectEncryptors(dataConnection.)
    //   debug('Turning on encryption')
    //   newConnection.useEncryption = true
    // }

    // If not a Heartbeat
    if (shouldMessageBeEncrypted(message, dataConnection)) {
        if (
            typeof dataConnection.connection.encryptionSession === "undefined"
        ) {
            const errMessage = `Unabel to locate the encryptors on connection id ${dataConnection.connectionId}`;
            log.error(errMessage);
            throw new Error(errMessage);
        }

        if (message.flags - 8 >= 0) {
            const result = tryDecryptBuffer(message, dataConnection);
            if (result.err !== null || result.data === null) {
                throw new Error(String(result.err));
            }
            // Update the MessageNode with the deciphered buffer
            message.updateBuffer(result.data);
        }
    }

    log.info("Calling processInput()");
    return processInput(dataConnection, message);
}

/**
 * @param {import("../../mcos-gateway/src/sockets.js").BufferWithConnection} dataConnection
 * @return {Promise<import("../../mcos-gateway/src/sockets.js").MessageArrayWithConnection>}
 */
export async function handleData(dataConnection) {
    const { connection, data } = dataConnection;
    const { remoteAddress, localPort } = connection.socket;

    if (
        typeof localPort === "undefined" ||
        typeof remoteAddress === "undefined"
    ) {
        const errMessage = `Either localPort or remoteAddress is missing on socket.Can not continue.`;
        log.error(errMessage);
        throw new Error(errMessage);
    }

    const messageNode = new MessageNode("received");
    messageNode.deserialize(data);

    log.info(
        `[handle]Received TCP packet',
      ${JSON.stringify({
          localPort,
          remoteAddress,
          direction: messageNode.direction,
          data: data.toString("hex"),
      })} `
    );
    messageNode.dumpPacket();

    if (messageNode.flags && 8 > 0) {
        // Message is encrypted, message number is not usable. yet.
        const encrypters = selectEncryptors(dataConnection);
        messageNode.updateBuffer(
            encrypters.tsDecipher.update(messageNode.data)
        );
        log.info(
            `Message number after attempting decryption: ${messageNode.msgNo} `
        );
        log.info(
            `Raw Packet after decryption: ${toHex(messageNode.rawPacket)} `
        );
    } else {
        log.info(
            `Message with id of: ${messageNode.msgNo} does not appear to be encrypted`
        );
    }

    try {
        const processedPacket = await messageReceived(
            messageNode,
            dataConnection
        );
        log.info("Back in transacation server");
        return {
            connection: processedPacket.connection,
            messages: processedPacket.messages,
        };
    } catch (error) {
        throw new Error(`Error processing packet: ${String(error)} `);
    }
}
