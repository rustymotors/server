// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as assert from "assert";
// import { Socket } from "net";
import { ConnectionObj } from "../ConnectionObj";
import { IRawPacket } from "../IRawPacket";
// import { LobbyServer } from "../LobbyServer/LobbyServer";
import { MCOTServer } from "./MCOTServer";
import { ClientConnectMsg } from "../ClientConnectMsg";
import { GenericReplyMsg } from "../GenericReplyMsg";
import { GenericRequestMsg } from "../GenericRequestMsg";
import { MessageNode } from "./MessageNode";
import { StockCar } from "./StockCar";
import { StockCarInfoMsg } from "./StockCarInfoMsg";
import { DatabaseManager } from "../../shared/databaseManager";
import { Logger } from "../../shared/loggerManager";

const logger = new Logger().getLogger("TCPManager");
// const lobbyServer = new LobbyServer();
const mcotServer = new MCOTServer();
const databaseManager = new DatabaseManager();

async function compressIfNeeded(conn: ConnectionObj, node: MessageNode) {
  const packetToWrite = node;

  // Check if compression is needed
  if (node.getLength() < 80) {
    logger.debug("Too small, should not compress");
  } else {
    logger.debug(`This packet should be compressed`);
  }
  return { conn, packetToWrite };
}

async function encryptIfNeeded(conn: ConnectionObj, node: MessageNode) {
  let packetToWrite = node;

  // Check if encryption is needed
  if (node.flags - 8 >= 0) {
    logger.debug("encryption flag is set");

    let plainText;
    if (conn.enc) {
      plainText = node.data;
      node.updateBuffer(conn.enc.encrypt(plainText));
    } else {
      throw new Error("encryption out on connection is null");
    }
    packetToWrite = node;
    logger.debug(
      `encrypted packet: ${packetToWrite.serialize().toString("hex")}`
    );
  }

  return { conn, packetToWrite };
}

async function socketWriteIfOpen(conn: ConnectionObj, nodes: MessageNode[]) {
  const updatedConnection = conn;
  nodes.forEach(async node => {
    const { packetToWrite: compressedPacket } = await compressIfNeeded(
      conn,
      node
    );
    const { packetToWrite } = await encryptIfNeeded(conn, compressedPacket);
    // Log that we are trying to write
    logger.debug(
      ` Atempting to write seq: ${packetToWrite.seq} to conn: ${updatedConnection.id}`
    );

    // Log the buffer we are writing
    logger.debug(
      `Writting buffer: ${packetToWrite.serialize().toString("hex")}`
    );
    if (conn.sock.writable) {
      // Write the packet to socket
      conn.sock.write(packetToWrite.serialize());
      // updatedConnection = encryptedResult.conn;
    } else {
      throw new Error(
        `Error writing ${packetToWrite.serialize()} to ${
          conn.sock.remoteAddress
        } , ${conn.sock.localPort.toString()}`
      );
    }
  });
  return updatedConnection;
}

async function GetStockCarInfo(con: ConnectionObj, node: MessageNode) {
  const getStockCarInfoMsg = new GenericRequestMsg();
  getStockCarInfoMsg.deserialize(node.data);
  getStockCarInfoMsg.dumpPacket();

  const pReply = new StockCarInfoMsg(200, 0, 105);
  pReply.starterCash = 200;
  pReply.dealerId = 8;
  pReply.brand = 105;

  pReply.addStockCar(new StockCar(113, 20, 0)); // Bel-air
  pReply.addStockCar(new StockCar(104, 15, 1)); // Fairlane - Deal of the day
  pReply.addStockCar(new StockCar(402, 20, 0)); // Centry

  pReply.dumpPacket();

  const rPacket = new MessageNode("Sent");

  rPacket.deserialize(node.serialize());

  rPacket.updateBuffer(pReply.serialize());

  rPacket.dumpPacket();

  return { con, nodes: [rPacket] };
}

