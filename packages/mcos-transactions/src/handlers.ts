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
import { GenericReplyMessage } from "./GenericReplyMessage.js";
import { MessageNode } from "./MessageNode.js";
import { TClientConnectMessage } from "./TClientConnectMessage.js";
import { TLoginMessage } from "./TLoginMessage.js";
import { GenericRequestMessage } from "./GenericRequestMessage.js";
import { TLobbyMessage } from "./TLobbyMessage.js";
import { StockCarInfoMessage } from "./StockCarInfoMessage.js";
import { StockCar } from "./StockCar.js";
import type { Connection } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const log = logger.child({ service: "mcos:transactions:handlers" });

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
 * @private
 * @param {ISocketRecord} connection
 * @param {MessageNode} node
 * @return {TSMessageArrayWithConnection}
 */
function _setOptions(connection: Connection, node: MessageNode): MessageNode {
    const setOptionsMessage = node;

    setOptionsMessage.data = node.serialize();

    // Update the appId
    setOptionsMessage.appId = connection.personaId;

    // Create new response packet
    const pReply = new GenericReplyMessage();
    pReply.msgNo = 101;
    pReply.msgReply = 109;
    const rPacket = new MessageNode("sent");

    rPacket.deserialize(node.serialize());
    rPacket.updateBuffer(pReply.serialize());
    rPacket.dumpPacket();

    return rPacket;
}

/**
 *
 *
 * @param {ISocketRecord} conn
 * @param {MessageNode} node
 * @return {TSMessageArrayWithConnection}
 * @memberof MCOTServer
 */
function handleSetOptions(conn: Connection, node: MessageNode): MessageNode {
    const result = _setOptions(conn, node);
    return result;
}

/**
 *
 * @private
 * @param {ISocketRecord} connection
 * @param {MessageNode} node
 * @return {TSMessageArrayWithConnection}
 */
function _trackingMessage(
    connection: Connection,
    node: MessageNode
): MessageNode {
    const trackingMessage = node;

    trackingMessage.data = node.serialize();

    // Update the appId
    trackingMessage.appId = connection.personaId;

    // Create new response packet
    const pReply = new GenericReplyMessage();
    pReply.msgNo = 101;
    pReply.msgReply = 440;
    const rPacket = new MessageNode("sent");

    rPacket.deserialize(node.serialize());
    rPacket.updateBuffer(pReply.serialize());
    rPacket.dumpPacket();

    return rPacket;
}

/**
 *
 *
 * @param {ISocketRecord} conn
 * @param {MessageNode} node
 * @return {TSMessageArrayWithConnection}
 * @memberof MCOTServer
 */
function handleTrackingMessage(
    conn: Connection,
    node: MessageNode
): MessageNode {
    const result = _trackingMessage(conn, node);
    return result;
}

/**
 *
 * @private
 * @param {ISocketRecord} connection
 * @param {MessageNode} node
 * @return {TSMessageArrayWithConnection}
 */
function _updatePlayerPhysical(
    connection: Connection,
    node: MessageNode
): MessageNode {
    const updatePlayerPhysicalMessage = node;

    updatePlayerPhysicalMessage.data = node.serialize();

    // Update the appId
    updatePlayerPhysicalMessage.appId = connection.personaId;

    // Create new response packet
    const pReply = new GenericReplyMessage();
    pReply.msgNo = 101;
    pReply.msgReply = 266;
    const rPacket = new MessageNode("sent");

    rPacket.deserialize(node.serialize());
    rPacket.updateBuffer(pReply.serialize());
    rPacket.dumpPacket();

    return rPacket;
}

/**
 *
 *
 * @param {ISocketRecord} conn
 * @param {MessageNode} node
 * @return {TSMessageArrayWithConnection}
 * @memberof MCOTServer
 */
function handleUpdatePlayerPhysical(
    conn: Connection,
    node: MessageNode
): MessageNode {
    const result = _updatePlayerPhysical(conn, node);
    return result;
}

/**
 * @param {ISocketRecord} connection
 * @param {MessageNode} packet
 * @return {Promise<TSMessageArrayWithConnection>}
 */
