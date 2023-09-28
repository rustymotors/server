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

import { GenericReply, GenericReplyMessage } from "./GenericReplyMessage.js";
import { TClientConnectMessage } from "./TClientConnectMessage.js";
import { LobbyMessage } from "./LobbyMessage.js";
import { TLoginMessage } from "./TLoginMessage.js";
import { GenericRequestMessage } from "./GenericRequestMessage.js";
import { StockCarInfoMessage } from "./StockCarInfoMessage.js";
import { StockCar } from "./StockCar.js";
import { getDatabaseServer } from "../../database/src/DatabaseManager.js";
import { ServerError } from "../../shared/errors/ServerError.js";
import {
    McosEncryption,
    addEncryption,
    fetchStateFromDatabase,
    getEncryption,
} from "../../shared/State.js";
import {
    createCommandEncryptionPair,
    createDataEncryptionPair,
} from "../../gateway/src/encryption.js";
// eslint-disable-next-line no-unused-vars
import { RawMessage, ServerMessage } from "../../shared/messageFactory.js";

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
async function trackingPing({ connectionId, packet, log }) {
    // Create new response packet
    const pReply = new GenericReplyMessage();
    pReply.msgNo = 101;
    pReply.msgReply = 440;
    const rPacket = new ServerMessage();
    rPacket._header.sequence = packet._header.sequence + 1;
    rPacket._header.flags = 8;

    rPacket.data = pReply.serialize();

    log.debug(`TrackingPing: ${rPacket.toString()}`);

    return { connectionId, messages: [rPacket] };
}

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
async function clientConnect({ connectionId, packet, log }) {
    /**
     * Let's turn it into a ClientConnectMsg
     */
    const newMessage = new TClientConnectMessage();

    newMessage.deserialize(packet.serialize());

    log.debug(`ClientConnectMsg: ${newMessage.toString()}`);

    const customerId = newMessage._customerId;
    if (typeof customerId !== "number") {
        throw new TypeError(
            `customerId is wrong type. Expected 'number', got ${typeof customerId}`,
        );
    }

    const state = fetchStateFromDatabase();

    const existingEncryption = getEncryption(state, connectionId);

    if (existingEncryption) {
        log.debug("Encryption already exists for this connection");
        return { connectionId, messages: [] };
    }

    let result;

    try {
        log.debug(`Looking up the session key for ${customerId}...`);

        result = await getDatabaseServer({
            log,
        }).fetchSessionKeyByCustomerId(customerId);
        log.debug("[TCPManager] Session Key located!");
    } catch (error) {
        throw new ServerError(`Error fetching session key: ${error}`);
    }

    try {
        const newCommandEncryptionPair = createCommandEncryptionPair(
            result.sessionKey,
        );

        const newDataEncryptionPair = createDataEncryptionPair(
            result.sessionKey,
        );

        const newEncryption = new McosEncryption({
            connectionId,
            commandEncryptionPair: newCommandEncryptionPair,
            dataEncryptionPair: newDataEncryptionPair,
        });

        addEncryption(state, newEncryption).save();
    } catch (error) {
        throw new ServerError(`Error creating encryption: ${error}`);
    }

    const personaId = newMessage._personaId;

    const personaName = newMessage._personaName;

    log.debug(`cust: ${customerId} ID: ${personaId} Name: ${personaName}`);

    // Create new response packet
    const pReply = new GenericReply();
    pReply.msgNo = 101;
    pReply.msgReply = newMessage._msgNo;

    const responsePacket = new ServerMessage();
    responsePacket.updateBuffer(pReply.serialize());
    responsePacket._header.sequence = packet._header.sequence + 1;
    responsePacket._header.flags = 8;

    log.debug(`Response: ${responsePacket.serialize().toString("hex")}`);

    return { connectionId, messages: [responsePacket] };
}

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
async function login({ connectionId, packet, log }) {
    // Read the inbound packet
    const loginMessage = new TLoginMessage(log);
    loginMessage.deserialize(packet.serialize());
    log.debug(`Received LoginMessage: ${loginMessage.toString()}`);

    // Create new response packet
    const pReply = new GenericReplyMessage();
    pReply.msgNo = 213;
    pReply.msgReply = 105;
    const rPacket = new ServerMessage();
    rPacket._header.sequence = packet._header.sequence + 1;
    rPacket._header.flags = 8;
    rPacket.data = pReply.serialize();

    log.debug(`Login: ${rPacket.toString()}`);

    return { connectionId, messages: [rPacket] };
}

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
async function logout({ connectionId, packet, log }) {
    // Create new response packet
    const pReply = new GenericReplyMessage();
    pReply.msgNo = 101;
    pReply.msgReply = 106;
    const rPacket = new ServerMessage();
    rPacket._header.sequence = packet._header.sequence + 1;
    rPacket._header.flags = 8;
    rPacket.data = pReply.serialize();

    log.debug(`Logout: ${rPacket.toString()}`);

    return { connectionId, messages: [rPacket] };
}

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
async function _getLobbies({ connectionId, packet, log }) {
    log.debug("In _getLobbies...");

    log.debug(`Received Message: ${packet.toString()}`);

    // Create new response packet
    const responsePacket = new ServerMessage();
    responsePacket._header.sequence = packet._header.sequence + 1;
    responsePacket._header.flags = 8;

    const lobbyResponse = new LobbyMessage(log);
    lobbyResponse._msgNo = 325;
    lobbyResponse._lobbyCount = 0;
    lobbyResponse._shouldExpectMoreMessages = false;

    responsePacket.data = lobbyResponse.serialize();

    return { connectionId, messages: [responsePacket] };
}

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
async function getLobbies({ connectionId, packet, log }) {
    const result = await _getLobbies({ connectionId, packet, log });
    log.debug("Dumping Lobbies response packet...");
    result.messages.forEach((msg) => {
        log.debug(msg.toString());
    });
    log.debug(result.messages.join().toString());
    return {
        connectionId,
        messages: result.messages,
    };
}

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
async function getStockCarInfo({ connectionId, packet, log }) {
    const getStockCarInfoMessage = new GenericRequestMessage();
    getStockCarInfoMessage.deserialize(packet.data);

    log.debug(`Received Message: ${getStockCarInfoMessage.toString()}`);

    const stockCarInfoMessage = new StockCarInfoMessage(200, 0, 105);
    stockCarInfoMessage.starterCash = 200;
    stockCarInfoMessage.dealerId = 8;
    stockCarInfoMessage.brand = 105;

    stockCarInfoMessage.addStockCar(new StockCar(113, 20, false)); // Bel-air
    stockCarInfoMessage.addStockCar(new StockCar(104, 15, true)); // Fairlane - Deal of the day
    stockCarInfoMessage.addStockCar(new StockCar(402, 20, false)); // Century

    log.debug(`Sending Message: ${stockCarInfoMessage.toString()}`);

    const responsePacket = new ServerMessage();
    responsePacket._header.sequence = packet._header.sequence + 1;
    responsePacket._header.flags = 8;

    responsePacket.data = stockCarInfoMessage.serialize();

    log.debug("Dumping response...");
    log.debug(responsePacket.toString());

    return { connectionId, messages: [responsePacket] };
}

/**
 * @typedef {object} MessageHandlerArgs
 * @property {string} connectionId
 * @property {ServerMessage} packet
 * @property {import("pino").Logger} log
 */

/**
 * @typedef {{
 *      connectionId: string,
 *      messages: ServerMessage[]
 * }} MessageHandlerResult
 */

/**
 * @typedef {(arg: MessageHandlerArgs) => Promise<MessageHandlerResult>} MessageHandlerFunction
 */

/**
 * @readonly
 * @type {{name: string, handler: MessageHandlerFunction}[]}
 */
export const messageHandlers = [
    {
        name: "MC_TRACKING_MSG",
        handler: trackingPing,
    },
    {
        name: "MC_CLIENT_CONNECT_MSG",
        handler: clientConnect,
    },
    {
        name: "MC_LOGIN",
        handler: login,
    },
    {
        name: "MC_LOGOUT",
        handler: logout,
    },
    {
        name: "MC_GET_LOBBIES",
        handler: getLobbies,
    },
    {
        name: "MC_STOCK_CAR_INFO",
        handler: getStockCarInfo,
    },
];
