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

const util = require('util');
const pool = require('./database');
const {
  ClientConnectMsg, GetLobbiesListMsg, LobbyMsg, LoginMsg, MessageNode,
} = require('./messageTypes');
const lobby = require('./lobby');
const { logger } = require('./logger');
const packet = require('./packet');

function socketWriteIfOpen(conn, node) {
  // Log that we are trying to write
  logger.debug(` Atempting to write seq: ${node.seq} to conn: ${conn.id}`);
  const { sock } = conn;

  let packetToWrite = node.serialize();

  // Log the buffer we are writing
  logger.debug(`Writting buffer: ${packetToWrite.toString('hex')}`);
  if (sock.writable) {
    // Check if encryption is needed
    if (node.flags - 8 >= 0) {
      logger.debug('encryption flag is set');
      node.updateBuffer(conn.enc.out.processString(node.data));
      packetToWrite = node.serialize();
      logger.debug(`encrypted packet: ${packetToWrite.toString('hex')}`);
    }

    // Write the packet to socket
    sock.write(packetToWrite);
  } else {
    logger.error(
      'Error writing ',
      packetToWrite,
      ' to ',
      sock.remoteAddress,
      sock.localPort.toString(),
    );
  }
}

/**
 * Return the string representation of the numeric opcode
 * @param {int} msgID
 */
function MSG_STRING(msgID) {
  switch (msgID) {
    case 105:
      return 'MC_LOGIN';
    case 213:
      return 'MC_LOGIN_COMPLETE';
    case 324:
      return 'MC_GET_LOBBIES';
    case 325:
      return 'MC_LOBBIES';
    case 438:
      return 'MC_CLIENT_CONNECT_MSG';

    default:
      return 'Unknown';
  }
}

/**
 * Fetch session key from database based on remote address
 * @param {string} remoteAddress
 */
async function fetchSessionKeyByConnectionId(connectionId) {
  return pool.query('SELECT session_key, s_key FROM sessions WHERE connection_id = $1',
    [connectionId])
    .then(res => res.rows[0])
    .catch(e => setImmediate(() => { logger.error(`Unable to fetch session key for connection id: ${connectionId}: `, e); }));
}

async function Login(con, node) {
  const loginMsg = node;
  /**
   * Let's turn it into a LoginMsg
   */
  loginMsg.login = new LoginMsg(node.data);
  loginMsg.data = loginMsg.login.serialize();

  // Update the appId
  loginMsg.appId = con.appId;

  logger.debug(util.inspect(loginMsg));
  loginMsg.login.dumpPacket();

  // Create new response packet
  // TODO: Do this cleaner
  const rPacket = new MessageNode(node.serialize());
  rPacket.setMsgNo(101);
  logger.debug('Dumping response...');
  rPacket.dumpPacket();

  return [con, rPacket];
}

async function GetLobbies(con, node) {
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

  logger.debug('Dumping response...');
  lobbyMsg.dumpPacket();

  const rPacket = new MessageNode(node.data);
  rPacket.updateBuffer(lobbyMsg.serialize());

  rPacket.dumpPacket();

  return [con, rPacket];
}


