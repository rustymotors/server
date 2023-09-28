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

import { ServerError } from "../../shared/errors/ServerError.js";
import { messageHandlers } from "./handlers.js";
import { getServerLogger } from "../../shared/log.js";
import {
    fetchStateFromDatabase,
    getEncryption,
    updateEncryption,
} from "../../shared/State.js";
// eslint-disable-next-line no-unused-vars
import { RawMessage, ServerMessage } from "../../shared/messageFactory.js";
import { getServerConfiguration } from "../../shared/Configuration.js";

/**
 *
 *
 * @param {ServerMessage} message
 * @return {boolean}
 */
function isMessageEncrypted(message) {
    return message._header.flags - 8 >= 0;
}

/**
 * Return the string representation of the numeric opcode
 *
 * @param {number} messageID
 * @return {string}
 */
function _MSG_STRING(messageID) {
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
 * @param {import("./handlers.js").MessageHandlerArgs} args
 * @returns {Promise<import("./handlers.js").MessageHandlerResult>}
 */
async function processInput({
    connectionId,
    packet,
    log = getServerLogger({
        module: "transactionServer",
    }),
}) {
    const currentMessageNo = packet._msgNo;
    const currentMessageString = _MSG_STRING(currentMessageNo);

    log.debug(
        `We are attempting to process a message with id ${currentMessageNo}(${currentMessageString})`,
    );

    const result = messageHandlers.find(
        (msg) => msg.name === currentMessageString,
    );

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

    throw new ServerError(
        `Message Number Not Handled: ${currentMessageNo} (${currentMessageString}`,
    );
}

/**
 * @param {object} args
 * @param {string} args.connectionId
 * @param {RawMessage} args.message
 * @param {import("pino").Logger} [args.log=getServerLogger({ module: "transactionServer" })]
 * @returns {Promise<{
 *     connectionId: string,
 *    messages: RawMessage[]
 * }>}
 */
export async function receiveTransactionsData({
    connectionId,
    message,
    log = getServerLogger({
        module: "transactionServer",
    }),
}) {
    log.level = getServerConfiguration({}).logLevel ?? "info";

    log.debug(`Received Transaction Server packet: ${connectionId}`);

    // Going to use ServerMessage in this module

    const inboundMessage = new ServerMessage();
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
            throw new ServerError(
                `Unable to locate encryption settings for connection ${connectionId}`,
            );
        }

        try {
            const decryptedMessage = encryptionSettings.dataEncryption.decrypt(
                inboundMessage.data,
            );
            updateEncryption(state, encryptionSettings).save();

            // Assuming the message was decrypted successfully, update the MessageNode
            inboundMessage.updateBuffer(decryptedMessage);
            inboundMessage._header.flags -= 8;

            log.debug(
                `Decrypted message: ${inboundMessage
                    .serialize()
                    .toString("hex")}`,
            );

            log.debug(`Decrypted message: ${inboundMessage.toString()}`);
        } catch (error) {
            throw new ServerError(
                `Unable to decrypt message: ${String(error)}`,
            );
        }
    }

    log.debug("Calling processInput()");
    const response = await processInput({
        connectionId,
        packet: inboundMessage,
        log,
    });

    // Loop through the outbound messages and encrypt them
    /** @type {RawMessage[]} */
    const outboundMessages = [];

    response.messages.forEach((outboundMessage) => {
        log.debug(`Outbound message: ${outboundMessage.toString()}`);

        if (isMessageEncrypted(outboundMessage)) {
            const state = fetchStateFromDatabase();

            const encryptionSettings = getEncryption(state, connectionId);

            if (typeof encryptionSettings === "undefined") {
                throw new ServerError(
                    `Unable to locate encryption settings for connection ${connectionId}`,
                );
            }

            try {
                const encryptedMessage =
                    encryptionSettings.dataEncryption.encrypt(
                        outboundMessage.data,
                    );
                updateEncryption(state, encryptionSettings).save();

                log.debug(
                    `Encrypted message: ${encryptedMessage.toString("hex")}`,
                );

                outboundMessage.data = encryptedMessage;

                log.debug(`Encrypted message: ${outboundMessage.toString()}`);

                const outboundRawMessage = new RawMessage();
                outboundRawMessage.data = outboundMessage.serialize();
                log.debug(
                    `Encrypted message: ${outboundRawMessage.toString()}`,
                );
                outboundMessages.push(outboundRawMessage);
            } catch (error) {
                throw new ServerError(
                    `Unable to encrypt message: ${String(error)}`,
                );
            }
        } else {
            const outboundRawMessage = new RawMessage();
            outboundRawMessage.data = outboundMessage.serialize();
            log.debug(`Outbound message: ${outboundRawMessage.toString()}`);
            outboundMessages.push(outboundRawMessage);
        }
    });

    return {
        connectionId,
        messages: outboundMessages,
    };
}