async function clientConnect(
    connection: Connection,
    packet: MessageNode
): Promise<MessageNode> {
    /**
     * Let's turn it into a ClientConnectMsg
     */
    // Not currently using this - Maybe we are?
    const newMessage = new TClientConnectMessage();

    log.trace(`Raw bytes in clientConnect: ${toHex(packet.rawPacket)}`);
    newMessage.deserialize(packet.rawPacket);

    const customerId = newMessage.getValue("customerId");
    if (typeof customerId !== "number") {
        throw new TypeError(
            `customerId is wrong type. Expected 'number', got ${typeof customerId}`
        );
    }

    log.debug(`[TCPManager] Looking up the session key for ${customerId}...`);

    const sessionRecord = await prisma.session.findFirst({
        where: {
            customerId,
        },
    });

    if (sessionRecord === null) {
        throw new Error(
            `Unable to locate session record for id: ${connection.id}`
        );
    }

    log.debug("[TCPManager] Session Key located!");

    // const connectionWithKey = connection;

    // const { sessionkey } = result

    // const stringKey = Buffer.from(sessionkey, 'hex')

    // selectOrCreateEncryptors(connection, sessionRecord);

    // connectionWithKey.setEncryptionKey(Buffer.from(stringKey.slice(0, 16)))

    // Update the connection's appId
    connection.personaId = newMessage.getAppId();

    try {
        await prisma.connection.update({
            where: {
                id: connection.id,
            },
            data: {
                personaId: connection.personaId,
            },
        });
    } catch (error) {
        throw new Error("Error setting persona id on connection");
    }

    const personaId = newMessage.getValue("personaId");
    if (typeof personaId !== "number") {
        throw new TypeError(
            `personaId is wrong type. Expected 'number', got ${typeof customerId}`
        );
    }

    const personaName = newMessage.getValue("personaName");
    if (typeof personaName !== "string") {
        throw new TypeError(
            `personaName is wrong type. Expected 'string', got ${typeof customerId}`
        );
    }

    log.debug(`cust: ${customerId} ID: ${personaId} Name: ${personaName}`);

    // Create new response packet
    const genericReplyMessage = new GenericReplyMessage();
    genericReplyMessage.msgNo = 101;
    genericReplyMessage.msgReply = 438;
    const responsePacket = new MessageNode("sent");
    responsePacket.deserialize(packet.serialize());
    responsePacket.updateBuffer(genericReplyMessage.serialize());
    responsePacket.dumpPacket();

    return responsePacket;
}

/**
 *
 *
 * @param {ISocketRecord} conn
 * @param {MessageNode} node
 * @return {Promise<TSMessageArrayWithConnection>}
 * @memberof MCOTServer
 */
async function handleClientConnect(
    conn: Connection,
    node: MessageNode
): Promise<MessageNode> {
    const result = await clientConnect(conn, node);
    return result;
}

/**
 *
 * @private
 * @param {ISocketRecord} connection
 * @param {MessageNode} node
 * @return {TSMessageArrayWithConnection}>}
 */
function _login(connection: Connection, node: MessageNode): MessageNode {
    // Read the inbound packet
    const loginMessage = new TLoginMessage();
    loginMessage.deserialize(node.rawPacket);
    log.trace(`Received LoginMessage: ${JSON.stringify(loginMessage)}`);

    // Create new response packet
    const pReply = new GenericReplyMessage();
    pReply.msgNo = 213;
    pReply.msgReply = 105;
    pReply.appId = connection.personaId;
    const rPacket = new MessageNode("sent");

    rPacket.deserialize(node.serialize());
    rPacket.updateBuffer(pReply.serialize());
    rPacket.dumpPacket();

    return rPacket;
}

/**
 *
 *
 * @param {Connection} conn
 * @param {MessageNode} node
 * @return {MessageNode}
 * @memberof MCOTServer
 */
function handleLoginMessage(conn: Connection, node: MessageNode): MessageNode {
    const result = _login(conn, node);
    return result;
}

/**
 *
 * @private
 * @param {Connection} connection
 * @param {MessageNode} node
 * @return {MessageNode | void}
 */
function _logout(
    connection: Connection,
    node: MessageNode
): MessageNode | void {
    const logoutMessage = node;

    logoutMessage.data = node.serialize();

    // Update the appId
    logoutMessage.appId = connection.personaId;

    // Create new response packet
    const pReply = new GenericReplyMessage();
    pReply.msgNo = 101;
    pReply.msgReply = 106;
    const rPacket = new MessageNode("sent");

    rPacket.deserialize(node.serialize());
    rPacket.updateBuffer(pReply.serialize());
    rPacket.dumpPacket();
}

/**
 *
 *
 * @param {Connection} conn
 * @param {MessageNode} node
 * @return {MessageNode | void}
 */
function handleLogoutMessage(
    conn: Connection,
    node: MessageNode
): MessageNode | void {
    const result = _logout(conn, node);
    return result;
}

/**
 *
 * @private
 * @param {Connection} connection
 * @param {MessageNode} node
 * @return {TLobbyMessage}
 */
