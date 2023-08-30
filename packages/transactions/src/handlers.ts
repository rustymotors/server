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

import { DatabaseManager } from "../../database/index.js";
import { createEncrypters } from "../../gateway/index.js";
import { SocketWithConnectionInfo, Logger, MessageArrayWithConnectionInfo } from "../../interfaces/index.js";
import { MessageNode } from "../../shared/MessageNode.js";
import { Sentry } from "../../shared/sentry.js";
import { toHex } from "../../shared/utils.js";
import { GenericReplyMessage } from "./GenericReplyMessage.js";
import { GenericRequestMessage } from "./GenericRequestMessage.js";
import { StockCar } from "./StockCar.js";
import { StockCarInfoMessage } from "./StockCarInfoMessage.js";
import { TClientConnectMessage } from "./TClientConnectMessage.js";
import { TLobbyMessage } from "./TLobbyMessage.js";
import { TLoginMessage } from "./TLoginMessage.js";

/**
 *
 * @private
 * @param {SocketWithConnectionInfo} connection
 * @param {MessageNode} node
 * @param {Logger} log
 * @return {MessageArrayWithConnectionInfo}
 */
function _setOptions(
    connection: SocketWithConnectionInfo,
    node: MessageNode,
    log: Logger,
): MessageArrayWithConnectionInfo {
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

    return { connection, messages: [rPacket], log };
}

function handleSetOptions(
    conn: SocketWithConnectionInfo,
    node: MessageNode,
    log: Logger,
): MessageArrayWithConnectionInfo {
    const result = _setOptions(conn, node, log);
    return result;
}

/**
 *
 * @private
 */
function trackingMessage(
    connection: SocketWithConnectionInfo,
    node: MessageNode,
    log: Logger,
): MessageArrayWithConnectionInfo {
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

    return { connection, messages: [rPacket], log };
}

function handleTrackingMessage(
    conn: SocketWithConnectionInfo,
    node: MessageNode,
    log: Logger,
): MessageArrayWithConnectionInfo {
    const result = trackingMessage(conn, node, log);
    return result;
}

/**
 *
 * @private
 * @param {SocketWithConnectionInfo} connection
 * @param {MessageNode} node
 * @param {Logger} log
 * @return {MessageArrayWithConnectionInfo}
 */
function _updatePlayerPhysical(
    connection: SocketWithConnectionInfo,
    node: MessageNode,
    log: Logger,
): MessageArrayWithConnectionInfo {
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

    return { connection, messages: [rPacket], log };
}

/**
 *
 *
 * @param {SocketWithConnectionInfo} conn
 * @param {MessageNode} node
 * @param {Logger} log
 * @return {MessageArrayWithConnectionInfo}
 * @memberof MCOTServer
 */
function handleUpdatePlayerPhysical(
    conn: SocketWithConnectionInfo,
    node: MessageNode,
    log: Logger,
): MessageArrayWithConnectionInfo {
    const result = _updatePlayerPhysical(conn, node, log);
    return result;
}

/**
 * @param {SocketWithConnectionInfo} connection
 * @param {MessageNode} packet
 * @param {Logger} log
 * @return {Promise<MessageArrayWithConnectionInfo>}
 */