async function ClientConnect(con, node) {
  const { id } = con;
  /**
   * Let's turn it into a ClientConnectMsg
   */
  // Not currently using this
  const newMsg = new ClientConnectMsg(node.serialize());

  logger.debug(`Looking up the session key for ${con.id}...`);
  try {
    const res = await fetchSessionKeyByConnectionId(id);
    logger.warn('Session Key: ', res.s_key);

    const connectionWithKey = con;

    try {
      const { customerId, personaId, personaName } = newMsg;
      const sessionKey = res.session_key;
      logger.debug(`Raw Session Key: ${sessionKey}`);

      const strKey = Buffer.from(sessionKey, 'hex');
      connectionWithKey.setEncryptionKey(strKey.slice(0, 16));

      // Update the connection's appId
      connectionWithKey.appId = newMsg.appId;

      // Log the session key
      logger.debug(
        `cust: ${customerId} ID: ${personaId} Name: ${personaName} SessionKey: ${strKey[0].toString(
          16,
        )} ${strKey[1].toString(16)} ${strKey[2].toString(
          16,
        )} ${strKey[3].toString(16)} ${strKey[4].toString(
          16,
        )} ${strKey[5].toString(16)} ${strKey[6].toString(
          16,
        )} ${strKey[7].toString(16)}`,
      );

      // Create new response packet
      // TODO: Do this cleaner
      const rPacket = new MessageNode(node.serialize());
      rPacket.setMsgNo(101);
      logger.debug('Dumping response...');
      rPacket.dumpPacket();

      return [connectionWithKey, rPacket];
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

async function ProcessInput(node, conn) {
  logger.debug('In ProcessInput..');
  const currentMsgNo = node.msgNo;
  const currentMsgString = MSG_STRING(currentMsgNo);
  logger.debug(`currentMsg: ${currentMsgString} (${currentMsgNo})`);

  if (currentMsgString === 'MC_CLIENT_CONNECT_MSG') {
    try {
      const [updatedConnection, responsePacket] = await ClientConnect(conn, node);
      // write the socket
      socketWriteIfOpen(updatedConnection, responsePacket);
      return updatedConnection;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  } else if (currentMsgString === 'MC_LOGIN') {
    try {
      const [updatedConnection, responsePacket] = await Login(conn, node);
      // write the socket
      socketWriteIfOpen(updatedConnection, responsePacket);
      return updatedConnection;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  } else if (currentMsgString === 'MC_GET_LOBBIES') {
    try {
      const [updatedConnection, responsePacket] = await GetLobbies(conn, node);
      // write the socket
      socketWriteIfOpen(updatedConnection, responsePacket);
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
  }
}

async function MessageReceived(msg, con) {
  logger.info('Welcome to MessageRecieved()');
  const newConnection = con;
  if (!newConnection.useEncryption && (msg.flags && 0x08)) {
    logger.debug('Turning on encryption');
    newConnection.useEncryption = true;
  }

  // If not a Heartbeat
  if (!(msg.flags === 80) && newConnection.useEncryption) {
    try {
      if (!newConnection.isSetupComplete) {
        logger.debug('3');
        logger.error(
          `Decrypt() not yet setup! Disconnecting...conId: ${con.id}`,
        );
        con.sock.end();
        process.exit();
      }

      /**
       * Attempt to decrypt message
       */
      logger.debug(
        '===================================================================',
      );
      const encryptedBuffer = msg.data.toString('hex');
      logger.warn(
        'Full packet before decrypting: ',
        encryptedBuffer,
      );


      logger.warn('Message buffer before decrypting: ', encryptedBuffer);
      const deciphered = newConnection.enc.in.processString(encryptedBuffer);
      logger.warn(
        'Message buffer after decrypting:    ',
        deciphered.toString('hex'),
      );

      logger.debug(
        '===================================================================',
      );

      // Update the MessageNode with the deciphered buffer
      msg.updateBuffer(deciphered);
    } catch (e) {
      logger.error(
        `Decrypt() exception thrown! Disconnecting...conId:${newConnection.id}`,
      );
      con.sock.end();
      throw e;
    }
  }

  // Should be good to process now
  try {
    return await ProcessInput(msg, newConnection);
  } catch (error) {
    logger.error('Err: ', error);
    throw error;
  }
}

async function npsHeartbeat() {
  const packetContent = Buffer.alloc(8);
  const packetResult = packet.buildPacket(8, 0x0127, packetContent);
  return packetResult;
}

async function lobbyDataHandler(rawPacket) {
  const { connection, data } = rawPacket;
  const { sock } = connection;
  const requestCode = data.readUInt16BE(0).toString(16);

  switch (requestCode) {
    // npsRequestGameConnectServer
    case '100': {
      const responsePacket = await lobby.npsRequestGameConnectServer(
        sock,
        data,
      );
      logger.debug(
        "responsePacket's data prior to sending: ",
        responsePacket.toString('hex'),
      );
      sock.write(responsePacket);
      break;
    }
    // npsHeartbeat
    case '217': {
      const responsePacket = await npsHeartbeat();
      logger.debug(
        "responsePacket's data prior to sending: ",
        responsePacket.toString('hex'),
      );
      sock.write(responsePacket);
      break;
    }
    // npsSendCommand
    case '1101': {
      // This is an encrypted command
      // Fetch session key

      const newConnection = await lobby.sendCommand(connection, data);
      const { sock: newSock, encryptedCommand } = newConnection;

      if (encryptedCommand == null) {
        logger.error(
          'Error with encrypted command, dumping connection...',
          newConnection,
        );
        process.exit(1);
      }

      logger.debug(
        "encrypedCommand's data prior to sending: ",
        encryptedCommand.toString('hex'),
      );
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

function sendPacketOkLogin(socket) {
  socket.write(Buffer.from([0x02, 0x30, 0x00, 0x00]));
}

async function defaultHandler(rawPacket) {
  const {
    connection, remoteAddress, localPort, data,
  } = rawPacket;
  let messageNode;
  try {
    messageNode = new MessageNode(data);
  } catch (e) {
    if (e instanceof RangeError) {
      // This is a very short packet, likely a heartbeat
      logger.debug('Unable to pack into a MessageNode, sending to Lobby');

      const newConnection = await lobbyDataHandler(rawPacket);
      return newConnection;
    }
    throw e;
  }

  logger.info(`=============================================
    Received packet on port ${localPort} from ${remoteAddress}...`);
  logger.info('=============================================');

  if (messageNode.isMCOTS()) {
    messageNode.dumpPacket();

    const newMessage = await MessageReceived(messageNode, connection);
    logger.debug('Back from MessageRecieved');
    return newMessage;
  }
  logger.debug('No valid MCOTS header signature detected, sending to Lobby');
  logger.info('=============================================');
  logger.debug('Buffer as text: ', messageNode.data.toString('utf8'));
  logger.debug('Buffer as string: ', messageNode.data.toString('hex'));

  const newConnection = await lobbyDataHandler(rawPacket);
  return newConnection;
}

module.exports = {
  MSG_STRING,
  ClientConnect,
  ProcessInput,
  MessageReceived,
  npsHeartbeat,
  lobbyDataHandler,
  sendPacketOkLogin,
  defaultHandler,
};
