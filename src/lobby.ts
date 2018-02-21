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

import crypto = require("crypto");
import { logger } from "./logger";
import * as packet from "./packet";

import { Socket } from "net";
import * as database from "../lib/database/";
import { Connection } from "./Connection";
import { IRawPacket } from "./listenerThread";

/**
 * Handle a request to connect to a game server packet
 * @param {Socket} socket
 * @param {Buffer} rawData
 */
export async function npsRequestGameConnectServer(socket: Socket, rawData: Buffer) {
  logger.info("*** npsRequestGameConnectServer ****");
  logger.debug("Packet as hex: ", rawData.toString("hex"));
  logger.info("************************************");

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
  Buffer.from("Doctor Brown", "utf8").copy(name);
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
function decryptCmd(con: Connection, cypherCmd: Buffer) {
  const s = con;
  const decryptedCommand = s.decipherBuffer(cypherCmd);
  s.decryptedCmd = decryptedCommand;
  logger.warn(`Enciphered Cmd: ${cypherCmd.toString("hex")}`);
  logger.warn(`Deciphered Cmd: ${s.decryptedCmd.toString("hex")}`);
  return s;
}

/**
 * Takes an plaintext command packet and return the encrypted bytes
 * @param {Connection} con
 * @param {Buffer} cypherCmd
 */
function encryptCmd(con: Connection, cypherCmd: Buffer) {
  const s = con;
  s.encryptedCommand = s.cipherBuffer(cypherCmd);
  return s;
}

/**
 * Takes a plaintext command packet, encrypts it, and sends it across the connection's socket
 * @param {Connection} con
 * @param {Buffer} data
 */
export async function sendCommand(con: Connection, data: Buffer) {
  const { id } = con;
  const keys = await database.fetchSessionKeyByConnectionId(id);
  const s = con;

  // Create the cypher and decipher only if not already set
  const key = Buffer.from(keys.s_key, "hex");
  if (!s.encLobby.cipher && !s.encLobby.decipher) {
    const desIV = Buffer.alloc(8);
    s.encLobby.cipher = crypto
      .createCipheriv("des-cbc", key, desIV);
    s.encLobby.cipher
      .setAutoPadding(false);
    s.encLobby.decipher = crypto
      .createDecipheriv("des-cbc", key, desIV);
    s.encLobby.decipher
      .setAutoPadding(false);
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