function _getLobbies(connection: Connection, node: MessageNode): TLobbyMessage {
    log.debug("In _getLobbies...");

    const lobbyRequest = new GenericRequestMessage();
    lobbyRequest.deserialize(node.rawPacket);
    log.trace(
        `Received GenericRequestMessage: ${JSON.stringify(lobbyRequest)}`
    );

    const lobbiesListMessage = node;

    // Update the appId
    lobbiesListMessage.appId = connection.personaId;

    // Dump the packet
    log.debug("Dumping request...");
    log.debug(JSON.stringify(lobbiesListMessage));

    // Create new response packet
    // const lobbyMsg = new LobbyMsg()

    const pReply = new GenericReplyMessage();
    pReply.msgNo = 325;
    pReply.msgReply = 324;
    const rPacket = new MessageNode("sent");
    rPacket.flags = 8;
    rPacket.setSeq(node.seq);

    const lobby = Buffer.alloc(12);
    lobby.writeInt32LE(325, 0);
    lobby.writeInt32LE(0, 4);
    lobby.writeInt32LE(0, 8);

    rPacket.updateBuffer(pReply.serialize());

    // Dump the packet
    log.debug("Dumping response...");
    log.debug(JSON.stringify(rPacket));

    const lobbyResponse = new TLobbyMessage();
    lobbyResponse.setValueNumber("dataLength", 16);
    lobbyResponse.setValueNumber("seq", node.seq);
    lobbyResponse.setValueNumber("msgNo", 325);
    lobbyResponse.setValueNumber("numberOfLobbies", 0);
    lobbyResponse.setValueNumber("moreMessages?", 0);

    return lobbyResponse;
}

/**
 *
 *
 * @param {Connection} conn
 * @param {MessageNode} node
 * @return {TLobbyMessage}
 * @memberof MCOTServer
 */
function handleGetLobbiesMessage(
    conn: Connection,
    node: MessageNode
): TLobbyMessage {
    const result = _getLobbies(conn, node);
    log.debug("Dumping Lobbies response packet...");
    log.debug(result.toString());
    return result;
}

/**
 * Handles the getStockCarInfo message
 * @param {Connection} _connection
 * @param {MessageNode} packet
 * @returns {MessageNode}
 */
function getStockCarInfo(
    _connection: Connection,
    packet: MessageNode
): MessageNode {
    const getStockCarInfoMessage = new GenericRequestMessage();
    getStockCarInfoMessage.deserialize(packet.data);
    getStockCarInfoMessage.dumpPacket();

    const stockCarInfoMessage = new StockCarInfoMessage(200, 0, 105);
    stockCarInfoMessage.starterCash = 200;
    stockCarInfoMessage.dealerId = 8;
    stockCarInfoMessage.brand = 105;

    stockCarInfoMessage.addStockCar(new StockCar(113, 20, 0)); // Bel-air
    stockCarInfoMessage.addStockCar(new StockCar(104, 15, 1)); // Fairlane - Deal of the day
    stockCarInfoMessage.addStockCar(new StockCar(402, 20, 0)); // Century

    stockCarInfoMessage.dumpPacket();

    const responsePacket = new MessageNode("sent");

    responsePacket.deserialize(packet.serialize());

    responsePacket.updateBuffer(stockCarInfoMessage.serialize());

    responsePacket.dumpPacket();

    return responsePacket;
}

/**
 *
 *
 * @param {Connection} conn
 * @param {MessageNode} node
 * @return {MessageNode}
 */
function handleShockCarInfoMessage(
    conn: Connection,
    node: MessageNode
): MessageNode {
    const result = getStockCarInfo(conn, node);
    return result;
}

/**
 * @readonly
 */
export const messageHandlers = [
    {
        name: "MC_SET_OPTIONS",
        handler: handleSetOptions,
    },
    {
        name: "MC_TRACKING_MSG",
        handler: handleTrackingMessage,
    },
    {
        name: "MC_UPDATE_PLAYER_PHYSICAL",
        handler: handleUpdatePlayerPhysical,
    },
    {
        name: "MC_CLIENT_CONNECT_MSG",
        handler: handleClientConnect,
    },
    {
        name: "MC_LOGIN",
        handler: handleLoginMessage,
    },
    {
        name: "MC_LOGOUT",
        handler: handleLogoutMessage,
    },
    {
        name: "MC_GET_LOBBIES",
        handler: handleGetLobbiesMessage,
    },
    {
        name: "MC_STOCK_CAR_INFO",
        handler: handleShockCarInfoMessage,
    },
];