async function clientConnect(
    connection: SocketWithConnectionInfo,
    packet: MessageNode,
    log: Logger,
): Promise<MessageArrayWithConnectionInfo> {
    /**
     * Let's turn it into a ClientConnectMsg
     */
    // Not currently using this - Maybe we are?
    const newMessage = new TClientConnectMessage(log);

    log("debug", `Raw bytes in clientConnect: ${toHex(packet.rawPacket)}`);
    newMessage.deserialize(packet.rawPacket);

    const customerId = newMessage.getValue("customerId");
    if (typeof customerId !== "number") {
        const err = new TypeError(
            `customerId is wrong type. Expected 'number', got ${typeof customerId}`,
        );
        Sentry.addBreadcrumb({ level: "error", message: err.message });
        throw err;
    }

    log(
        "debug",
        `[TCPManager] Looking up the session key for ${customerId}...`,
    );

    const result = await DatabaseManager.getInstance(
        log,
    ).fetchSessionKeyByCustomerId(customerId);
    log("debug", "[TCPManager] Session Key located!");

    const connectionWithKey = connection;

    const newEncrypters = createEncrypters(connection, result, log);

    connectionWithKey.encryptionSession = newEncrypters;

    // Update the connection's appId
    connectionWithKey.personaId = newMessage.getAppId();

    const personaId = newMessage.getValue("personaId");
    if (typeof personaId !== "number") {
        const err = new TypeError(
            `personaId is wrong type. Expected 'number', got ${typeof customerId}`,
        );
        Sentry.addBreadcrumb({ level: "error", message: err.message });
        throw err;
    }

    const personaName = newMessage.getValue("personaName");
    if (typeof personaName !== "string") {
        const err = new TypeError(
            `personaName is wrong type. Expected 'string', got ${typeof customerId}`,
        );
        Sentry.addBreadcrumb({ level: "error", message: err.message });
        throw err;
    }

    log("debug", `cust: ${customerId} ID: ${personaId} Name: ${personaName}`);

    // Create new response packet
    const genericReplyMessage = new GenericReplyMessage();
    genericReplyMessage.msgNo = 101;
    genericReplyMessage.msgReply = 438;
    const responsePacket = new MessageNode("sent");
    responsePacket.deserialize(packet.serialize());
    responsePacket.updateBuffer(genericReplyMessage.serialize());
    responsePacket.dumpPacket();

    connection.useEncryption = true;

    return { connection, messages: [responsePacket], log };
}

/**
 *
 *
 * @param {SocketWithConnectionInfo} conn
 * @param {MessageNode} node
 * @param {Logger} log
 * @return {Promise<MessageArrayWithConnectionInfo>}
 * @memberof MCOTServer
 */
async function handleClientConnect(
    conn: SocketWithConnectionInfo,
    node: MessageNode,
    log: Logger,
): Promise<MessageArrayWithConnectionInfo> {
    const result = await clientConnect(conn, node, log);
    return {
        connection: result.connection,
        messages: result.messages,
        log,
    };
}

/**
 *
 * @private
 * @param {SocketWithConnectionInfo} connection
 * @param {MessageNode} node
 * @param {Logger} log
 * @return {MessageArrayWithConnectionInfo}>}
 */
function _login(
    connection: SocketWithConnectionInfo,
    node: MessageNode,
    log: Logger,
): MessageArrayWithConnectionInfo {
    // Read the inbound packet
    const loginMessage = new TLoginMessage(log);
    loginMessage.deserialize(node.rawPacket);
    log("debug", `Received LoginMessage: ${JSON.stringify(loginMessage)}`);

    // Create new response packet
    const pReply = new GenericReplyMessage();
    pReply.msgNo = 213;
    pReply.msgReply = 105;
    pReply.appId = connection.personaId;
    const rPacket = new MessageNode("sent");

    rPacket.deserialize(node.serialize());
    rPacket.updateBuffer(pReply.serialize());
    rPacket.dumpPacket();

    return { connection, messages: [rPacket], log };
}

/**
 *
 *
 * @param {SocketWithConnectionInfo} conn
 * @param {MessageNode} node
 * @param {Logger} log
 * @return {MessageArrayWithConnectionInfo}
 * @memberof MCOTServer
 */
function handleLoginMessage(
    conn: SocketWithConnectionInfo,
    node: MessageNode,
    log: Logger,
): MessageArrayWithConnectionInfo {
    const result = _login(conn, node, log);
    return {
        connection: result.connection,
        messages: result.messages,
        log,
    };
}

/**
 *
 * @private
 * @param {SocketWithConnectionInfo} connection
 * @param {MessageNode} node
 * @param {Logger} log
 * @return {MessageArrayWithConnectionInfo}
 */
