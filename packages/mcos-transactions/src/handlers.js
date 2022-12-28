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

import { DatabaseManager } from "../../mcos-database/src/index.js";
import { GenericReplyMessage } from "./GenericReplyMessage.js";
import { TClientConnectMessage } from "./TClientConnectMessage.js";
import { TLoginMessage } from "./TLoginMessage.js";
import { GenericRequestMessage } from "./GenericRequestMessage.js";
import { TLobbyMessage } from "./TLobbyMessage.js";
import { StockCarInfoMessage } from "./StockCarInfoMessage.js";
import { StockCar } from "./StockCar.js";
import createDebug from 'debug'
import { createLogger } from 'bunyan'
import { MessageNode } from "../../mcos-gateway/src/MessageNode.js";
import { toHex } from "../../mcos-gateway/src/sockets.js";
import { createEncrypters } from "../../mcos-gateway/src/encryption.js";

const appName = 'mcos'

const debug = createDebug(appName)
const log = createLogger({ name: appName })


/**
 *
 * @private
 * @param {import("../../mcos-gateway/src/connections.js").SocketWithConnectionInfo} connection
 * @param {MessageNode} node
 * @return {import("../../mcos-gateway/src/sockets.js").MessageArrayWithConnection}
 */
function _setOptions(
    connection,
    node
) {
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

    return { connection, messages: [rPacket] };
}

/**
 *
 * @param {import("../../mcos-gateway/src/connections.js").SocketWithConnectionInfo} conn
 * @param {MessageNode} node
 * @return {import("../../mcos-gateway/src/sockets.js").MessageArrayWithConnection}
 * @memberof MCOTServer
 */
function handleSetOptions(
    conn,
    node
) {
    const result = _setOptions(conn, node);
    return result;
}

/**
 *
 * @private
 * @param {import("../../mcos-gateway/src/connections.js").SocketWithConnectionInfo} connection
 * @param {MessageNode} node
 * @return {import("../../mcos-gateway/src/sockets.js").MessageArrayWithConnection}
 */
function _trackingMessage(
    connection,
    node
) {
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

    return { connection, messages: [rPacket] };
}

/**
 *
 *
 * @param {import("../../mcos-gateway/src/connections.js").SocketWithConnectionInfo} conn
 * @param {MessageNode} node
 * @return {import("../../mcos-gateway/src/sockets.js").MessageArrayWithConnection}
 * @memberof MCOTServer
 */
function handleTrackingMessage(
    conn,
    node
) {
    const result = _trackingMessage(conn, node);
    return result;
}

/**
 *
 * @private
 * @param {import("../../mcos-gateway/src/connections.js").SocketWithConnectionInfo} connection
 * @param {MessageNode} node
 * @return {import("../../mcos-gateway/src/sockets.js").MessageArrayWithConnection}
 */
function _updatePlayerPhysical(
    connection,
    node
) {
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

    return { connection, messages: [rPacket] };
}

/**
 *
 *
 * @param {import("../../mcos-gateway/src/connections.js").SocketWithConnectionInfo} conn
 * @param {MessageNode} node
 * @return {import("../../mcos-gateway/src/sockets.js").MessageArrayWithConnection}
 * @memberof MCOTServer
 */
function handleUpdatePlayerPhysical(
    conn,
    node
) {
    const result = _updatePlayerPhysical(conn, node);
    return result;
}

/**
 * @param {import("../../mcos-gateway/src/connections.js").SocketWithConnectionInfo} connection
 * @param {MessageNode} packet
 * @return {Promise<import("../../mcos-gateway/src/sockets.js").MessageArrayWithConnection>}
 */
async function clientConnect(
    connection,
    packet
) {
    /**
     * Let's turn it into a ClientConnectMsg
     */
    // Not currently using this - Maybe we are?
    const newMessage = new TClientConnectMessage();

    debug(`Raw bytes in clientConnect: ${toHex(packet.rawPacket)}`);
    newMessage.deserialize(packet.rawPacket);

    const customerId = newMessage.getValue("customerId");
    if (typeof customerId !== "number") {
        throw new TypeError(
            `customerId is wrong type. Expected 'number', got ${typeof customerId}`
        );
    }

    debug(`[TCPManager] Looking up the session key for ${customerId}...`);

    const result =
        await DatabaseManager.getInstance().fetchSessionKeyByCustomerId(
            customerId
        );
    debug("[TCPManager] Session Key located!");

    const connectionWithKey = connection;

    // const { sessionkey } = result

    // const stringKey = Buffer.from(sessionkey, 'hex')

    createEncrypters(connection, result);

    // connectionWithKey.setEncryptionKey(Buffer.from(stringKey.slice(0, 16)))

    // Update the connection's appId
    connectionWithKey.personaId = newMessage.getAppId();

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

    debug(`cust: ${customerId} ID: ${personaId} Name: ${personaName}`);

    // Create new response packet
    const genericReplyMessage = new GenericReplyMessage();
    genericReplyMessage.msgNo = 101;
    genericReplyMessage.msgReply = 438;
    const responsePacket = new MessageNode("sent");
    responsePacket.deserialize(packet.serialize());
    responsePacket.updateBuffer(genericReplyMessage.serialize());
    responsePacket.dumpPacket();

    return { connection, messages: [responsePacket] };
}

