

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
const { promisify } = require('util');
const logger = require('./logger.js');
const lobby = require('./lobby.js');
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

function ClientConnect(con, node) {
  return new Promise((resolve, reject) => {
    /**
     * Let's turn it into a ClientConnectMsg
     */
    const newMsg = ClientConnectMsg.ClientConnectMsg(node.buffer);

    logger.info('=============================================');
    logger.debug('MsgId:       ', newMsg.msgId);
    logger.debug('customerId:  ', newMsg.customerId);
    logger.debug('personaId:   ', newMsg.personaId);
    logger.debug('custName:    ', newMsg.custName);
    logger.debug('personaName: ', newMsg.personaName);
    logger.debug('mcVersion:   ', newMsg.mcVersion.toString('hex'));
    logger.info('=============================================');

    logger.debug(`Looking up the session key for ${con.id}...`);
    database.fetchSessionKeyByRemoteAddress(con.sock.remoteAddress)
      .catch((err) => {
        logger.error('Error: ', err);
        return reject(err);
      })
      .then((res) => {
        logger.warn('S Key: ', res.s_key);

        const connectionWithKey = con;

        try {
          connectionWithKey.enc = crypto.createCipheriv('rc4', res.s_key, '');

          // Create new response packet
          // TODO: Do this cleaner
          const rPacket = new MessageNode.MessageNode(node.rawBuffer);

          // write the socket
          socketWriteIfOpen(con.sock, rPacket.rawBuffer);

          connectionWithKey.isSetupComplete = 1;
          console.log('connectionWithKey: ', connectionWithKey);
          resolve(connectionWithKey);
        } catch (err) {
          return reject(err);
        }
      });
    logger.warn('ClientConnect: Hopefully after fetching key');
  });
}

function ProcessInput(node, conn) {
  console.trace('=== ProcessInput:');
  return new Promise((resolve) => {
    const preDecryptMsgNo = Buffer.from([0xff, 0xff]);

    const msg = node.getBaseMsgHeader(node.buffer);

    const currentMsgNo = msg.msgNo;
    logger.debug('currentMsgNo: ', currentMsgNo);

    if (MSG_STRING(currentMsgNo) === 'MC_CLIENT_CONNECT_MSG') {

      ClientConnect(conn, node)
        .then((newConnection) => {
          console.log('This is a good connection: ', newConnection);
          resolve(newConnection);
        }).catch((err) => {
          logger.error('There was an err: ', err);
          throw err;
        });
    } else {
      // We should not do this
      // FIXME:We SHOULD NOT DO THIS
      socketWriteIfOpen(conn.sock, node.rawBuffer);
      logger.error(`Message Number Not Handled: ${currentMsgNo} (${MSG_STRING(currentMsgNo)})  Pre decrypt: ${preDecryptMsgNo.toString('hex')} (${MSG_STRING(preDecryptMsgNo)}) conID: ${node.toFrom}  PersonaID: ${node.appID}`);
      process.exit();
    }
  });
}

function MessageReceived(msg, con) {
  const newConnection = con;
  if (!newConnection.useEncryption && (msg.flags & 0x08)) {
    newConnection.useEncryption = 1;
    logger.debug('TCPMgr::MessageReceived() turning on encryption\n');
  }
  // If not a Heartbeat
  if (!(msg.flags & 0x80) && newConnection.useEncryption) {
    // logger.debug("TCPMgr::MessageReceived() Decrypt()\n");
    if (!newConnection.enc.decipher) {
      logger.error(`KEncrypt ->enc is NULL! Disconnecting...conId: ${newConnection.id}`);
    }
    // If not a Heartbeat
    if (!(msg.flags & 0x80) && newConnection.useEncryption) {
      // logger.debug(
      //   "Packet is not a heartbeat, and encryption is on for this connection"
      // );
      if (!newConnection.enc.decipher) {
        logger.error(`KEncrypt ->enc is NULL! Disconnecting...conId: ${newConnection.id}`);
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
        const deciphered = newConnection.enc.decipher(msg.buffer);
        logger.warn('output:    ', deciphered);

        logger.debug('===================================================================');
        console.log('newConnection from messagerecieved: ', newConnection);
        return newConnection;
      } catch (e) {
        logger.error(`Decrypt() exception thrown! Disconnecting...conId:${newConnection.id}`);
        con.sock.end();
        throw e;
      }
    }
  }

  // Should be good to process now
  ProcessInput(msg, newConnection)
    .then((newConnectionProcessed) => {
      console.log('newConnectionProcessed from messagerecieved: ', newConnectionProcessed);
      return newConnectionProcessed;
    })
    .catch((err) => {
      logger.error('ERROR!: ', err);
      throw err;
    });
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
    case '100': {
      const packetResult = lobby.npsRequestGameConnectServer(con.sock, rawData);
      socketWriteIfOpen(con.sock, packetResult);
      break;
    }
    // npsHeartbeat
    case '217': {
      const packetResult = npsHeartbeat(con.sock, rawData);
      socketWriteIfOpen(con.sock, packetResult);
      break;
    }
    // npsSendCommand
    case '1101': {
      // This is an encrypted command
      // Fetch session key

      lobby.sendCommand(con, rawData, requestCode)
        .then(newConnection => newConnection);
      break;
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

function handler(con, rawData) {
  const messageNode = MessageNode.MessageNode(rawData);
  logger.info(`=============================================
    Received packet on port ${con.sock.localPort} from ${con.sock
  .remoteAddress}...`);
  logger.info('=============================================');

  if (messageNode.isMCOTS()) {
    logger.debug('Packet has a valid MCOTS header signature');
    logger.info('=============================================');
    logger.debug('Header Length: ', messageNode.header.length);
    logger.debug('Header MCOSIG: ', messageNode.isMCOTS());
    logger.debug('Sequence: ', messageNode.seq);
    logger.debug('Flags: ', messageNode.flags);
    logger.debug('Buffer: ', messageNode.buffer);
    logger.debug('Buffer as text: ', messageNode.buffer.toString('utf8'));
    logger.debug('Buffer as string: ', messageNode.buffer.toString('hex'));
    logger.debug(
      'Raw Buffer as string: ',
      messageNode.rawBuffer.toString('hex'),
    );
    logger.info('=============================================');

    const newConnection = MessageReceived(messageNode, con);
    console.trace('newConnection from Handler: ', newConnection);
    return newConnection;
  }
  logger.debug('No valid MCOTS header signature detected, sending to Lobby');
  logger.info('=============================================');
  logger.debug('Buffer as text: ', messageNode.buffer.toString('utf8'));
  logger.debug('Buffer as string: ', messageNode.buffer.toString('hex'));

  return lobbyDataHandler(con, rawData);
}

module.exports = { MSG_STRING, handler, sendPacketOkLogin };
