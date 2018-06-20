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

function socketWriteIfOpen(conn: Connection, node: MessageNode) {
  // Log that we are trying to write
  logger.debug(` Atempting to write seq: ${node.seq} to conn: ${conn.id}`);
  const { sock } = conn;
  const { rawBuffer } = node;

  // Log the buffer we are writing
  logger.debug(`Writting buffer: ${rawBuffer.toString("hex")}`);
  if (sock.writable) {
    sock.write(rawBuffer);
  } else {
    logger.error(
      "Error writing ",
      rawBuffer.toString(),
      " to ",
      sock.remoteAddress,
      sock.localPort.toString()
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
    logger.warn("Session Key: ", res.session_key);

    const connectionWithKey = con;

    try {
      const { customerId, personaId, personaName } = newMsg;
      const sessionKey = res.session_key;
      logger.debug(`Raw Session Key: ${sessionKey}`);
      const strKey = Buffer.from(sessionKey, "hex");
      connectionWithKey.setEncryptionKey(sessionKey);

      logger.debug(`Raw Session Key: ${sessionKey}`);

      // Log the session key
      logger.debug(
        `cust: ${customerId} ID: ${personaId} Name: ${personaName} SessionKey: ${strKey[0].toString(
          16
        )} ${strKey[1].toString(16)} ${strKey[2].toString(
          16
        )} ${strKey[3].toString(16)} ${strKey[4].toString(
          16
        )} ${strKey[5].toString(16)} ${strKey[6].toString(
          16
        )} ${strKey[7].toString(16)}`
      );

      // Create new response packet
      // TODO: Do this cleaner
      const rPacket = new MessageNode(node.rawBuffer);
      logger.debug(`Dumping response...`);
      rPacket.dumpPacket();

      // write the socket
      socketWriteIfOpen(connectionWithKey, rPacket);

      return connectionWithKey;
    } catch (err) {
      logger.error(err);
      logger.error(err.stack);
      process.exit();
    }
  } catch (error) {
    logger.error(error);
    logger.error(error.stack);
    process.exit();
  }
}

export async function ProcessInput(node: MessageNode, conn: Connection) {
  logger.debug(`In ProcessInput..`);
  const currentMsgNo = node.msgNo;
  const currentMsgString = MSG_STRING(currentMsgNo);
  logger.debug(`currentMsg: ${currentMsgString} (${currentMsgNo})`);

  if (currentMsgString === "MC_CLIENT_CONNECT_MSG") {
    try {
      const clientConnectMsg = await ClientConnect(conn, node);
      return clientConnectMsg;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  } else {
    // We should not do this
    // FIXME: WE SHOULD NOT DO THIS
    logger.error(`Message Number Not Handled: ${currentMsgNo} (${currentMsgString})
      conID: ${node.toFrom}  PersonaID: ${node.appId}`);
    process.exit();
  }
}

export async function MessageReceived(msg: MessageNode, con: Connection) {
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
      logger.warn(
        `Full packet before decrypting: `,
        msg.buffer.toString("hex")
      );

      const encryptedBuffer = msg.buffer.toString("hex");

      logger.warn(`Message buffer before decrypting: `, encryptedBuffer);
      const deciphered = newConnection.enc.processString(encryptedBuffer);
      logger.warn(
        "Message buffer after decrypting:    ",
        deciphered.toString("hex")
      );
      // console.log(`After mState: ${newConnection.enc.getSBox()}`);

      logger.debug(
        "==================================================================="
      );

      // This isn't real.
      socketWriteIfOpen(con, msg);

      return newConnection;
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
      sock.write(packetResult);
      break;
    }
    // npsHeartbeat
    case "217": {
      const packetResult = await npsHeartbeat();
      sock.write(packetResult);
      break;
    }
    // npsSendCommand
    case "1101": {
      // This is an encrypted command
      // Fetch session key

      const newConnection = await lobby.sendCommand(connection, data);
      const { sock: newSock, encryptedCommand } = newConnection;

      if (encryptedCommand == null) {
        logger.error("Error with encrypted command, dumping connection...");
        console.dir(newConnection);
        process.exit(1);
      }

      newSock.write(encryptedCommand);
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
  socket.write(Buffer.from([0x02, 0x30, 0x00, 0x00]));
}

export async function defaultHandler(rawPacket: IRawPacket) {
  const { connection, remoteAddress, localPort, data } = rawPacket;
  const messageNode = new MessageNode(data);
  logger.info(`=============================================
    Received packet on port ${localPort} from ${remoteAddress}...`);
  logger.info("=============================================");

  if (messageNode.isMCOTS()) {
    messageNode.dumpPacket();

    const newMessage = await MessageReceived(messageNode, connection);
    logger.debug(`Back from MessageRecieved`);
    return newMessage;
  }
  logger.debug("No valid MCOTS header signature detected, sending to Lobby");
  logger.info("=============================================");
  logger.debug("Buffer as text: ", messageNode.buffer.toString("utf8"));
  logger.debug("Buffer as string: ", messageNode.buffer.toString("hex"));

  const newConnection = await lobbyDataHandler(rawPacket);
  return newConnection;
}