function _logout(
    connection: SocketWithConnectionInfo,
    node: MessageNode,
    log: Logger,
): MessageArrayWithConnectionInfo {
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

    /** @type {MessageNode[]} */
    const nodes: MessageNode[] = [];

    return { connection, messages: nodes, log };
}

/**
 *
 *
 * @param {SocketWithConnectionInfo} conn
 * @param {MessageNode} node
 * @param {Logger} log
 * @return {MessageArrayWithConnectionInfo}
 */
function handleLogoutMessage(
    conn: SocketWithConnectionInfo,
    node: MessageNode,
    log: Logger,
): MessageArrayWithConnectionInfo {
    const result = _logout(conn, node, log);
    return {
        connection: result.connection,
        messages: result.messages,
        log,
    };
}

/**
 *
 * @private
 * @param {SocketWithConnectionInfo} connection
 * @param {MessageNode} node
 * @param {Logger} log
 * @return {MessageArrayWithConnectionInfo}
 */
function _getLobbies(
    connection: SocketWithConnectionInfo,
    node: MessageNode,
    log: Logger,
): MessageArrayWithConnectionInfo {
    log("debug", "In _getLobbies...");

    const lobbyRequest = new GenericRequestMessage();
    lobbyRequest.deserialize(node.rawPacket);
    log(
        "debug",
        `Received GenericRequestMessage: ${JSON.stringify(lobbyRequest)}`,
    );

    const lobbiesListMessage = node;

    // Update the appId
    lobbiesListMessage.appId = connection.personaId;

    // Dump the packet
    log("debug", "Dumping request...");
    log("debug", JSON.stringify(lobbiesListMessage));

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
    log("debug", "Dumping response...");
    log("debug", JSON.stringify(rPacket));

    const lobbyResponse = new TLobbyMessage(log);
    lobbyResponse.setValueNumber("dataLength", 16);
    lobbyResponse.setValueNumber("seq", node.seq);
    lobbyResponse.setValueNumber("msgNo", 325);
    lobbyResponse.setValueNumber("numberOfLobbies", 0);
    lobbyResponse.setValueNumber("moreMessages?", 0);

    return { connection, messages: [lobbyResponse], log };
}

/**
 *
 *
 * @param {SocketWithConnectionInfo} conn
 * @param {MessageNode} node
 * @param {Logger} log
 * @return {MessageArrayWithConnectionInfo}
 * @memberof MCOTServer
 */
function handleGetLobbiesMessage(
    conn: SocketWithConnectionInfo,
    node: MessageNode,
    log: Logger,
): MessageArrayWithConnectionInfo {
    const result = _getLobbies(conn, node, log);
    log("debug", "Dumping Lobbies response packet...");
    result.messages.forEach((msg) => {
        log("debug", msg.toString());
    });
    log("debug", result.messages.join().toString());
    return {
        connection: result.connection,
        messages: result.messages,
        log,
    };
}

/**
 * Handles the getStockCarInfo message
 * @param {SocketWithConnectionInfo} connection
 * @param {MessageNode} packet
 * @param {Logger} log
 * @returns {MessageArrayWithConnectionInfo}
 */
function getStockCarInfo(
    connection: SocketWithConnectionInfo,
    packet: MessageNode,
    log: Logger,
): MessageArrayWithConnectionInfo {
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

    return { connection, messages: [responsePacket], log };
}

/**
 *
 *
 * @param {SocketWithConnectionInfo} conn
 * @param {MessageNode} node
 * @param {Logger} log
 * @return {MessageArrayWithConnectionInfo}
 */
function handleShockCarInfoMessage(
    conn: SocketWithConnectionInfo,
    node: MessageNode,
    log: Logger,
): MessageArrayWithConnectionInfo {
    const result = getStockCarInfo(conn, node, log);
    return {
        connection: result.connection,
        messages: result.messages,
        log,
    };
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
