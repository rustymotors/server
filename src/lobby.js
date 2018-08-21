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
const { logger } = require('./logger');
const packet = require('./packet');

const pool = require('./database');

/**
 * Handle a request to connect to a game server packet
 * @param {Socket} socket
 * @param {Buffer} rawData
 */
async function npsRequestGameConnectServer(socket, rawData) {
  logger.info('*** npsRequestGameConnectServer ****');
  logger.debug('Packet as hex: ', rawData.toString('hex'));
  logger.info('************************************');

  // // Load the received data into a MsgPack class
  // const msgPack = MsgPack(rawData);

  // Return a _NPS_UserInfo structure - 40
  const packetContent = Buffer.alloc(38);

  // MsgLen
  Buffer.from([0x00, 0x04]).copy(packetContent);

  // NPS_USERID - User ID - persona id - long
  Buffer.from([0x00, 0x00, 0x00, 0x02]).copy(packetContent, 2);

  // User name (32)
  const name = Buffer.alloc(32);
  Buffer.from('Doctor Brown', 'utf8').copy(name);
  name.copy(packetContent, 6);

  // UserData - User controllable data (64)
  Buffer.alloc(64).copy(packetContent, 38);

  // Build the packet
  const packetResult = packet.buildPacket(4, 0x0120, packetContent);

  return packetResult;
}

/**
 * Takes an encrypted command packet and returns the decrypted bytes
 * @param {Connection} con
 * @param {Buffer} cypherCmd
 */
function decryptCmd(con, cypherCmd) {
  const s = con;
  const decryptedCommand = s.decipherBufferDES(cypherCmd);
  s.decryptedCmd = decryptedCommand;
  logger.warn(`[lobby] Enciphered Cmd: ${cypherCmd.toString('hex')}`);
  logger.warn(`[lobby] Deciphered Cmd: ${s.decryptedCmd.toString('hex')}`);
  return s;
}

/**
 * Takes an plaintext command packet and return the encrypted bytes
 * @param {Connection} con
 * @param {Buffer} cypherCmd
 */
function encryptCmd(con, cypherCmd) {
  const s = con;
  s.encryptedCommand = s.cipherBufferDES(cypherCmd);
  return s;
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

/**
 * Takes a plaintext command packet, encrypts it, and sends it across the connection's socket
 * @param {Connection} con
 * @param {Buffer} data
 */
async function sendCommand(con, data) {
  const { id } = con;
  const keys = await fetchSessionKeyByConnectionId(id);
  logger.debug(keys);
  const s = con;

  // Create the cypher and decipher only if not already set
  if (!s.encLobby.decipher) {
    s.setEncryptionKeyDES(keys.s_key);
  }

  decryptCmd(s, Buffer.from(data.slice(4)));

  // Create the packet content
  const packetContent = crypto.randomBytes(375);

  // Add the response code
  packetContent.writeUInt16BE(0x0219, 367);
  packetContent.writeUInt16BE(0x0101, 369);
  packetContent.writeUInt16BE(0x022c, 371);

  // Build the packet
  const packetResult = packet.buildPacket(32, 0x0229, packetContent);

  const cmdEncrypted = encryptCmd(s, packetResult);

  cmdEncrypted.encryptedCommand = Buffer.concat([
    Buffer.from([0x11, 0x01]),
    cmdEncrypted.encryptedCommand,
  ]);

  return cmdEncrypted;
}
module.exports = { npsRequestGameConnectServer, sendCommand };
