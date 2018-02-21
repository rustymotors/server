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
import * as database from "../lib/database/index";
import ClientConnectMsg from "./ClientConnectMsg";
import { Connection } from "./Connection";
import { IRawPacket } from "./listenerThread";
import * as lobby from "./lobby";
import { logger } from "./logger";
import MessageNode from "./MessageNode";
import * as packet from "./packet";


function socketWriteIfOpen(sock: Socket, data: Buffer) {
  if (sock.writable) {
    sock.write(data);
  } else {
    logger.error(
      "Error writing ",
      data.toString(),
      " to ",
      sock.remoteAddress,
      sock.localPort.toString(),
    );
  }
}

/**
 * Return the string representation of the numeric opcode
 * @param {int} msgID
 */
export function MSG_STRING(msgID: number) {
  switch (msgID) {
    case 438:
      return "MC_CLIENT_CONNECT_MSG";
    default:
      return "Unknown";
  }
}

// /**
//  * Takes an encrypted command packet and returns the decrypted bytes
//  * @param {Connection} con
//  * @param {Buffer} cypherCmd
//  */
// function decryptCmd(con, cypherCmd) {
//   const s = con;
//   const decryptedCommand = s.enc.decipher.update(cypherCmd);
//   s.decryptedCmd = decryptedCommand;
//   logger.warn(`Enciphered Cmd: ${cypherCmd.toString('hex')}`);
//   logger.warn(`Deciphered Cmd: ${s.decryptedCmd.toString('hex')}`);
//   return s;
// }

export async function ClientConnect(con: Connection, node: MessageNode) {
  const { id } = con;
  /**
   * Let's turn it into a ClientConnectMsg
   */
  // Not currently using this
  const newMsg = new ClientConnectMsg(node.buffer);

  newMsg.dumpPacket();

  logger.debug(`Looking up the session key for ${con.id}...`);
  try {
    const res = await database.fetchSessionKeyByConnectionId(id);
    logger.warn("S Key: ", res.s_key);

    const connectionWithKey = con;

    try {
      connectionWithKey.setEncryptionKey(res.session_key)

      // Create new response packet
      // TODO: Do this cleaner
      const rPacket = new MessageNode(node.rawBuffer);

      // write the socket
      socketWriteIfOpen(connectionWithKey.sock, rPacket.rawBuffer);

      return connectionWithKey;
    } catch (err) {
      console.error(err);
      throw err;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function ProcessInput(node: MessageNode, conn: Connection) {

  const currentMsgNo = node.msgNo;
  const currentMsgString = MSG_STRING(currentMsgNo);
  logger.debug(`currentMsg: ${currentMsgString} (${currentMsgNo})`);

  if (currentMsgString === "MC_CLIENT_CONNECT_MSG") {
    try {
      const newConnection = await ClientConnect(conn, node);
      return newConnection;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  } else {
    // We should not do this
    // FIXME: WE SHOULD NOT DO THIS
    socketWriteIfOpen(conn.sock, node.rawBuffer);
    logger.error(`Message Number Not Handled: ${currentMsgNo} (${currentMsgString})
      conID: ${node.toFrom}  PersonaID: ${node.appId}`);
    process.exit();
  }
}

export async function MessageReceived(msg: MessageNode, con: Connection) {
  const newConnection = con;
  if (!newConnection.useEncryption && (msg.flags && 0x08)) {
    newConnection.useEncryption = true;
  }
  // If not a Heartbeat
  if (!(msg.flags && 0x80) && newConnection.useEncryption) {
    // If not a Heartbeat
    if (!(msg.flags && 0x80) && newConnection.useEncryption) {
      if (!newConnection.enc.decipher) {
        logger.error(`KEncrypt ->enc is NULL! Disconnecting...conId: ${newConnection.id}`);
        console.dir(newConnection);
        con.sock.end();
        process.exit();
      }
      try {
        if (!newConnection.isSetupComplete) {
          logger.error(`Decrypt() not yet setup! Disconnecting...conId: ${con.id}`);
          con.sock.end();
          process.exit();
        }

        /**
         * Attempt to decrypt message
         */
        logger.debug("===================================================================");
        logger.warn(
          "Message buffer before decrypting: ",
          msg.buffer.toString("hex"),
        );
        const deciphered = newConnection.enc.decipher.update(msg.buffer);
        logger.warn("output2:    ", deciphered.toString());

        logger.debug("===================================================================");
        return newConnection;
      } catch (e) {
        logger.error(`Decrypt() exception thrown! Disconnecting...conId:${newConnection.id}`);
        con.sock.end();
        throw e;
      }
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

export async function npsHeartbeat() {
  const packetContent = Buffer.alloc(8);
  const packetResult = packet.buildPacket(8, 0x0127, packetContent);
  return packetResult;
}

export async function lobbyDataHandler(rawPacket: IRawPacket) {
  const { connection, data } = rawPacket;
  const { sock } = connection;
  const requestCode = data.readUInt16BE(0).toString(16);

  switch (requestCode) {
    // npsRequestGameConnectServer
    case "100": {
      const packetResult = await lobby.npsRequestGameConnectServer(sock, data);
      socketWriteIfOpen(sock, packetResult);
      break;
    }
    // npsHeartbeat
    case "217": {
      const packetResult = await npsHeartbeat();
      socketWriteIfOpen(sock, packetResult);
      break;
    }
    // npsSendCommand
    case "1101": {
      // This is an encrypted command
      // Fetch session key

      const newConnection = await lobby.sendCommand(connection, data);
      const { sock: newSock, encryptedCommand } = newConnection;
      // FIXME: Figure out why sometimes the socket is closed at this point
      socketWriteIfOpen(newSock, encryptedCommand);
      return newConnection;
    }
    default:
      logger.error(`Unknown code ${requestCode} was received on port 7003`);
  }
  return connection;
}

/**
 * Debug seems hard-coded to use the connection queue
 * Craft a packet that tells the client it's allowed to login
 */

export function sendPacketOkLogin(socket: Socket) {
  socketWriteIfOpen(socket, Buffer.from([0x02, 0x30, 0x00, 0x00]));
}

export async function defaultHandler(rawPacket: IRawPacket) {
  const {
    connection, remoteAddress, localPort, data,
  } = rawPacket;
  const messageNode = new MessageNode(data);
  logger.info(`=============================================
    Received packet on port ${localPort} from ${remoteAddress}...`);
  logger.info("=============================================");

  if (messageNode.isMCOTS()) {
    // messageNode.dumpPacket();

    return MessageReceived(messageNode, connection);
  }
  logger.debug("No valid MCOTS header signature detected, sending to Lobby");
  logger.info("=============================================");
  logger.debug("Buffer as text: ", messageNode.buffer.toString("utf8"));
  logger.debug("Buffer as string: ", messageNode.buffer.toString("hex"));

  const newConnection = await lobbyDataHandler(rawPacket);
  return newConnection;
}