async function ClientConnect(con: ConnectionObj, node: MessageNode) {
  /**
   * Let's turn it into a ClientConnectMsg
   */
  // Not currently using this
  const newMsg = new ClientConnectMsg(node.data);

  logger.debug(
    `[TCPManager] Looking up the session key for ${newMsg.customerId}...`
  );
  const res = await databaseManager.fetchSessionKeyByCustomerId(
    newMsg.customerId
  );
  assert(res.session_key);
  logger.warn(`[TCPManager] Session Key: ${res.session_key}`);

  const connectionWithKey = con;

  const { customerId, personaId, personaName } = newMsg;
  const sessionKey = res.session_key;
  logger.debug(`Raw Session Key: ${sessionKey}`);

  const strKey = Buffer.from(sessionKey, "hex");
  connectionWithKey.setEncryptionKey(Buffer.from(strKey.slice(0, 16)));

  // Update the connection's appId
  connectionWithKey.appId = newMsg.getAppId();

  // Log the session key
  logger.debug(
    `cust: ${customerId} ID: ${personaId} Name: ${personaName} SessionKey: ${strKey[0].toString(
      16
    )} ${strKey[1].toString(16)} ${strKey[2].toString(16)} ${strKey[3].toString(
      16
    )} ${strKey[4].toString(16)} ${strKey[5].toString(16)} ${strKey[6].toString(
      16
    )} ${strKey[7].toString(16)}`
  );

  // Create new response packet
  const pReply = new GenericReplyMsg();
  pReply.msgNo = 101;
  pReply.msgReply = 438;
  const rPacket = new MessageNode("Sent");
  rPacket.deserialize(node.serialize());
  rPacket.updateBuffer(pReply.serialize());
  rPacket.dumpPacket();

  return { con, nodes: [rPacket] };
}

async function ProcessInput(node: MessageNode, conn: ConnectionObj) {
  let updatedConnection = conn;
  const currentMsgNo = node.msgNo;
  const currentMsgString = mcotServer._MSG_STRING(currentMsgNo);

  switch (currentMsgString) {
    case "MC_SET_OPTIONS":
      try {
        const result = await mcotServer._setOptions(conn, node);
        const responsePackets = result.nodes;
        updatedConnection = await socketWriteIfOpen(
          result.con,
          responsePackets
        );
        return updatedConnection;
      } catch (error) {
        throw new Error(`Error in MC_SET_OPTIONS: ${error}`);
      }
      break;
    case "MC_TRACKING_MSG":
      try {
        const result = await mcotServer._trackingMessage(conn, node);
        const responsePackets = result.nodes;
        updatedConnection = await socketWriteIfOpen(
          result.con,
          responsePackets
        );
        return updatedConnection;
      } catch (error) {
        throw new Error(`Error in MC_TRACKING_MSG: ${error}`);
      }
      break;
    case "MC_UPDATE_PLAYER_PHYSICAL":
      try {
        const result = await mcotServer._updatePlayerPhysical(conn, node);
        const responsePackets = result.nodes;
        updatedConnection = await socketWriteIfOpen(
          result.con,
          responsePackets
        );
        return updatedConnection;
      } catch (error) {
        throw new Error(`Error in MC_UPDATE_PLAYER_PHYSICAL: ${error}`);
      }
      break;

    default:
      break;
  }

  if (currentMsgString === "MC_CLIENT_CONNECT_MSG") {
    try {
      const result = await ClientConnect(conn, node);
      const responsePackets = result.nodes;
      // write the socket
      updatedConnection = await socketWriteIfOpen(result.con, responsePackets);
      return updatedConnection;
    } catch (error) {
      throw new Error(`[TCPManager] Error writing to socket: ${error}`);
    }
  } else if (currentMsgString === "MC_LOGIN") {
    try {
      const result = await mcotServer._login(conn, node);
      const responsePackets = result.nodes;
      // write the socket
      updatedConnection = await socketWriteIfOpen(result.con, responsePackets);
      return updatedConnection;
    } catch (error) {
      throw new Error(`[TCPManager] Error writing to socket: ${error}`);
    }
  } else if (currentMsgString === "MC_LOGOUT") {
    try {
      const result = await mcotServer._logout(conn, node);
      const responsePackets = result.nodes;
      // write the socket
      updatedConnection = await socketWriteIfOpen(result.con, responsePackets);
      return updatedConnection;
    } catch (error) {
      throw new Error(`[TCPManager] Error writing to socket: ${error}`);
    }
  } else if (currentMsgString === "MC_GET_LOBBIES") {
    const result = await mcotServer._getLobbies(conn, node);
    const responsePackets = result.nodes;
    try {
      // write the socket
      updatedConnection = await socketWriteIfOpen(result.con, responsePackets);
      return updatedConnection;
    } catch (error) {
      throw new Error(`[TCPManager] Error writing to socket: ${error}`);
    }
  } else if (currentMsgString === "MC_STOCK_CAR_INFO") {
    try {
      const result = await GetStockCarInfo(conn, node);
      const responsePackets = result.nodes;
      // write the socket
      updatedConnection = await socketWriteIfOpen(result.con, responsePackets);
      return updatedConnection;
    } catch (error) {
      throw new Error(`[TCPManager] Error writing to socket: ${error}`);
    }
  } else {
    node.setAppId(conn.appId);
    throw new Error(`Message Number Not Handled: ${currentMsgNo} (${currentMsgString})
      conID: ${node.toFrom}  PersonaID: ${node.appId}`);
  }
}

