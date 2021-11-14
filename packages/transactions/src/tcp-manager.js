// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { pino: P } = require("pino");
const { ClientConnectMessage } = require("../../message-types/src/index.js");
const { MessageNode } = require("../../message-types/src/messageNode.js");
const {
  GenericReplyMessage,
} = require("../../message-types/src/genericReplyMessage.js");
const {
  GenericRequestMessage,
} = require("../../message-types/src/genericRequestMessage.js");
const { StockCar } = require("../../message-types/src/stockCar.js");
const {
  StockCarInfoMessage,
} = require("../../message-types/src/stockCarInfoMessage.js");
const process = require("process");
const { Buffer } = require("buffer");
const { EMessageDirection } = require("./types.js");

const log = P().child({ service: "mcos:MCOTSServer" });
log.level = process.env["LOG_LEVEL"] || "info";

/**
 * Manages TCP connection packet processing
 */

/**
 *
 * @param {import("../../core/src/tcpConnection").TCPConnection} connection
 * @param {MessageNode} packet
 * @returns {Promise<import("./types").ConnectionWithPacket>}
 */
async function compressIfNeeded(connection, packet) {
  // Check if compression is needed
  if (packet.getLength() < 80) {
    log.debug("Too small, should not compress");
    return { connection, packet, lastError: "Too small, should not compress" };
  } else {
    log.debug("This packet should be compressed");
    /* TODO: Write compression.
     *
     * At this time we will still send the packet, to not hang connection
     * Client will crash though, due to memory access errors
     */
  }

  return { connection, packet };
}

/**
 *
 * @param {import("../../core/src/tcpConnection").TCPConnection} connection
 * @param {MessageNode} packet
 * @returns {Promise<import("./types").ConnectionWithPacket>}
 */
async function encryptIfNeeded(connection, packet) {
  // Check if encryption is needed
  if (packet.flags - 8 >= 0) {
    log.debug("encryption flag is set");

    packet.updateBuffer(connection.encryptBuffer(packet.data));

    log.debug(`encrypted packet: ${packet.serialize().toString("hex")}`);
  }

  return { connection, packet };
}

/**
 *
 * @param {import("../../core/src/tcpConnection").TCPConnection} connection
 * @param {MessageNode[]} packetList
 * @returns {Promise<import("../../core/src/tcpConnection").TCPConnection>}
 */
async function socketWriteIfOpen(connection, packetList) {
  /** @type {import("./types").ConnectionWithPackets} */
  const updatedConnection = {
    connection: connection,
    packetList: packetList,
  };
  // For each node in nodes
  for (const packet of updatedConnection.packetList) {
    // Does the packet need to be compressed?
    const compressedPacket = (await compressIfNeeded(connection, packet))
      .packet;
    // Does the packet need to be encrypted?
    const encryptedPacket = (
      await encryptIfNeeded(connection, compressedPacket)
    ).packet;
    // Log that we are trying to write
    log.debug(
      ` Atempting to write seq: ${encryptedPacket.seq} to conn: ${updatedConnection.connection.id}`
    );

    // Log the buffer we are writing
    log.debug(
      `Writting buffer: ${encryptedPacket.serialize().toString("hex")}`
    );
    if (connection.sock.writable) {
      // Write the packet to socket
      connection.sock.write(encryptedPacket.serialize());
    } else {
      const port = connection.sock.localPort?.toString() || "";
      throw new Error(
        `Error writing ${encryptedPacket.serialize()} to ${
          connection.sock.remoteAddress
        } , ${port}`
      );
    }
  }

  return updatedConnection.connection;
}

class TCPManager {
  /** @type {TCPManager} */
  static _instance;



  /**
   *
   * @returns {Promise<TCPManager>}
   */
  static async getInstance() {
    if (!TCPManager._instance) {
      TCPManager._instance = new TCPManager();
    }
    return TCPManager._instance;
  }

  /** @private */
  constructor() {
  }

  /**
   *
   * @param {import("../../core/src/tcpConnection").TCPConnection} connection
   * @param {MessageNode} packet
   * @returns {Promise<import("./types").ConnectionWithPackets>}
   */
  async getStockCarInfo(connection, packet) {
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

    const responsePacket = new MessageNode(EMessageDirection.SENT);

    responsePacket.deserialize(packet.serialize());

    responsePacket.updateBuffer(stockCarInfoMessage.serialize());

    responsePacket.dumpPacket();

    return { connection, packetList: [responsePacket] };
  }

