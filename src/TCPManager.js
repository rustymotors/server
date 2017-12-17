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

const crypto = require("crypto");
const logger = require("./logger.js");
const lobby = require("./lobby.js");
const MessageNode = require("./MessageNode.js");
const ClientConnectMsg = require("./ClientConnectMsg.js");
const database = require("../lib/database/index.js");

function socketWriteIfOpen(sock, data) {
  if (sock.writable) {
    sock.write(data);
  } else {
    logger.error(
      "Error writing ",
      data,
      " to ",
      sock.remoteAddress,
      sock.localPort
    );
  }
}

/**
 * Return the string representation of the numeric opcode
 * @param {int} msgID 
 */
function MSG_STRING(msgID) {
  switch (msgID) {
    case 438:
      return "MC_CLIENT_CONNECT_MSG";
    default:
      return "Unknown";
  }
}

/**
 * Fetch session key from database based on remote address
 * @param {string} remoteAddress 
 * @param {function} callback 
 */
function fetchSessionKeyByRemoteAddress(remoteAddress, callback) {
  database.db.get(
    "SELECT session_key, s_key FROM sessions WHERE remote_address = $1",
    [remoteAddress],
    (err, res) => {
      if (err) {
        // Unknown error
        logger.error(
          `DATABASE ERROR: Unable to retrieve sessionsKey: ${err.message}`
        );
        callback(err);
      } else {
        callback(null, res);
      }
    }
  );
}

/**
 * Takes an encrypted command packet and returns the decrypted bytes
 * @param {Connection} con 
 * @param {Buffer} cypherCmd 
 */
function decryptCmd(con, cypherCmd) {
  const s = con;
  const decryptedCommand = s.enc.decipher.update(cypherCmd);
  s.decryptedCmd = decryptedCommand;
  logger.warn(`Enciphered Cmd: ${cypherCmd.toString("hex")}`);
  logger.warn(`Deciphered Cmd: ${s.decryptedCmd.toString("hex")}`);
  return s;
}

function ClientConnect(con, node) {
  logger.debug(`
    ~~~~~~~~~~~~~~~~~~~
    In ClientConnect...
    ~~~~~~~~~~~~~~~~~~~
  `);

  /**
   * Let's turn it into a ClientConnectMsg
   */
  newMsg = ClientConnectMsg.ClientConnectMsg(node.buffer);

  logger.info("=============================================");
  logger.debug("MsgId:       ", newMsg.msgId);
  logger.debug("customerId:  ", newMsg.customerId);
  logger.debug("personaId:   ", newMsg.personaId);
  logger.debug("custName:    ", newMsg.custName);
  logger.debug("personaName: ", newMsg.personaName);
  logger.debug("mcVersion:   ", newMsg.mcVersion.toString("hex"));
  logger.info("=============================================");

  logger.debug(`Looking up the session key for ${con.id}...`);
  fetchSessionKeyByRemoteAddress(con.sock.remoteAddress, (err, res) => {
    if (err) {
      logger.error(err.message);
      logger.error(err.stack);
      process.exit(1);
    }

    logger.warn("S Key: ", res.s_key);

    // Create the cypher and decipher only if not already set
    if (!con.enc2.cypher & !con.enc2.decipher) {
      const key = Buffer.from(res.s_key, "hex");
      // const key = res.s_key;
      const iv = Buffer.alloc(64);
      con.enc2.cypher = crypto.createCipheriv("RC4", key, "");
      con.enc2.decipher = crypto.createDecipheriv("RC4", key, "");
    }

    // Create new response packet
    // TODO: Do this cleaner
    rPacket = new MessageNode.MessageNode(node.rawBuffer);

    // write the socket
    socketWriteIfOpen(con.sock, rPacket.rawBuffer);

    con.isSetupComplete = 1;

    // return MC_SUCCESS = 101;
    return 101;
  });
}

function ProcessInput(node, conn) {
  logger.debug(`
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  In TCPManager::ProcessInput()
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  `);
  let preDecryptMsgNo = Buffer.from([0xff, 0xff]);

  const msg = node.getBaseMsgHeader(node.buffer);

  const currentMsgNo = msg.msgNo;
  logger.debug("currentMsgNo: ", currentMsgNo);

  // MC_FAILED = 102
  let result = 102;

  switch (MSG_STRING(currentMsgNo)) {
    case "MC_CLIENT_CONNECT_MSG":
      logger.info((node, conn, ""));
      result = ClientConnect(conn, node);

      break;

    default:
      // We should not do this
      // FIXME:We SHOULD NOT DO THIS
      socketWriteIfOpen(conn.sock, node.rawBuffer);
      logger.error(
        `Message Number Not Handled: ${currentMsgNo} (${MSG_STRING(
          currentMsgNo
        )})  Pre decrypt: ${preDecryptMsgNo.toString("hex")} (${MSG_STRING(
          preDecryptMsgNo
        )}) conID: ${node.toFrom}  PersonaID: ${node.appID}`
      );
  }
  return result;
}