/**
 *
 *
 * @param {import("../../mcos-gateway/src/connections.js").SocketWithConnectionInfo} conn
 * @param {MessageNode} node
 * @return {Promise<import("../../mcos-gateway/src/sockets.js").MessageArrayWithConnection>}
 * @memberof MCOTServer
 */
async function handleClientConnect(
    conn,
    node
) {
    const result = await clientConnect(conn, node);
    return {
        connection: result.connection,
        messages: result.messages,
    };
}

/**
 *
 * @private
 * @param {import("../../mcos-gateway/src/connections.js").SocketWithConnectionInfo} connection
 * @param {MessageNode} node
 * @return {import("../../mcos-gateway/src/sockets.js").MessageArrayWithConnection}>}
 */
function _login(
    connection,
    node
) {
    // Read the inbound packet
    const loginMessage = new TLoginMessage();
    loginMessage.deserialize(node.rawPacket);
    debug(`Received LoginMessage: ${JSON.stringify(loginMessage)}`);

    // Create new response packet
    const pReply = new GenericReplyMessage();
    pReply.msgNo = 213;
    pReply.msgReply = 105;
    pReply.appId = connection.personaId;
    const rPacket = new MessageNode("sent");

    rPacket.deserialize(node.serialize());
    rPacket.updateBuffer(pReply.serialize());
    rPacket.dumpPacket();

    return { connection, messages: [rPacket] };
}

/**
 *
 *
 * @param {import("../../mcos-gateway/src/connections.js").SocketWithConnectionInfo} conn
 * @param {MessageNode} node
 * @return {import("../../mcos-gateway/src/sockets.js").MessageArrayWithConnection}
 * @memberof MCOTServer
 */
function handleLoginMessage(
    conn,
    node
) {
    const result = _login(conn, node);
    return {
        connection: result.connection,
        messages: result.messages,
    };
}

/**
 *
 * @private
 * @param {import("../../mcos-gateway/src/connections.js").SocketWithConnectionInfo} connection
 * @param {MessageNode} node
 * @return {import("../../mcos-gateway/src/sockets.js").MessageArrayWithConnection}
 */
function _logout(
    connection,
    node
) {
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
    const nodes = [];

    return { connection, messages: nodes };
}

/**
 *
 *
 * @param {import("../../mcos-gateway/src/connections.js").SocketWithConnectionInfo} conn
 * @param {MessageNode} node
 * @return {import("../../mcos-gateway/src/sockets.js").MessageArrayWithConnection}
 */
function handleLogoutMessage(
    conn,
    node
) {
    const result = _logout(conn, node);
    return {
        connection: result.connection,
        messages: result.messages,
    };
}

/**
 *
 * @private
 * @param {import("../../mcos-gateway/src/connections.js").SocketWithConnectionInfo} connection
 * @param {MessageNode} node
 * @return {import("../../mcos-gateway/src/sockets.js").MessageArrayWithConnection}
 */
function _getLobbies(
    connection,
    node
) {
    debug("In _getLobbies...");

    const lobbyRequest = new GenericRequestMessage();
    lobbyRequest.deserialize(node.rawPacket);
    debug(
        `Received GenericRequestMessage: ${JSON.stringify(lobbyRequest)}`
    );

    const lobbiesListMessage = node;

    // Update the appId
    lobbiesListMessage.appId = connection.personaId;

    // Dump the packet
    debug("Dumping request...");
    debug(JSON.stringify(lobbiesListMessage));

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
    debug("Dumping response...");
    debug(JSON.stringify(rPacket));

    const lobbyResponse = new TLobbyMessage();
    lobbyResponse.setValueNumber("dataLength", 16);
    lobbyResponse.setValueNumber("seq", node.seq);
    lobbyResponse.setValueNumber("msgNo", 325);
    lobbyResponse.setValueNumber("numberOfLobbies", 0);
    lobbyResponse.setValueNumber("moreMessages?", 0);

    return { connection, messages: [lobbyResponse] };
}

/**
 *
 *
 * @param {import("../../mcos-gateway/src/connections.js").SocketWithConnectionInfo} conn
 * @param {MessageNode} node
 * @return {import("../../mcos-gateway/src/sockets.js").MessageArrayWithConnection}
 * @memberof MCOTServer
 */
function handleGetLobbiesMessage(
    conn,
    node
) {
    const result = _getLobbies(conn, node);
    debug("Dumping Lobbies response packet...");
    result.messages.forEach(msg => {
        debug(msg.toString())
    })
    debug(result.messages.join().toString());
    return {
        connection: result.connection,
        messages: result.messages,
    };
}

/**
 * Handles the getStockCarInfo message
 * @param {import("../../mcos-gateway/src/connections.js").SocketWithConnectionInfo} connection
 * @param {MessageNode} packet
 * @returns {import("../../mcos-gateway/src/sockets.js").MessageArrayWithConnection}
 */
function getStockCarInfo(
    connection,
    packet
) {
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

    return { connection, messages: [responsePacket] };
}

/**
 *
 *
 * @param {import("../../mcos-gateway/src/connections.js").SocketWithConnectionInfo} conn
 * @param {MessageNode} node
 * @return {import("../../mcos-gateway/src/sockets.js").MessageArrayWithConnection}
 */
function handleShockCarInfoMessage(
    conn,
    node
) {
    const result = getStockCarInfo(conn, node);
    return {
        connection: result.connection,
        messages: result.messages,
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
