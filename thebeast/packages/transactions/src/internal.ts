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

import { messageHandlers } from "./messageHandlers.js";
import { ServerLogger, getServerLogger } from "../../shared/log.js";
import {
    fetchStateFromDatabase,
    getEncryption,
    updateEncryption,
} from "../../shared/State.js";
// eslint-disable-next-line no-unused-vars
import {
    SerializedBuffer,
    OldServerMessage,
} from "../../shared/messageFactory.js";
import { getServerConfiguration } from "../../shared/Configuration.js";
import { ServerMessage } from "../../shared/src/ServerMessage.js";

/**
 *
 *
 * @param {ServerMessage} message
 * @return {boolean}
 */
function isMessageEncrypted(
    message: OldServerMessage | ServerMessage,
): boolean {
    return message._header.flags - 8 >= 0;
}

/**
 * Return the string representation of the numeric opcode
 *
 * @param {number} messageID
 * @return {string}
 */

function _MSG_STRING(
    messageID: number,
    direction: "in" | "out" | "both",
): string {
    const result = messageHandlers.get(messageID);

    if (typeof result !== "undefined" && result.direction === direction) {
        return result.name;
    }

    return "Unknown";
}

/**
 * Route or process MCOTS commands
 * @param {import("./handlers.js").MessageHandlerArgs} args
 * @returns {Promise<import("./handlers.js").MessageHandlerResult>}
 */
async function processInput({
    connectionId,
    packet,
    log,
}: import("../types.js").MessageHandlerArgs): Promise<
    import("../types.js").MessageHandlerResult
> {
    const currentMessageNo = packet._msgNo;
    const currentMessageString = _MSG_STRING(currentMessageNo, "in");

    log.debug(
        `We are attempting to process a message with id ${currentMessageNo}(${currentMessageString})`,
    );

    const result = messageHandlers.get(currentMessageNo);

    if (typeof result !== "undefined") {
        try {
            const responsePackets = await result.handler({
                connectionId,
                packet,
                log,
            });
            return responsePackets;
        } catch (error) {
            const err = new Error(`Error handling packet: ${String(error)}`);
            throw err;
        }
    }

    throw new Error(
        `Message Number Not Handled: ${currentMessageNo} (${currentMessageString}`,
    );
}

/**
 * @param {object} args
 * @param {string} args.connectionId
 * @param {SerializedBuffer} args.message
 * @param {ServerLogger} args.log
 * @returns {Promise<{
 *     connectionId: string,
 *    messages: SerializedBuffer[]
 * }>}
 */
export async function receiveTransactionsData({
    connectionId,
    message,
    log,
}: {
    connectionId: string;
    message: SerializedBuffer;
    log: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: SerializedBuffer[];
}> {
    log.debug(`Received Transaction Server packet: ${connectionId}`);

    // Going to use ServerMessage in this module

    const inboundMessage = new OldServerMessage();
    inboundMessage._doDeserialize(message.data);
    log.debug(
        `Received Transaction Server packet: ${inboundMessage.toString()}`,
    );

    // Is the message encrypted?
    if (isMessageEncrypted(inboundMessage)) {
        log.debug("Message is encrypted");
        // Get the encryyption settings for this connection
        const state = fetchStateFromDatabase();

        const encryptionSettings = getEncryption(state, connectionId);

        if (typeof encryptionSettings === "undefined") {
            throw new Error(
                `Unable to locate encryption settings for connection ${connectionId}`,
            );
        }

        // log the old buffer
        log.debug(`Encrypted buffer: ${inboundMessage.data.toString("hex")}`);

        try {
            const decryptedMessage = encryptionSettings.dataEncryption.decrypt(
                inboundMessage.data,
            );
            updateEncryption(state, encryptionSettings).save();

            // Verify the length of the message
            verifyLength(inboundMessage.data, decryptedMessage);

            // Assuming the message was decrypted successfully, update the buffer
            log.debug(`Decrypted buffer: ${decryptedMessage.toString("hex")}`);

            inboundMessage.setBuffer(decryptedMessage);
            inboundMessage._header.flags -= 8;
            inboundMessage.updateMsgNo();

            log.debug(`Decrypted message: ${inboundMessage.toString()}`);
        } catch (error) {
            throw new Error(`Unable to decrypt message: ${String(error)}`);
        }
    }

    log.debug("Calling processInput()");
    const response = await processInput({
        connectionId,
        packet: inboundMessage,
        log,
    });

    // Loop through the outbound messages and encrypt them
    const outboundMessages: SerializedBuffer[] = [];

    response.messages.forEach((outboundMessage) => {
        log.debug(`Outbound message: ${outboundMessage.toString()}`);

        if (isMessageEncrypted(outboundMessage)) {
            const state = fetchStateFromDatabase();

            const encryptionSettings = getEncryption(state, connectionId);

            if (typeof encryptionSettings === "undefined") {
                throw new Error(
                    `Unable to locate encryption settings for connection ${connectionId}`,
                );
            }

            // log the old buffer
            log.debug(
                `Outbound buffer: ${outboundMessage.data.toString("hex")}`,
            );

            try {
                const encryptedMessage =
                    encryptionSettings.dataEncryption.encrypt(
                        outboundMessage.data,
                    );
                updateEncryption(state, encryptionSettings).save();

                // Verify the length of the message
                verifyLength(outboundMessage.data, encryptedMessage);

                // Assuming the message was decrypted successfully, update the buffer

                log.debug(
                    `Encrypted buffer: ${encryptedMessage.toString("hex")}`,
                );

                outboundMessage.setBuffer(encryptedMessage);

                log.debug(`Encrypted message: ${outboundMessage.toString()}`);

                const outboundRawMessage = new SerializedBuffer();
                outboundRawMessage.setBuffer(outboundMessage.serialize());
                log.debug(
                    `Encrypted message: ${outboundRawMessage.toString()}`,
                );
                outboundMessages.push(outboundRawMessage);
            } catch (error) {
                throw new Error(`Unable to encrypt message: ${String(error)}`);
            }
        } else {
            const outboundRawMessage = new SerializedBuffer();
            outboundRawMessage.setBuffer(outboundMessage.serialize());
            log.debug(`Outbound message: ${outboundRawMessage.toString()}`);
            outboundMessages.push(outboundRawMessage);
        }
    });

    return {
        connectionId,
        messages: outboundMessages,
    };
}

/**
 * @param {Buffer} buffer
 * @param {Buffer} buffer2
 */
export function verifyLength(buffer: Buffer, buffer2: Buffer) {
    if (buffer.length !== buffer2.length) {
        throw new Error(
            `Length mismatch: ${buffer.length} !== ${buffer2.length}`,
        );
    }
}