function MessageReceived(msg, con) {
  logger.debug(`
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
In TCPManager::MessageReceived()
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
`);
  if (!con.useEncryption && msg.flags & 0x08) {
    con.useEncryption = 1;
    logger.debug("TCPMgr::MessageReceived() turning on encryption\n");
  }
  // If not a Heartbeat
  if (!(msg.flags & 0x80) && con.useEncryption) {
    logger.debug("TCPMgr::MessageReceived() Decrypt()\n");
    if (!con.enc.decipher) {
      logger.error(`KEncrypt ->enc is NULL! Disconnecting...conId: ${con.id}`);
    }
    // If not a Heartbeat
    if (!(msg.flags & 0x80) && con.useEncryption) {
      logger.debug(
        "Packet is not a heartbeat, and encryption is on for this connection"
      );
      if (!con.enc.decipher) {
        logger.error(
          `KEncrypt ->enc is NULL! Disconnecting...conId: ${con.id}`
        );
        con.sock.end();
        return;
      }
      try {
        if (!con.isSetupComplete) {
          logger.error(
            `Decrypt() not yet setup! Disconnecting...conId: ${con.id}`
          );
          con.sock.end();
          return;
        }

        /**
         * Attempt to decrypt message
         */
        logger.debug(
          "==================================================================="
        );
        logger.debug(
          "Message buffer before decrypting: ",
          msg.buffer.toString("hex")
        );
        console.log("output:    ", con.enc2.decipher.update(msg.buffer));

        logger.debug(
          "==================================================================="
        );
      } catch (e) {
        logger.error(
          `Decrypt() exception thrown! Disconnecting...conId:${con.id}`
        );
        con.sock.end();
        throw e;
      }
    }
  }

  // Should be good to process now
  ProcessInput(msg, con);
}

function npsHeartbeat(socket, rawData) {
  const packetContent = Buffer.alloc(8);
  const packetResult = packet.buildPacket(8, 0x0127, packetContent);
  return packetResult;
}

function lobbyDataHandler(con, rawData) {
  const requestCode = rawData.readUInt16BE().toString(16);

  switch (requestCode) {
    // npsRequestGameConnectServer
    case "100": {
      const packetResult = lobby.npsRequestGameConnectServer(con.sock, rawData);
      socketWriteIfOpen(con.sock, packetResult);
      break;
    }
    // npsHeartbeat
    case "217": {
      const packetResult = npsHeartbeat(con.sock, rawData);
      socketWriteIfOpen(con.sock, packetResult);
      break;
    }
    // npsSendCommand
    case "1101": {
      // This is an encrypted command
      // Fetch session key

      con = lobby.sendCommand(con, rawData, requestCode);
      break;
    }
    default:
      logger.error(`Unknown code ${requestCode} was received on port 7003`);
  }
}

/**
   * Debug seems hard-coded to use the connection queue
   * Craft a packet that tells the client it's allowed to login
   */

function sendPacketOkLogin(socket) {
  socketWriteIfOpen(socket, Buffer.from([0x02, 0x30, 0x00, 0x00]));
}

function handler(con, rawData) {
  const messageNode = MessageNode.MessageNode(rawData);
  logger.info(`=============================================
    Received packet on port ${con.sock.localPort} from ${con.sock
    .remoteAddress}...`);
  logger.info("=============================================");

  if (messageNode.isMCOTS()) {
    logger.debug("Packet has a valid MCOTS header signature");
    logger.info("=============================================");
    logger.debug("Header Length: ", messageNode.header.length);
    logger.debug("Header MCOSIG: ", messageNode.isMCOTS());
    logger.debug("Sequence: ", messageNode.seq);
    logger.debug("Flags: ", messageNode.flags);
    logger.debug("Buffer: ", messageNode.buffer);
    logger.debug("Buffer as text: ", messageNode.buffer.toString("utf8"));
    logger.debug("Buffer as string: ", messageNode.buffer.toString("hex"));
    logger.debug(
      "Raw Buffer as string: ",
      messageNode.rawBuffer.toString("hex")
    );
    logger.info("=============================================");

    MessageReceived(messageNode, con);
  } else {
    logger.debug("No valid MCOTS header signature detected, sending to Lobby");
    logger.info("=============================================");
    logger.debug("Buffer as text: ", messageNode.buffer.toString("utf8"));
    logger.debug("Buffer as string: ", messageNode.buffer.toString("hex"));

    lobbyDataHandler(con, rawData);
  }
}

module.exports = { MSG_STRING, handler, sendPacketOkLogin };
