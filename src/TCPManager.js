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

const crypto = require('crypto');
const logger = require('./logger.js');
const lobby = require('./lobby.js');
const packet = require('./packet');
const MessageNode = require('./MessageNode.js');
const ClientConnectMsg = require('./ClientConnectMsg.js');
const database = require('../lib/database/index.js');

function socketWriteIfOpen(sock, data) {
  if (sock.writable) {
    sock.write(data);
  } else {
    logger.error(
      'Error writing ',
      data,
      ' to ',
      sock.remoteAddress,
      sock.localPort,
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
      return 'MC_CLIENT_CONNECT_MSG';
    default:
      return 'Unknown';
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

async function ClientConnect(con, node) {
  /**
   * Let's turn it into a ClientConnectMsg
   */
  // Not currently using this
  const newMsg = ClientConnectMsg.ClientConnectMsg(node.buffer);

  newMsg.dumpPacket();

  logger.debug(`Looking up the session key for ${con.id}...`);
  try {
    const res = await database.fetchSessionKeyByRemoteAddress(con.sock.remoteAddress);
    logger.warn('S Key: ', res.s_key);

    const connectionWithKey = con;

    try {
      connectionWithKey.enc2.cypher = crypto.createCipheriv('rc4', res.session_key, '');
      connectionWithKey.enc2.decipher = crypto.createDecipheriv('rc4', res.session_key, '');

      // Create new response packet
      // TODO: Do this cleaner
      const rPacket = new MessageNode.MessageNode(node.rawBuffer);

      // write the socket
      socketWriteIfOpen(connectionWithKey.sock, rPacket.rawBuffer);

      connectionWithKey.isSetupComplete = 1;
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

async function ProcessInput(node, conn) {
  const preDecryptMsgNo = Buffer.from([0xff, 0xff]);

  const msg = node.getBaseMsgHeader(node.buffer);

  const currentMsgNo = msg.msgNo;
  logger.debug('currentMsgNo: ', currentMsgNo);

  if (MSG_STRING(currentMsgNo) === 'MC_CLIENT_CONNECT_MSG') {
    try {
      const newConnection = await ClientConnect(conn, node);
      return newConnection;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  } else {
    // We should not do this
    // FIXME:We SHOULD NOT DO THIS
    socketWriteIfOpen(conn.sock, node.rawBuffer);
    logger.error(`Message Number Not Handled: ${currentMsgNo} (${MSG_STRING(currentMsgNo)})  Pre decrypt: ${preDecryptMsgNo.toString('hex')} (${MSG_STRING(preDecryptMsgNo)}) conID: ${node.toFrom}  PersonaID: ${node.appID}`);
    process.exit();
  }
}

async function MessageReceived(msg, con) {
  const newConnection = con;
  if (!newConnection.useEncryption && (msg.flags & 0x08)) {
    newConnection.useEncryption = 1;
  }
  // If not a Heartbeat
  if (!(msg.flags & 0x80) && newConnection.useEncryption) {
    // If not a Heartbeat
    if (!(msg.flags & 0x80) && newConnection.useEncryption) {
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
        logger.debug('===================================================================');
        logger.warn(
          'Message buffer before decrypting: ',
          msg.buffer.toString('hex'),
        );
        const deciphered2 = newConnection.enc2.decipher.update(msg.buffer);
        logger.warn('output2:    ', deciphered2);

        logger.debug('===================================================================');
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
    logger.error(error);
    throw error;
  }
}

async function npsHeartbeat() {
  const packetContent = Buffer.alloc(8);
  const packetResult = packet.buildPacket(8, 0x0127, packetContent);
  return packetResult;
}

async function lobbyDataHandler(con, rawData) {
  const requestCode = rawData.readUInt16BE().toString(16);

  switch (requestCode) {
    // npsRequestGameConnectServer
    case '100': {
      const packetResult = await lobby.npsRequestGameConnectServer(con.sock, rawData);
      socketWriteIfOpen(con.sock, packetResult);
      break;
    }
    // npsHeartbeat
    case '217': {
      const packetResult = await npsHeartbeat(con.sock, rawData);
      socketWriteIfOpen(con.sock, packetResult);
      break;
    }
    // npsSendCommand
    case '1101': {
      // This is an encrypted command
      // Fetch session key

      const newConnection = await lobby.sendCommand(con, rawData, requestCode);
      // FIXME: Figure out why sometimes the socket is closed at this point
      newConnection.sock.write(newConnection.encryptedCommand);
      return newConnection;
    }
    default:
      logger.error(`Unknown code ${requestCode} was received on port 7003`);
  }
  return con;
}

/**
   * Debug seems hard-coded to use the connection queue
   * Craft a packet that tells the client it's allowed to login
   */

function sendPacketOkLogin(socket) {
  socketWriteIfOpen(socket, Buffer.from([0x02, 0x30, 0x00, 0x00]));
}

async function handler(con, rawData) {
  const messageNode = MessageNode.MessageNode(rawData);
  logger.info(`=============================================
    Received packet on port ${con.sock.localPort} from ${con.sock
  .remoteAddress}...`);
  logger.info('=============================================');

  if (messageNode.isMCOTS()) {
    // messageNode.dumpPacket();

    const newConnection = await MessageReceived(messageNode, con);
    return newConnection;
  }
  logger.debug('No valid MCOTS header signature detected, sending to Lobby');
  logger.info('=============================================');
  logger.debug('Buffer as text: ', messageNode.buffer.toString('utf8'));
  logger.debug('Buffer as string: ', messageNode.buffer.toString('hex'));

  const newConnection = await lobbyDataHandler(con, rawData);
  return newConnection;
}

module.exports = { MSG_STRING, handler, sendPacketOkLogin };
