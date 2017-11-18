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

const rc4 = require("arc4");
const crypto = require("crypto");
const util = require("./nps_utils.js");
const logger = require("./logger.js");
const lobby = require("./lobby.js");
const MessageNode = require("./MessageNode.js");
const database = require("../lib/database/index.js");

class Connection {
  constructor() {
    this.id = 0;
    this.appID = 0;
    this.status = "INACTIVE";
    this.sock = 0;
    this.msgEvent = null;
    this.lastMsg = 0;
    this.useEncryption = 0;
    this.enc = null;
    this.isSetupComplete = 0;
  }
}

/**
 * Return the string representtion of the numaric opcode
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
        console.error(
          `DATABASE ERROR: Unable to retrieve sessionsKey: ${err.message}`
        );
        callback(err);
      } else {
        callback(null, res);
      }
    }
  );
}

function ClientConnect(con, node) {
  logger.debug(`
    ~~~~~~~~~~~~~~~~~~~
    In ClientConnect...
    ~~~~~~~~~~~~~~~~~~~
  `);

  fetchSessionKeyByRemoteAddress(con.sock.remoteAddress, (err, res) => {
    if (err) {
      console.error(err.message);
      console.error(err.stack);
      process.exit(1);
    }

    // Create the encryption object
    con.enc = rc4("arc4", res.session_key);

    // Create the cypher and decyper only if not already set
    if (!con.cypher & !con.decypher) {
      const desIV = Buffer.alloc(8);
      con.cypher = crypto
        .createCipheriv("des-cbc", Buffer.from(res.s_key, "hex"), desIV)
        .setAutoPadding(false);
      con.decypher = crypto
        .createDecipheriv("des-cbc", Buffer.from(res.s_key, "hex"), desIV)
        .setAutoPadding(false);
    }

    // write the socket
    con.sock.write(node.rawBuffer);

    con.isSetupComplete = 1;

    // return MC_SUCCESS = 101;
    return 101;
  });
}

function ProcessInput(node, info) {
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
      logger.info((node, info, ""));
      result = ClientConnect(info, node);

      break;

    default:
      logger.error(
        `Message Number Not Handled: ${currentMsgNo} (${MSG_STRING(
          currentMsgNo
        )})  Predecrypt: ${preDecryptMsgNo.toString("hex")} (${MSG_STRING(
          preDecryptMsgNo
        )}) conID: ${node.toFrom}  PersID: ${node.appID}`
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
    logger.debug("TCPMgr::MessageRecieved() turning on encryption\n");
  }
  // If not a Heartbeat
  if (!(msg.flags & 0x80) && con.useEncryption) {
    logger.debug("TCPMgr::MessageRecieved() Decrypt()\n");
    if (!con.enc) {
      logger.error(`KEncrypt ->enc is NULL! Disconnecting...conid: ${con.id}`);
    }
    // If not a Heartbeat
    if (!(msg.flags & 0x80) && con.useEncryption) {
      logger.debug("TCPMgr::MessageRecieved() Decrypt()\n");
      if (!con.enc) {
        logger.error(
          `KEncrypt ->enc is NULL! Disconnecting...conid: ${con.id}`
        );
        con.sock.end();
        return;
      }
      try {
        if (!con.isSetupComplete) {
          logger.error(
            `Decrypt() not yet setup! Disconnecting...conid: ${con.id}`
          );
          con.sock.end();
          return;
        }

        logger.warn(msg.buffer.toString("hex"));

        logger.warn(
          "Decrypted:   ",
          con.enc.decodeString(msg.buffer.toString("hex"), "hex", "hex")
        );
        logger.warn("Decrypted: 2 ", con.decypher.update(msg.buffer));
      } catch (e) {
        logger.error(
          `Decrypt() exception thrown! Disconnecting...conid:${con.id}`
        );
        con.sock.end();
        throw e;
      }
    }

    ProcessInput(msg, con);
  } else {
    ProcessInput(msg, con);
  }
}

function getRequestCode(rawBuffer) {
  return `${util.toHex(rawBuffer[0])}${util.toHex(rawBuffer[1])}`;
}

function lobbyDataHandler(con, rawData) {
  const requestCode = getRequestCode(rawData);

  switch (requestCode) {
    // npsRequestGameConnectServer
    case "0100": {
      const packetresult = lobby.npsRequestGameConnectServer(con.sock, rawData);
      con.sock.write(packetresult);
      break;
    }
    // npsHeartbeat
    case "0217": {
      const packetresult = util.npsHeartbeat(con.sock, rawData);
      con.sock.write(packetresult);
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
      util.dumpRequest(con.sock, rawData, requestCode);
      logger.error(`Unknown code ${requestCode} was recieved on port 7003`);
  }
}

function handler(con, rawData) {
  const messageNode = MessageNode.MessageNode(rawData);
  logger.info(`=============================================
    Recieved packet on port ${con.sock.localPort} from ${con.sock
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

    lobbyDataHandler(con, rawData);
  }
}

module.exports = { MSG_STRING, handler };
