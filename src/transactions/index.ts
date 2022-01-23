// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { logger } from "../logger/index";
import {
  ConnectionWithPacket,
  ConnectionWithPackets,
  EMessageDirection,
  UnprocessedPacket,
} from "../types/index";
import {
  ClientConnectMessage,
  GenericReplyMessage,
  GenericRequestMessage,
  MessageNode,
  StockCar,
  StockCarInfoMessage,
} from "../message-types/index";
import { TCPConnection } from "../core/tcpConnection";
import { DatabaseManager } from "../database";

const log = logger.child({ service: "mcoserver:MCOTSServer" });

/**
 * Manages the game database server
 */
export class MCOTServer {
  private static _instance: MCOTServer;
  private databaseManager: DatabaseManager;

  static getInstance(): MCOTServer {
    if (!MCOTServer._instance) {
      MCOTServer._instance = new MCOTServer();
    }
    return MCOTServer._instance;
  }

  private constructor() {
    this.databaseManager = DatabaseManager.getInstance();
  }

  /**
   * Return the string representation of the numeric opcode
   *
   * @param {number} msgID
   * @return {string}
   */
  _MSG_STRING(messageID: number): string {
    switch (messageID) {
      case 105:
        return "MC_LOGIN";
      case 106:
        return "MC_LOGOUT";
      case 109:
        return "MC_SET_OPTIONS";
      case 141:
        return "MC_STOCK_CAR_INFO";
      case 213:
        return "MC_LOGIN_COMPLETE";
      case 266:
        return "MC_UPDATE_PLAYER_PHYSICAL";
      case 324:
        return "MC_GET_LOBBIES";
      case 325:
        return "MC_LOBBIES";
      case 438:
        return "MC_CLIENT_CONNECT_MSG";
      case 440:
        return "MC_TRACKING_MSG";

      default:
        return "Unknown";
    }
  }

  /**
   *
   * @param {ConnectionObj} connection
   * @param {MessageNode} node
   * @return {Promise<ConnectionWithPackets}>}
   */
  private async _login(
    connection: TCPConnection,
    node: MessageNode
  ): Promise<ConnectionWithPackets> {
    // Create new response packet
    const pReply = new GenericReplyMessage();
    pReply.msgNo = 213;
    pReply.msgReply = 105;
    pReply.appId = connection.appId;
    const rPacket = new MessageNode(EMessageDirection.SENT);

    rPacket.deserialize(node.serialize());
    rPacket.updateBuffer(pReply.serialize());
    rPacket.dumpPacket();

    return { connection, packetList: [rPacket] };
  }

  /**
   *
   * @param {ConnectionObj} connection
   * @param {MessageNode} node
   * @return {Promise<ConnectionWithPackets>}
   */
  private async _getLobbies(
    connection: TCPConnection,
    node: MessageNode
  ): Promise<ConnectionWithPackets> {
    log.debug("In _getLobbies...");
    const lobbiesListMessage = node;

    // Update the appId
    lobbiesListMessage.appId = connection.appId;

    // Dump the packet
    log.debug("Dumping request...");
    log.debug(JSON.stringify(lobbiesListMessage));

    // Create new response packet
    // const lobbyMsg = new LobbyMsg()

    const pReply = new GenericReplyMessage();
    pReply.msgNo = 325;
    pReply.msgReply = 324;
    const rPacket = new MessageNode(EMessageDirection.SENT);
    rPacket.flags = 9;

    const lobby = Buffer.alloc(12);
    lobby.writeInt32LE(325, 0);
    lobby.writeInt32LE(0, 4);
    lobby.writeInt32LE(0, 8);

    rPacket.updateBuffer(pReply.serialize());

    // // Dump the packet
    log.debug("Dumping response...");
    log.debug(JSON.stringify(rPacket));

    return { connection, packetList: [rPacket] };
  }

  /**
   *
   * @param {module:ConnectionObj} connection
   * @param {module:MessageNode} node
   * @return {Promise<{con: ConnectionObj, nodes: MessageNode[]}>}
   */
  private async _logout(
    connection: TCPConnection,
    node: MessageNode
  ): Promise<ConnectionWithPackets> {
    const logoutMessage = node;

    logoutMessage.data = node.serialize();

    // Update the appId
    logoutMessage.appId = connection.appId;

    // Create new response packet
    const pReply = new GenericReplyMessage();
    pReply.msgNo = 101;
    pReply.msgReply = 106;
    const rPacket = new MessageNode(EMessageDirection.SENT);

    rPacket.deserialize(node.serialize());
    rPacket.updateBuffer(pReply.serialize());
    rPacket.dumpPacket();

    /** @type MessageNode[] */
    const nodes: MessageNode[] = [];

    return { connection, packetList: nodes };
  }

  /**
   *
   * @param {ConnectionObj} connection
   * @param {MessageNode} node
   * @return {Promise<ConnectionWithPackets>}
   */
  private async _setOptions(
    connection: TCPConnection,
    node: MessageNode
  ): Promise<ConnectionWithPackets> {
    const setOptionsMessage = node;

    setOptionsMessage.data = node.serialize();

    // Update the appId
    setOptionsMessage.appId = connection.appId;

    // Create new response packet
    const pReply = new GenericReplyMessage();
    pReply.msgNo = 101;
    pReply.msgReply = 109;
    const rPacket = new MessageNode(EMessageDirection.SENT);

    rPacket.deserialize(node.serialize());
    rPacket.updateBuffer(pReply.serialize());
    rPacket.dumpPacket();

    return { connection, packetList: [rPacket] };
  }