  /**
   *
   * @param {import("../../core/src/tcpConnection").TCPConnection} connection
   * @param {MessageNode} packet
   * @param {import("../../database/src/index").DatabaseManager} databaseManager
   * @returns {Promise<import("./types").ConnectionWithPackets>}
   */
  async clientConnect(connection, packet, databaseManager) {
    /**
     * Let's turn it into a ClientConnectMsg
     */
    // Not currently using this
    const newMessage = new ClientConnectMessage(packet.data);

    log.debug(
      `[TCPManager] Looking up the session key for ${newMessage.customerId}...`
    );
    const result = await databaseManager.fetchSessionKeyByCustomerId(
      newMessage.customerId
    );
    log.debug("[TCPManager] Session Key located!");

    const connectionWithKey = connection;

    const { customerId, personaId, personaName } = newMessage;
    const { sessionkey } = result;

    const stringKey = Buffer.from(sessionkey, "hex");
    connectionWithKey.setEncryptionKey(Buffer.from(stringKey.slice(0, 16)));

    // Update the connection's appId
    connectionWithKey.appId = newMessage.getAppId();

    log.debug(`cust: ${customerId} ID: ${personaId} Name: ${personaName}`);

    // Create new response packet
    const genericReplyMessage = new GenericReplyMessage();
    genericReplyMessage.msgNo = 101;
    genericReplyMessage.msgReply = 438;
    const responsePacket = new MessageNode(EMessageDirection.SENT);
    responsePacket.deserialize(packet.serialize());
    responsePacket.updateBuffer(genericReplyMessage.serialize());
    responsePacket.dumpPacket();

    return { connection, packetList: [responsePacket] };
  }

  /**
   * Route or process MCOTS commands
   * @param {MessageNode} node
   * @param {import("../../core/src/tcpConnection").TCPConnection} conn
   * @param {import("../../transactions/src/index").MCOTServer} mcotServer
   * @param {import("../../database/src/index").DatabaseManager} databaseManager
   * @return {Promise<import("../../core/src/tcpConnection").TCPConnection>}
   */
  async processInput(node, conn, mcotServer, databaseManager) {
    const currentMessageNo = node.msgNo;
    const currentMessageString = mcotServer._MSG_STRING(currentMessageNo);

    switch (currentMessageString) {
      case "MC_SET_OPTIONS":
        try {
          const result = await mcotServer._setOptions(conn, node);
          const responsePackets = result.packetList;
          return await socketWriteIfOpen(result.connection, responsePackets);
        } catch (error) {
          if (error instanceof Error) {
            throw new TypeError(`Error in MC_SET_OPTIONS: ${error}`);
          }

          throw new Error("Error in MC_SET_OPTIONS, error unknown");
        }

      case "MC_TRACKING_MSG":
        try {
          const result = await mcotServer._trackingMessage(conn, node);
          const responsePackets = result.packetList;
          return socketWriteIfOpen(result.connection, responsePackets);
        } catch (error) {
          if (error instanceof Error) {
            throw new TypeError(`Error in MC_TRACKING_MSG: ${error.message}`);
          }

          throw new Error("Error in MC_TRACKING_MSG, error unknown");
        }

      case "MC_UPDATE_PLAYER_PHYSICAL":
        try {
          const result = await mcotServer._updatePlayerPhysical(
            conn,
            node
          );
          const responsePackets = result.packetList;
          return socketWriteIfOpen(result.connection, responsePackets);
        } catch (error) {
          if (error instanceof Error) {
            throw new TypeError(
              `Error in MC_UPDATE_PLAYER_PHYSICAL: ${error.message}`
            );
          }

          throw new Error("Error in MC_UPDATE_PLAYER_PHYSICAL, error unknown");
        }

      case "MC_CLIENT_CONNECT_MSG": {
        try {
          const result = await this.clientConnect(conn, node, databaseManager );
          const responsePackets = result.packetList;
          // Write the socket
          return await socketWriteIfOpen(result.connection, responsePackets);
        } catch (error) {
          if (error instanceof Error) {
            throw new TypeError(
              `[TCPManager] Error writing to socket: ${error.message}`
            );
          }

          throw new Error(
            "[TCPManager] Error writing to socket, error unknown"
          );
        }
      }

      case "MC_LOGIN": {
        try {
          const result = await mcotServer._login(conn, node);
          const responsePackets = result.packetList;
          // Write the socket
          return socketWriteIfOpen(result.connection, responsePackets);
        } catch (error) {
          if (error instanceof Error) {
            throw new TypeError(
              `[TCPManager] Error writing to socket: ${error}`
            );
          }

          throw new Error(
            "[TCPManager] Error writing to socket, error unknown"
          );
        }
      }

      case "MC_LOGOUT": {
        try {
          const result = await mcotServer._logout(conn, node);
          const responsePackets = result.packetList;
          // Write the socket
          return await socketWriteIfOpen(result.connection, responsePackets);
        } catch (error) {
          if (error instanceof Error) {
            throw new TypeError(
              `[TCPManager] Error writing to socket: ${error.message}`
            );
          }

          throw new Error(
            "[TCPManager] Error writing to socket, error unknown"
          );
        }
      }

      case "MC_GET_LOBBIES": {
        const result = await mcotServer._getLobbies(conn, node);
        log.debug("Dumping Lobbies response packet...");
        log.debug(result.packetList.join());
        const responsePackets = result.packetList;
        try {
          // Write the socket
          return await socketWriteIfOpen(result.connection, responsePackets);
        } catch (error) {
          if (error instanceof Error) {
            throw new TypeError(
              `[TCPManager] Error writing to socket: ${error}`
            );
          }

          throw new Error(
            "[TCPManager] Error writing to socket, error unknown"
          );
        }
      }

      case "MC_STOCK_CAR_INFO": {
        try {
          const result = await this.getStockCarInfo(conn, node);
          const responsePackets = result.packetList;
          // Write the socket
          return socketWriteIfOpen(result.connection, responsePackets);
        } catch (error) {
          if (error instanceof Error) {
            throw new TypeError(
              `[TCPManager] Error writing to socket: ${error.message}`
            );
          }

          throw new Error(
            "[TCPManager] Error writing to socket, error unknown"
          );
        }
      }

      default: {
        node.setAppId(conn.appId);
        throw new Error(
          `Message Number Not Handled: ${currentMessageNo} (${currentMessageString})
      conID: ${node.toFrom}  PersonaID: ${node.appId}`
        );
      }
    }
  }

