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

import { GenericReplyMessage } from "./GenericReplyMessage.js";
import { GenericRequestMessage } from "./GenericRequestMessage.js";
import { StockCarInfoMessage } from "./StockCarInfoMessage.js";
import { StockCar } from "./StockCar.js";
import { ServerMessage } from "../../shared/messageFactory.js";
import { ArcadeCarInfo, ArcadeCarMessage } from "./ArcadeCarMessage.js";
import { GameUrl, GameUrlsMessage } from "./GameUrlsMessage.js";
import { TunablesMessage } from "./TunablesMessage.js";
import { login } from "./login.js";
import { trackingPing } from "./trackingPing.js";
import { clientConnect } from "./clientConnect.js";
import { getLobbies } from "./getLobbies.js";
import { _getOwnedVehicles } from "./_getOwnedVehicles.js";
import { _getPlayerInfo } from "./_getPlayerInfo.js";
import { PlayerPhysicalMessage } from "./PlayerPhysicalMessage.js";

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

export interface MessageHandlerResult {
    connectionId: string;
    messages: ServerMessage[];
}

export interface MessageHandler {
    name: string;
    handler: (args: MessageHandlerArgs) => Promise<MessageHandlerResult>;
}

export const messageHandlers: MessageHandler[] = [
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
    {
        name: "MC_GET_OWNED_VEHICLES",
        handler: _getOwnedVehicles,
    },
    {
        name: "MC_GET_PLAYER_INFO",
        handler: _getPlayerInfo,
    },
    {
        name: "MC_GET_PLAYER_PHYSICAL",
        handler: _getPlayerPhysical,
    }
];

export async function _getPlayerPhysical({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const getPlayerPhysicalMessage = new GenericRequestMessage();
    getPlayerPhysicalMessage.deserialize(packet.data);

    log.debug(`Received Message: ${getPlayerPhysicalMessage.toString()}`);

    const playerId = getPlayerPhysicalMessage.data.readUInt32LE(0);

    const playerPhysicalMessage = new PlayerPhysicalMessage();
    playerPhysicalMessage._msgNo = 265;
    playerPhysicalMessage._playerId = playerId;

    const responsePacket = new ServerMessage();
    responsePacket._header.sequence = packet._header.sequence;
    responsePacket._header.flags = 8;

    responsePacket.setBuffer(playerPhysicalMessage.serialize());

    return { connectionId, messages: [responsePacket] };
}