  /**
   *
   * @param {ConnectionObj} connection
   * @param {MessageNode} node
   * @return {Promise<ConnectionWithPackets>}
   */
  private async _trackingMessage(
    connection: TCPConnection,
    node: MessageNode
  ): Promise<ConnectionWithPackets> {
    const trackingMessage = node;

    trackingMessage.data = node.serialize();

    // Update the appId
    trackingMessage.appId = connection.appId;

    // Create new response packet
    const pReply = new GenericReplyMessage();
    pReply.msgNo = 101;
    pReply.msgReply = 440;
    const rPacket = new MessageNode(EMessageDirection.SENT);

    rPacket.deserialize(node.serialize());
    rPacket.updateBuffer(pReply.serialize());
    rPacket.dumpPacket();

    return { connection, packetList: [rPacket] };
  }

  /**
   *
   * @param {module:ConnectionObj} connection
   * @param {module:MessageNode} node
   * @return {Promise<ConnectionWithPackets>}
   */
  private async _updatePlayerPhysical(
    connection: TCPConnection,
    node: MessageNode
  ): Promise<ConnectionWithPackets> {
    const updatePlayerPhysicalMessage = node;

    updatePlayerPhysicalMessage.data = node.serialize();

    // Update the appId
    updatePlayerPhysicalMessage.appId = connection.appId;

    // Create new response packet
    const pReply = new GenericReplyMessage();
    pReply.msgNo = 101;
    pReply.msgReply = 266;
    const rPacket = new MessageNode(EMessageDirection.SENT);

    rPacket.deserialize(node.serialize());
    rPacket.updateBuffer(pReply.serialize());
    rPacket.dumpPacket();

    return { connection, packetList: [rPacket] };
  }

  async getStockCarInfo(
    connection: TCPConnection,
    packet: MessageNode
  ): Promise<ConnectionWithPackets> {
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
   * @param {ConnectionObj} connection
   * @param {MessageNode} packet
   * @return {Promise<{con: ConnectionObj, nodes: MessageNode[]}>}
   */
  async clientConnect(
    connection: TCPConnection,
    packet: MessageNode
  ): Promise<ConnectionWithPackets> {
    /**
     * Let's turn it into a ClientConnectMsg
     */
    // Not currently using this
    const newMessage = new ClientConnectMessage(packet.data);

    log.debug(
      `[TCPManager] Looking up the session key for ${newMessage.customerId}...`
    );
    const result = await this.databaseManager.fetchSessionKeyByCustomerId(
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
   * @param {ConnectionObj} conn
   * @return {Promise<ConnectionObj>}
   */
  async processInput(
    node: MessageNode,
    conn: TCPConnection
  ): Promise<TCPConnection> {
    const currentMessageNo: number = node.msgNo;
    const currentMessageString: string = this._MSG_STRING(currentMessageNo);

    switch (currentMessageString) {
      case "MC_SET_OPTIONS":
        try {
          const result = await this._setOptions(conn, node);
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
          const result = await this._trackingMessage(conn, node);
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
          const result = await this._updatePlayerPhysical(conn, node);
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
          const result = await this.clientConnect(conn, node);
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
          const result = await this._login(conn, node);
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
          const result = await this._logout(conn, node);
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
        const result = await this._getLobbies(conn, node);
        log.debug("Dumping Lobbies response packet...");
        log.debug(result.packetList.join().toString());
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
   * @param {MessageNode} msg
   * @param {ConnectionObj} con
   * @return {Promise<ConnectionObj>}
   */
  async messageReceived(
    message: MessageNode,
    con: TCPConnection
  ): Promise<TCPConnection> {
    const newConnection: TCPConnection = con;
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
          const encryptedBuffer: Buffer = Buffer.from(message.data);
          log.debug(
            `Full packet before decrypting: ${encryptedBuffer.toString("hex")}`
          );

          log.debug(
            `Message buffer before decrypting: ${encryptedBuffer.toString(
              "hex"
            )}`
          );

          log.debug(`Using encryption id: ${newConnection.getEncryptionId()}`);
          const deciphered: Buffer =
            newConnection.decryptBuffer(encryptedBuffer);
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

    log.debug('Calling processInput()')
    return this.processInput(message, newConnection);
  }

  async defaultHandler(rawPacket: UnprocessedPacket): Promise<TCPConnection> {
    const { connection, data } = rawPacket;
    const { remoteAddress, localPort } = connection;
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

    return this.messageReceived(messageNode, connection);
  }
}

/**
 * Manages TCP connection packet processing
 */

export async function compressIfNeeded(
  connection: TCPConnection,
  packet: MessageNode
): Promise<ConnectionWithPacket> {
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

export async function encryptIfNeeded(
  connection: TCPConnection,
  packet: MessageNode
): Promise<ConnectionWithPacket> {
  // Check if encryption is needed
  if (packet.flags - 8 >= 0) {
    log.debug("encryption flag is set");

    packet.updateBuffer(connection.encryptBuffer(packet.data));

    log.debug(`encrypted packet: ${packet.serialize().toString("hex")}`);
  }

  return { connection, packet };
}

export async function socketWriteIfOpen(
  connection: TCPConnection,
  packetList: MessageNode[]
): Promise<TCPConnection> {
  const updatedConnection: ConnectionWithPackets = {
    connection: connection,
    packetList: packetList,
  };
  // For each node in nodes
  for (const packet of updatedConnection.packetList) {
    // Does the packet need to be compressed?
    const compressedPacket: MessageNode = (
      await compressIfNeeded(connection, packet)
    ).packet;
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
      const port: string = connection.sock.localPort?.toString() || "";
      throw new Error(
        `Error writing ${encryptedPacket.serialize()} to ${
          connection.sock.remoteAddress
        } , ${port}`
      );
    }
  }

  return updatedConnection.connection;
}