  /**
   * @param {MessageNode} message
   * @param {import("../../core/src/tcpConnection").TCPConnection} con
   * @param {import("../../transactions/src/index").MCOTServer} mcotServer
   * @param {import("../../database/src/index").DatabaseManager} databaseManager
   * @return {Promise<import("../../core/src/tcpConnection").TCPConnection>}
   */
  async messageReceived(message, con, mcotServer, databaseManager) {
    const newConnection = con;
    if (!newConnection.useEncryption && message.flags && 0x08) {
      log.debug("Turning on encryption");
      newConnection.useEncryption = true;
    }

    // If not a Heartbeat
    if (message.flags !== 80 && newConnection.useEncryption) {
      if (!newConnection.isSetupComplete) {
        throw new Error(
          `Decrypt() not yet setup! Disconnecting...conId: ${con.id}`
        );
      }

      if (message.flags - 8 >= 0) {
        try {
          /**
           * Attempt to decrypt message
           */
          const encryptedBuffer = Buffer.from(message.data);
          log.debug(
            `Full packet before decrypting: ${encryptedBuffer.toString("hex")}`
          );

          log.debug(
            `Message buffer before decrypting: ${encryptedBuffer.toString(
              "hex"
            )}`
          );

          log.debug(`Using encryption id: ${newConnection.getEncryptionId()}`);
          const deciphered = newConnection.decryptBuffer(encryptedBuffer);
          log.debug(
            `Message buffer after decrypting: ${deciphered.toString("hex")}`
          );

          if (deciphered.readUInt16LE(0) <= 0) {
            throw new Error("Failure deciphering message, exiting.");
          }

          // Update the MessageNode with the deciphered buffer
          message.updateBuffer(deciphered);
        } catch (error) {
          if (error instanceof Error) {
            throw new TypeError(
              `Decrypt() exception thrown! Disconnecting...conId:${newConnection.id}: ${error.message}`
            );
          }

          throw new Error(
            `Decrypt() exception thrown! Disconnecting...conId:${newConnection.id}, error unknown`
          );
        }
      }
    }

    // Should be good to process now
    return this.processInput(message, newConnection, mcotServer, databaseManager);
  }

  /**
   *
   * @param {import("./types").UnprocessedPacket} rawPacket
   * @param {import("../../transactions/src/index").MCOTServer} mcotServer
   * @param {import("../../database/src/index").DatabaseManager} databaseManager
   * @returns {Promise<import("../../core/src/tcpConnection").TCPConnection>}
   */
  async defaultHandler(rawPacket, mcotServer, databaseManager) {
    const { connection, remoteAddress, localPort, data } = rawPacket;
    const messageNode = new MessageNode(EMessageDirection.RECEIVED);
    messageNode.deserialize(data);

    log.debug(
      `Received TCP packet',
    ${JSON.stringify({
      localPort,
      remoteAddress,
      direction: messageNode.direction,
      data: rawPacket.data.toString("hex"),
    })}`
    );
    messageNode.dumpPacket();

    return this.messageReceived(messageNode, connection, mcotServer, databaseManager);
  }
}
module.exports = {
  compressIfNeeded,
  encryptIfNeeded,
  TCPManager,
};
