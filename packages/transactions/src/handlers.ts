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
import { LobbyInfo, LobbyMessage } from "./LobbyMessage.js";
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
import { ServerMessage } from "../../shared/messageFactory.js";
import { ArcadeCarInfo, ArcadeCarMessage } from "./ArcadeCarMessage.js";
import { GameUrl, GameUrlsMessage } from "./GameUrlsMessage.js";
import { TunablesMessage } from "./TunablesMessage.js";
import { type } from "os";

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
async function trackingPing({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    // Create new response packet
    const pReply = new GenericReplyMessage();
    pReply.msgNo = 101;
    pReply.msgReply = 440;
    const rPacket = new ServerMessage();
    rPacket._header.sequence = packet._header.sequence + 1;
    rPacket._header.flags = 8;

    rPacket.setBuffer(pReply.serialize());

    log.debug(`TrackingPing: ${rPacket.toString()}`);

    return { connectionId, messages: [rPacket] };
}

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
async function clientConnect({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
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
    responsePacket.setBuffer(pReply.serialize());
    responsePacket._header.sequence = packet._header.sequence;

    log.debug(`Response: ${responsePacket.serialize().toString("hex")}`);

    return { connectionId, messages: [responsePacket] };
}

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
async function login({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    // Read the inbound packet
    const loginMessage = new TLoginMessage();
    loginMessage.deserialize(packet.serialize());
    log.debug(`Received LoginMessage: ${loginMessage.toString()}`);

    // Create new response packet
    const pReply = new GenericReplyMessage();
    pReply.msgNo = 213;
    pReply.msgReply = 105;
    const responsePacket = new ServerMessage();
    responsePacket._header.sequence = packet._header.sequence;
    responsePacket._header.flags = 8;
    responsePacket.setBuffer(pReply.serialize());

    log.debug(`Response: ${responsePacket.toString()}`);

    return { connectionId, messages: [responsePacket] };
}

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
async function logout({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    // Create new response packet
    const pReply = new GenericReplyMessage();
    pReply.msgNo = 101;
    pReply.msgReply = 106;
    const rPacket = new ServerMessage();
    rPacket._header.sequence = packet._header.sequence + 1;
    rPacket._header.flags = 8;
    rPacket.setBuffer(pReply.serialize());

    log.debug(`Logout: ${rPacket.toString()}`);

    return { connectionId, messages: [rPacket] };
}

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
async function _getLobbies({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    log.debug("In _getLobbies...");

    log.debug(`Received Message: ${packet.toString()}`);

    // Create new response packet
    const responsePacket = new ServerMessage();
    responsePacket._header.sequence = packet._header.sequence;
    responsePacket._header.flags = 8;

    const lobbyResponse = new LobbyMessage();
    lobbyResponse._msgNo = 325;
    lobbyResponse._shouldExpectMoreMessages = false;

    const lobby = new LobbyInfo();
    lobby._lobbyId = 1;
    lobby._lobbyName = "Lobby 1";
    lobby._topDog = "Drazi Crendraven";

    log.debug(`Logging LobbyInfo: ${lobby.serialize().toString("hex")}`);

    lobbyResponse.addLobby(lobby);

    log.debug(
        `Logging LobbyMessage: ${lobbyResponse.serialize().toString("hex")}`,
    );

    responsePacket.setBuffer(lobbyResponse.serialize());

    return { connectionId, messages: [responsePacket] };
}

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
async function getLobbies({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
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
async function getStockCarInfo({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
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

    responsePacket.setBuffer(stockCarInfoMessage.serialize());

    return { connectionId, messages: [responsePacket] };
}

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
async function getArcadeCarInfo({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const getArcadeCarInfoMessage = new GenericRequestMessage();
    getArcadeCarInfoMessage.deserialize(packet.data);

    log.debug(`Received Message: ${getArcadeCarInfoMessage.toString()}`);

    const arcadeCarInfoMessage = new ArcadeCarMessage();
    arcadeCarInfoMessage._msgNo = 323;

    const car1 = new ArcadeCarInfo();
    car1._brandedPartId = 113; // Bel-air
    car1._lobbyId = 0;
    arcadeCarInfoMessage.addCar(car1);

    const responsePacket = new ServerMessage();
    responsePacket._header.sequence = packet._header.sequence;
    responsePacket._header.flags = 8;

    responsePacket.setBuffer(arcadeCarInfoMessage.serialize());

    return { connectionId, messages: [responsePacket] };
}

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
async function _getGameUrls({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const getGameUrlsMessage = new GenericRequestMessage();
    getGameUrlsMessage.deserialize(packet.data);

    log.debug(`Received Message: ${getGameUrlsMessage.toString()}`);

    const gameUrlsMessage = new GameUrlsMessage();
    gameUrlsMessage._msgNo = 364;

    const url1 = new GameUrl();
    url1._urlId = 1;
    url1.urlRef = "http://localhost:8080";
    gameUrlsMessage.addURL(url1);

    const responsePacket = new ServerMessage();
    responsePacket._header.sequence = packet._header.sequence;
    responsePacket._header.flags = 8;

    responsePacket.setBuffer(gameUrlsMessage.serialize());

    return { connectionId, messages: [responsePacket] };
}

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
async function _getTunables({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const getTunablesMessage = new GenericRequestMessage();
    getTunablesMessage.deserialize(packet.data);

    log.debug(`Received Message: ${getTunablesMessage.toString()}`);

    const tunablesMessage = new TunablesMessage();
    tunablesMessage._msgNo = 390;

    const responsePacket = new ServerMessage();
    responsePacket._header.sequence = packet._header.sequence;
    responsePacket._header.flags = 8;

    responsePacket.setBuffer(tunablesMessage.serialize());

    return { connectionId, messages: [responsePacket] };
}

export interface MessageHandlerArgs {
    connectionId: string;
    packet: ServerMessage;
    log: import("pino").Logger;
}

export type MessageHandlerResult = {
    connectionId: string;
    messages: ServerMessage[];
};

export type MessageHandlerFunction = (
    arg: MessageHandlerArgs,
) => Promise<MessageHandlerResult>;

/**
 * @readonly
 * @type {{name: string, handler: MessageHandlerFunction}[]}
 */
export const messageHandlers: {
    name: string;
    handler: MessageHandlerFunction;
}[] = [
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
    {
        name: "MC_GET_ARCADE_CARS",
        handler: getArcadeCarInfo,
    },
    {
        name: "MC_GET_GAME_URLS",
        handler: _getGameUrls,
    },
    {
        name: "MC_GET_MCO_TUNABLES",
        handler: _getTunables,
    },
];
