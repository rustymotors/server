// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { Socket } from "net";
import * as util from "util";
import { Connection } from "./Connection";
import { pool } from "./database";
import { IRawPacket } from "./IRawPacket";
import { LobbyServer } from "./LobbyServer/LobbyServer";
import { logger } from "./logger";
import { MCOTServer } from "./MCOTServer";
import { ClientConnectMsg } from "./messageTypes/ClientConnectMsg";
import { GenericReplyMsg } from "./messageTypes/GenericReplyMsg";
import { GenericRequestMsg } from "./messageTypes/GenericRequestMsg";
import { GetLobbiesListMsg } from "./messageTypes/GetLobbiesListMsg";
import { LobbyMsg } from "./messageTypes/LobbyMsg";
import { LoginMsg } from "./messageTypes/LoginMsg";
import { MessageNode } from "./messageTypes/MessageNode";
import { StockCar } from "./messageTypes/StockCar";
import { StockCarInfoMsg } from "./messageTypes/StockCarInfoMsg";

const lobbyServer = new LobbyServer();
const mcotServer = new MCOTServer();

async function encryptIfNeeded(conn: Connection, node: MessageNode) {
  let packetToWrite = node;

  // Check if encryption is needed
  if (node.flags - 8 >= 0) {
    logger.debug("encryption flag is set");
    if (conn.enc.out) {
      logger.warn(`Using key: ${conn.enc.out.key}`);
      node.updateBuffer(conn.enc.out.processString(node.data.toString("hex")));
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

async function socketWriteIfOpen(conn: Connection, nodes: MessageNode[]) {
  let updatedConnection = conn;
  nodes.forEach(async node => {
    const encryptedResult = await encryptIfNeeded(conn, node);
    // Log that we are trying to write
    logger.debug(
      ` Atempting to write seq: ${encryptedResult.packetToWrite.seq} to conn: ${
        encryptedResult.conn.id
      }`
    );
    const { sock } = encryptedResult.conn;

    // Log the buffer we are writing
    logger.debug(
      `Writting buffer: ${encryptedResult.packetToWrite
        .serialize()
        .toString("hex")}`
    );
    if (sock.writable) {
      // Write the packet to socket
      sock.write(encryptedResult.packetToWrite.serialize());
      updatedConnection = encryptedResult.conn;
    } else {
      logger.error(
        `Error writing ${encryptedResult.packetToWrite.serialize()} to ${
          sock.remoteAddress
        } , ${sock.localPort.toString()}`
      );
    }
  });
  return updatedConnection;
}

/**
 * Fetch session key from database based on remote address
 * @param {string} remoteAddress
 */
async function fetchSessionKeyByConnectionId(connectionId: number) {
  return pool
    .query("SELECT session_key, s_key FROM sessions WHERE connection_id = $1", [
      connectionId,
    ])
    .then(
      (res: { rows: Array<{ session_key: string; s_key: string }> }) =>
        res.rows[0]
    )
    .catch((e: ExceptionInformation) =>
      setImmediate(() => {
        logger.error(
          `Unable to fetch session key for connection id: ${connectionId}: `,
          e
        );
      })
    );
}

export async function Login(con: Connection, node: MessageNode) {
  const loginMsg = node;
  /**
   * Let's turn it into a LoginMsg
   */
  loginMsg.login = new LoginMsg(node.data);
  loginMsg.data = loginMsg.login.serialize();

  // Update the appId
  loginMsg.appId = con.appId;

  loginMsg.login.dumpPacket();

  // Create new response packet
  // TODO: Do this cleaner
  const pReply = new GenericReplyMsg();
  pReply.msgNo = 101;
  pReply.msgReply = 105;
  const rPacket = new MessageNode();

  // lobbyMsg.dumpPacket();

  // const rPacket = new MessageNode();
  rPacket.deserialize(node.serialize());
  rPacket.updateBuffer(pReply.serialize());
  logger.debug("Dumping response...");
  rPacket.dumpPacket();

  return { con, nodes: [rPacket] };
}

async function GetLobbies(con: Connection, node: MessageNode) {
  const lobbiesListMsg = node;
  /**
   * Let's turn it into a LoginMsg
   */
  lobbiesListMsg.lobby = new GetLobbiesListMsg(node.data);
  lobbiesListMsg.data = lobbiesListMsg.serialize();

  // Update the appId
  lobbiesListMsg.appId = con.appId;

  // Create new response packet
  const lobbyMsg = new LobbyMsg();

  // TODO: Do this cleaner

  logger.debug("Dumping response...");

  const pReply = new GenericReplyMsg();
  pReply.msgNo = 101;
  pReply.msgReply = 324;
  const rPacket = new MessageNode();

  // lobbyMsg.dumpPacket();

  // const rPacket = new MessageNode();
  rPacket.deserialize(node.data);

  rPacket.updateBuffer(pReply.serialize());
  // rPacket.updateBuffer(lobbyMsg.serialize());

  rPacket.dumpPacket();

  return { con, nodes: [rPacket] };
}

async function GetStockCarInfo(con: Connection, node: MessageNode) {
  const getStockCarInfoMsg = new GenericRequestMsg();
  getStockCarInfoMsg.deserialize(node.data);
  getStockCarInfoMsg.dumpPacket();

  logger.debug("Dumping response...");

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
  const newMsg = new ClientConnectMsg(node.serialize());

  logger.debug(`Looking up the session key for ${con.id}...`);
  const res = await fetchSessionKeyByConnectionId(id);
  logger.warn(`Session Key: ${res.s_key}`);

  const connectionWithKey = con;

  const { customerId, personaId, personaName } = newMsg;
  const sessionKey = res.session_key;
  logger.debug(`Raw Session Key: ${sessionKey}`);

  const strKey = Buffer.from(sessionKey, "hex");
  connectionWithKey.setEncryptionKey(strKey.slice(0, 16).toString("hex"));

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
  // TODO: Do this cleaner
  const pReply = new GenericReplyMsg();
  pReply.msgNo = 101;
  pReply.msgReply = 438;
  const rPacket = new MessageNode();
  rPacket.deserialize(node.serialize());
  rPacket.updateBuffer(pReply.serialize());
  logger.debug("Dumping response...");
  rPacket.dumpPacket();

  return { con, nodes: [rPacket] };
}

async function ProcessInput(node: MessageNode, conn: Connection) {
  logger.debug("In ProcessInput..");
  let updatedConnection = conn;
  const currentMsgNo = node.msgNo;
  const currentMsgString = mcotServer._MSG_STRING(currentMsgNo);
  logger.debug(`currentMsg: ${currentMsgString} (${currentMsgNo})`);

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
      logger.error(error);
      throw error;
    }
  } else if (currentMsgString === "MC_LOGIN") {
    try {
      const result = await Login(conn, node);
      const responsePackets = result.nodes;
      // write the socket
      updatedConnection = await socketWriteIfOpen(result.con, responsePackets);
      return updatedConnection;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  } else if (currentMsgString === "MC_LOGOUT") {
    try {
      const result = await mcotServer._logout(conn, node);
      const responsePackets = result.nodes;
      // write the socket
      updatedConnection = await socketWriteIfOpen(result.con, responsePackets);
      return updatedConnection;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  } else if (currentMsgString === "MC_GET_LOBBIES") {
    try {
      const result = await GetLobbies(conn, node);
      const responsePackets = result.nodes;
      // write the socket
      updatedConnection = await socketWriteIfOpen(result.con, responsePackets);
      return updatedConnection;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  } else if (currentMsgString === "MC_STOCK_CAR_INFO") {
    try {
      const result = await GetStockCarInfo(conn, node);
      const responsePackets = result.nodes;
      // write the socket
      updatedConnection = await socketWriteIfOpen(result.con, responsePackets);
      return updatedConnection;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  } else {
    node.setAppId(conn.appId);
    logger.error(`Message Number Not Handled: ${currentMsgNo} (${currentMsgString})
      conID: ${node.toFrom}  PersonaID: ${node.appId}`);
    logger.debug(util.inspect(node));
    process.exit();
    return updatedConnection;
  }
}

async function MessageReceived(msg: MessageNode, con: Connection) {
  logger.info("Welcome to MessageRecieved()");
  const newConnection = con;
  if (!newConnection.useEncryption && (msg.flags && 0x08)) {
    logger.debug("Turning on encryption");
    newConnection.useEncryption = true;
  }

  // If not a Heartbeat
  if (!(msg.flags === 80) && newConnection.useEncryption) {
    try {
      if (!newConnection.isSetupComplete) {
        logger.debug("3");
        logger.error(
          `Decrypt() not yet setup! Disconnecting...conId: ${con.id}`
        );
        con.sock.end();
        process.exit();
      }

      /**
       * Attempt to decrypt message
       */
      logger.debug(
        "==================================================================="
      );
      const encryptedBuffer = msg.data.toString("hex");
      logger.warn(`Full packet before decrypting: ${encryptedBuffer}`);

      logger.warn(`Message buffer before decrypting: ${encryptedBuffer}`);
      if (!newConnection.enc.in) {
        throw new Error("ARC4 decrypter is null");
      }
      const deciphered = newConnection.enc.in.processString(encryptedBuffer);
      logger.warn(
        `Message buffer after decrypting: ${deciphered.toString("hex")}`
      );

      logger.debug(
        "==================================================================="
      );

      if (deciphered.readUInt16LE(0) <= 0) {
        logger.error(`Failure deciphering message, exiting.`);
        process.exit(1);
      }

      // Update the MessageNode with the deciphered buffer
      msg.updateBuffer(deciphered);
    } catch (e) {
      logger.error(
        `Decrypt() exception thrown! Disconnecting...conId:${newConnection.id}`
      );
      con.sock.end();
      throw e;
    }
  }

  // Should be good to process now
  try {
    return await ProcessInput(msg, newConnection);
  } catch (error) {
    logger.error("Err: ", error);
    throw error;
  }
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
      logger.debug("Unable to pack into a MessageNode, sending to Lobby");

      updatedConnection = await lobbyServer.dataHandler(rawPacket);
    }
    throw e;
  }

  logger.info(`=============================================
    Received packet on port ${localPort} from ${remoteAddress}...`);
  logger.info("=============================================");

  if (messageNode.isMCOTS()) {
    messageNode.dumpPacket();

    const newMessage = await MessageReceived(messageNode, connection);
    logger.debug("Back from MessageRecieved");
    return newMessage;
  }
  logger.debug("No valid MCOTS header signature detected, sending to Lobby");
  logger.info("=============================================");
  logger.debug(`Buffer as text: ${messageNode.data.toString("utf8")}`);
  logger.debug(`Buffer as string: ${messageNode.data.toString("hex")}`);

  const newConnection = await lobbyServer.dataHandler(rawPacket);
  return newConnection;
}
