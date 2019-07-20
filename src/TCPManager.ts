// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as assert from "assert";
import { Socket } from "net";
import { Connection } from "./Connection";
import { IRawPacket } from "./services/shared/interfaces/IRawPacket";
import { LobbyServer } from "./LobbyServer/LobbyServer";
import { Logger } from "./services/shared/logger";
import { MCOTServer } from "./MCOTS/MCOTServer";
import { ClientConnectMsg } from "./services/shared/messageTypes/ClientConnectMsg";
import { GenericReplyMsg } from "./services/shared/messageTypes/GenericReplyMsg";
import { GenericRequestMsg } from "./services/shared/messageTypes/GenericRequestMsg";
import { MessageNode } from "./services/shared/messageTypes/MessageNode";
import { StockCar } from "./services/shared/messageTypes/StockCar";
import { StockCarInfoMsg } from "./services/shared/messageTypes/StockCarInfoMsg";
import { DatabaseManager } from "./databaseManager";

const loggers = new Logger().getLoggers();
const lobbyServer = new LobbyServer();
const mcotServer = new MCOTServer();
const databaseManager = new DatabaseManager(loggers);

async function compressIfNeeded(conn: Connection, node: MessageNode) {
  const packetToWrite = node;

  // Check if compression is needed
  if (node.getLength() < 80) {
    loggers.both.debug("Too small, should not compress");
  } else {
    loggers.both.debug(`This packet should be compressed`);
  }
  return { conn, packetToWrite };
}

async function encryptIfNeeded(conn: Connection, node: MessageNode) {
  let packetToWrite = node;

  // Check if encryption is needed
  if (node.flags - 8 >= 0) {
    loggers.both.debug("encryption flag is set");

    let plainText;
    if (conn.enc) {
      plainText = node.data;
      node.updateBuffer(conn.enc.encrypt(plainText));
    } else {
      throw new Error("encryption out on connection is null");
    }
    packetToWrite = node;
    loggers.both.debug(
      `encrypted packet: ${packetToWrite.serialize().toString("hex")}`
    );
  }

  return { conn, packetToWrite };
}