async function MessageReceived(msg: MessageNode, con: ConnectionObj) {
  const newConnection = con;
  if (!newConnection.useEncryption && (msg.flags && 0x08)) {
    logger.debug("Turning on encryption");
    newConnection.useEncryption = true;
  }

  // If not a Heartbeat
  if (!(msg.flags === 80) && newConnection.useEncryption) {
    if (!newConnection.isSetupComplete) {
      throw new Error(
        `Decrypt() not yet setup! Disconnecting...conId: ${con.id}`
      );
    }

    if (msg.flags - 8 >= 0) {
      try {
        /**
         * Attempt to decrypt message
         */
        const encryptedBuffer = Buffer.from(msg.data);
        logger.warn(
          `Full packet before decrypting: ${encryptedBuffer.toString("hex")}`
        );

        logger.warn(
          `Message buffer before decrypting: ${encryptedBuffer.toString("hex")}`
        );
        if (!newConnection.enc) {
          throw new Error("ARC4 decrypter is null");
        }
        logger.info(`Using encryption id: ${newConnection.enc.getId()}`);
        const deciphered = newConnection.enc.decrypt(encryptedBuffer);
        logger.warn(
          `Message buffer after decrypting: ${deciphered.toString("hex")}`
        );

        if (deciphered.readUInt16LE(0) <= 0) {
          throw new Error(`Failure deciphering message, exiting.`);
        }

        // Update the MessageNode with the deciphered buffer
        msg.updateBuffer(deciphered);
      } catch (e) {
        throw new Error(
          `Decrypt() exception thrown! Disconnecting...conId:${newConnection.id}: ${e}`
        );
      }
    }
  }

  // Should be good to process now
  return await ProcessInput(msg, newConnection);
}

export async function defaultHandler(rawPacket: IRawPacket) {
  const { connection, remoteAddress, localPort, data } = rawPacket;
  let messageNode;
  let newConnection = rawPacket.connection;
  try {
    messageNode = new MessageNode("Recieved");
    messageNode.deserialize(data);
  } catch (e) {
    if (e instanceof RangeError) {
      // This is a very short packet, likely a heartbeat
      logger.debug("Unable to pack into a MessageNode, sending to Lobby");
    }
    logger.error(`[TCPManager] Unable tp pack into MessageNode: ${e}`);
    return newConnection;
  }

  logger.info(
    {
      localPort,
      remoteAddress,
      direction: messageNode.direction,
      data: rawPacket.data.toString("hex"),
    },
    "Received TCP packet"
  );

  // if (messageNode.isMCOTS()) {
  messageNode.dumpPacket();

  const newMessage = await MessageReceived(messageNode, connection);
  return newMessage;
}
