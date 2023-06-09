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
import { TClientConnectMessage } from "./TClientConnectMessage.js";
import { TLoginMessage } from "./TLoginMessage.js";
import { GenericRequestMessage } from "./GenericRequestMessage.js";
import { TLobbyMessage } from "./TLobbyMessage.js";
import { StockCarInfoMessage } from "./StockCarInfoMessage.js";
import { StockCar } from "./StockCar.js";
import {
    Sentry,
    TMessageArrayWithConnection,
    TServerLogger,
    TSocketWithConnectionInfo,
} from "mcos/shared";
import { toHex } from "mcos/shared";
import { MessageNode, createEncrypters } from "mcos/gateway";
import { DatabaseManager } from "mcos/database";

/**
 *
 * @private
 * @param {TSocketWithConnectionInfo} connection
 * @param {MessageNode} node
 * @param {TServerLogger} log
 * @return {TMessageArrayWithConnection}
 */
function _setOptions(
    connection: TSocketWithConnectionInfo,
    node: MessageNode,
    log: TServerLogger
): TMessageArrayWithConnection {
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

/**
 *
 * @param {TSocketWithConnectionInfo} conn
 * @param {MessageNode} node
 * @param {TServerLogger} log
 * @return {TMessageArrayWithConnection}
 * @memberof MCOTServer
 */
function handleSetOptions(
    conn: TSocketWithConnectionInfo,
    node: MessageNode,
    log: TServerLogger
): TMessageArrayWithConnection {
    const result = _setOptions(conn, node, log);
    return result;
}

/**
 *
 * @private
 * @param {TSocketWithConnectionInfo} connection
 * @param {MessageNode} node
 * @param {TServerLogger} log
 * @return {TMessageArrayWithConnection}
 */
function _trackingMessage(
    connection: TSocketWithConnectionInfo,
    node: MessageNode,
    log: TServerLogger
): TMessageArrayWithConnection {
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

/**
 *
 *
 * @param {TSocketWithConnectionInfo} conn
 * @param {MessageNode} node
 * @param {TServerLogger} log
 * @return {TMessageArrayWithConnection}
 * @memberof MCOTServer
 */
function handleTrackingMessage(
    conn: TSocketWithConnectionInfo,
    node: MessageNode,
    log: TServerLogger
): TMessageArrayWithConnection {
    const result = _trackingMessage(conn, node, log);
    return result;
}

/**
 *
 * @private
 * @param {TSocketWithConnectionInfo} connection
 * @param {MessageNode} node
 * @param {TServerLogger} log
 * @return {TMessageArrayWithConnection}
 */
function _updatePlayerPhysical(
    connection: TSocketWithConnectionInfo,
    node: MessageNode,
    log: TServerLogger
): TMessageArrayWithConnection {
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
 * @param {TSocketWithConnectionInfo} conn
 * @param {MessageNode} node
 * @param {TServerLogger} log
 * @return {TMessageArrayWithConnection}
 * @memberof MCOTServer
 */
function handleUpdatePlayerPhysical(
    conn: TSocketWithConnectionInfo,
    node: MessageNode,
    log: TServerLogger
): TMessageArrayWithConnection {
    const result = _updatePlayerPhysical(conn, node, log);
    return result;
}

/**
 * @param {TSocketWithConnectionInfo} connection
 * @param {MessageNode} packet
 * @param {TServerLogger} log
 * @return {Promise<TMessageArrayWithConnection>}
 */
async function clientConnect(
    connection: TSocketWithConnectionInfo,
    packet: MessageNode,
    log: TServerLogger
): Promise<TMessageArrayWithConnection> {
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
            `customerId is wrong type. Expected 'number', got ${typeof customerId}`
        );
        Sentry.addBreadcrumb({ level: "error", message: err.message });
        throw err;
    }

    log(
        "debug",
        `[TCPManager] Looking up the session key for ${customerId}...`
    );

    const result = await DatabaseManager.getInstance(
        log
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
            `personaId is wrong type. Expected 'number', got ${typeof customerId}`
        );
        Sentry.addBreadcrumb({ level: "error", message: err.message });
        throw err;
    }

    const personaName = newMessage.getValue("personaName");
    if (typeof personaName !== "string") {
        const err = new TypeError(
            `personaName is wrong type. Expected 'string', got ${typeof customerId}`
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
 * @param {TSocketWithConnectionInfo} conn
 * @param {MessageNode} node
 * @param {TServerLogger} log
 * @return {Promise<TMessageArrayWithConnection>}
 * @memberof MCOTServer
 */
async function handleClientConnect(
    conn: TSocketWithConnectionInfo,
    node: MessageNode,
    log: TServerLogger
): Promise<TMessageArrayWithConnection> {
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
 * @param {TSocketWithConnectionInfo} connection
 * @param {MessageNode} node
 * @param {TServerLogger} log
 * @return {TMessageArrayWithConnection}>}
 */
function _login(
    connection: TSocketWithConnectionInfo,
    node: MessageNode,
    log: TServerLogger
): TMessageArrayWithConnection {
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
 * @param {TSocketWithConnectionInfo} conn
 * @param {MessageNode} node
 * @param {TServerLogger} log
 * @return {TMessageArrayWithConnection}
 * @memberof MCOTServer
 */
function handleLoginMessage(
    conn: TSocketWithConnectionInfo,
    node: MessageNode,
    log: TServerLogger
): TMessageArrayWithConnection {
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
 * @param {TSocketWithConnectionInfo} connection
 * @param {MessageNode} node
 * @param {TServerLogger} log
 * @return {TMessageArrayWithConnection}
 */
function _logout(
    connection: TSocketWithConnectionInfo,
    node: MessageNode,
    log: TServerLogger
): TMessageArrayWithConnection {
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
 * @param {TSocketWithConnectionInfo} conn
 * @param {MessageNode} node
 * @param {TServerLogger} log
 * @return {TMessageArrayWithConnection}
 */
function handleLogoutMessage(
    conn: TSocketWithConnectionInfo,
    node: MessageNode,
    log: TServerLogger
): TMessageArrayWithConnection {
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
 * @param {TSocketWithConnectionInfo} connection
 * @param {MessageNode} node
 * @param {TServerLogger} log
 * @return {TMessageArrayWithConnection}
 */
function _getLobbies(
    connection: TSocketWithConnectionInfo,
    node: MessageNode,
    log: TServerLogger
): TMessageArrayWithConnection {
    log("debug", "In _getLobbies...");

    const lobbyRequest = new GenericRequestMessage();
    lobbyRequest.deserialize(node.rawPacket);
    log(
        "debug",
        `Received GenericRequestMessage: ${JSON.stringify(lobbyRequest)}`
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
 * @param {TSocketWithConnectionInfo} conn
 * @param {MessageNode} node
 * @param {TServerLogger} log
 * @return {TMessageArrayWithConnection}
 * @memberof MCOTServer
 */
function handleGetLobbiesMessage(
    conn: TSocketWithConnectionInfo,
    node: MessageNode,
    log: TServerLogger
): TMessageArrayWithConnection {
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
 * @param {TSocketWithConnectionInfo} connection
 * @param {MessageNode} packet
 * @param {TServerLogger} log
 * @returns {TMessageArrayWithConnection}
 */
function getStockCarInfo(
    connection: TSocketWithConnectionInfo,
    packet: MessageNode,
    log: TServerLogger
): TMessageArrayWithConnection {
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
 * @param {TSocketWithConnectionInfo} conn
 * @param {MessageNode} node
 * @param {TServerLogger} log
 * @return {TMessageArrayWithConnection}
 */
function handleShockCarInfoMessage(
    conn: TSocketWithConnectionInfo,
    node: MessageNode,
    log: TServerLogger
): TMessageArrayWithConnection {
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