async function socketWriteIfOpen(conn: Connection, nodes: MessageNode[]) {
  const updatedConnection = conn;
  nodes.forEach(async node => {
    const { packetToWrite: compressedPacket } = await compressIfNeeded(
      conn,
      node
    );
    const { packetToWrite } = await encryptIfNeeded(conn, compressedPacket);
    // Log that we are trying to write
    loggers.both.debug(
      ` Atempting to write seq: ${packetToWrite.seq} to conn: ${updatedConnection.id}`
    );

    // Log the buffer we are writing
    loggers.both.debug(
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

async function GetStockCarInfo(con: Connection, node: MessageNode) {
  const getStockCarInfoMsg = new GenericRequestMsg();
  getStockCarInfoMsg.deserialize(node.data);
  getStockCarInfoMsg.dumpPacket();

  loggers.both.debug("Dumping response...");

  const pReply = new StockCarInfoMsg();
  pReply.starterCash = 200;
  pReply.dealerId = 8;
  pReply.brand = 105;

  const newStockCar = new StockCar();
  pReply.StockCarList.push(newStockCar);

  pReply.dumpPacket();

  const rPacket = new MessageNode();

  rPacket.deserialize(node.serialize());

  rPacket.updateBuffer(pReply.serialize());

  rPacket.dumpPacket();

  return { con, nodes: [rPacket] };
}

async function ClientConnect(con: Connection, node: MessageNode) {
  const { id } = con;
  /**
   * Let's turn it into a ClientConnectMsg
   */
  // Not currently using this
  const newMsg = new ClientConnectMsg(node.data);

  loggers.both.debug(
    `[TCPManager] Looking up the session key for ${newMsg.customerId}...`
  );
  const res = await databaseManager.fetchSessionKeyByCustomerId(
    newMsg.customerId
  );
  assert(res.session_key);
  loggers.both.warn(`[TCPManager] Session Key: ${res.session_key}`);

  const connectionWithKey = con;

  const { customerId, personaId, personaName } = newMsg;
  const sessionKey = res.session_key;
  loggers.both.debug(`Raw Session Key: ${sessionKey}`);

  const strKey = Buffer.from(sessionKey, "hex");
  connectionWithKey.setEncryptionKey(Buffer.from(strKey.slice(0, 16)));

  // Update the connection's appId
  connectionWithKey.appId = newMsg.getAppId();

  // Log the session key
  loggers.both.debug(
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
  const rPacket = new MessageNode();
  rPacket.deserialize(node.serialize());
  rPacket.updateBuffer(pReply.serialize());
  loggers.both.debug("Dumping response...");
  rPacket.dumpPacket();

  return { con, nodes: [rPacket] };
}

async function ProcessInput(node: MessageNode, conn: Connection) {
  loggers.both.debug("In ProcessInput..");
  let updatedConnection = conn;
  const currentMsgNo = node.msgNo;
  const currentMsgString = mcotServer._MSG_STRING(currentMsgNo);
  loggers.both.debug(`currentMsg: ${currentMsgString} (${currentMsgNo})`);

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
        throw error;
      }
      break;
    case "MC_TRACKING_MSG":
      try {
        const result = await mcotServer._trackingMessage(conn, node);
        const responsePackets = result.nodes;
        // updatedConnection = await socketWriteIfOpen(
        //   result.con,
        //   responsePackets
        // );
        return updatedConnection;
      } catch (error) {
        throw error;
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
        throw error;
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

async function MessageReceived(msg: MessageNode, con: Connection) {
  loggers.both.info("Welcome to MessageRecieved()");
  const newConnection = con;
  if (!newConnection.useEncryption && (msg.flags && 0x08)) {
    loggers.both.debug("Turning on encryption");
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
        loggers.both.debug(
          "==================================================================="
        );
        const encryptedBuffer = Buffer.from(msg.data);
        loggers.both.warn(
          `Full packet before decrypting: ${encryptedBuffer.toString("hex")}`
        );

        loggers.both.warn(
          `Message buffer before decrypting: ${encryptedBuffer.toString("hex")}`
        );
        if (!newConnection.enc) {
          throw new Error("ARC4 decrypter is null");
        }
        loggers.both.info(`Using encryption id: ${newConnection.enc.getId()}`);
        const deciphered = newConnection.enc.decrypt(encryptedBuffer);
        loggers.both.warn(
          `Message buffer after decrypting: ${deciphered.toString("hex")}`
        );

        loggers.both.debug(
          "==================================================================="
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

/**
 * Debug seems hard-coded to use the connection queue
 * Craft a packet that tells the client it's allowed to login
 */

export function sendPacketOkLogin(socket: Socket) {
  socket.write(Buffer.from([0x02, 0x30, 0x00, 0x00]));
}

export async function defaultHandler(rawPacket: IRawPacket) {
  const { connection, remoteAddress, localPort, data } = rawPacket;
  let updatedConnection = connection;
  let messageNode;
  try {
    messageNode = new MessageNode();
    messageNode.deserialize(data);
  } catch (e) {
    if (e instanceof RangeError) {
      // This is a very short packet, likely a heartbeat
      loggers.both.debug("Unable to pack into a MessageNode, sending to Lobby");

      updatedConnection = await lobbyServer.dataHandler(rawPacket);
    }
    throw e;
  }

  loggers.both.info(`=============================================
    Received packet on port ${localPort} from ${remoteAddress}...`);
  loggers.both.info("=============================================");

  if (messageNode.isMCOTS()) {
    messageNode.dumpPacket();

    const newMessage = await MessageReceived(messageNode, connection);
    loggers.both.debug("Back from MessageRecieved");
    return newMessage;
  }
  loggers.both.debug(
    "No valid MCOTS header signature detected, sending to Lobby"
  );
  loggers.both.info("=============================================");
  loggers.both.debug(`Buffer as text: ${messageNode.data.toString("utf8")}`);
  loggers.both.debug(`Buffer as string: ${messageNode.data.toString("hex")}`);

  const newConnection = await lobbyServer.dataHandler(rawPacket);
  return newConnection;
}
