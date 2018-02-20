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

import * as crypto from "crypto";
import * as fs from 'fs';
import { Socket } from 'net';
import { config } from "../../config/config";
import { logger } from '../../src/logger';

/**
 * Load the RSA private key and return a NodeRSA object
 * @returns {NodeRSA}
 */
function fetchPrivateKeyFromFile(privateKeyPath: string) {
  try {
    fs.statSync(privateKeyPath);
  } catch (e) {
    logger.error(`Error loading private key: ${e}`);
    process.exit(1);
  }
  return fs.readFileSync(privateKeyPath).toString()
}

/**
 * Structure the raw packet into a login packet structure
 * @param {Socket} socket
 * @param {Buffer} packet
 * @returns {LoginPacket}
 */
export function npsUserStatus(socket: Socket, packet: Buffer) {
  // logger.debug("Full Packet: ", packet.toString("hex"));

  // Save the NPS opCode
  this.opCode = packet.readInt16LE(0);

  // Save the contextId
  this.contextId = packet.slice(14, 48).toString();

  // Save the raw packet
  this.buffer = packet;

  // Decrypt the sessionKey
  const privateKey = fetchPrivateKeyFromFile(config.serverConfig.privateKeyFilename)

  this.sessionKeyStr = Buffer.from(
    packet.slice(52, -10).toString('utf8'),
    'hex',
  );
  // logger.warn(
  //   `Session Key before decryption: ${this.sessionKeyStr.toString("hex")}`
  // );
  const decrypted = crypto.privateDecrypt(privateKey, 
    this.sessionKeyStr.toString('base64'));
  const sessionKey = Buffer.from(
    Buffer.from(decrypted.toString(), 'base64')
      .toString('hex')
      .substring(4, 68),
    'hex',
  );

  console.log(sessionKey)

  // Save the sessionKey
  this.sessionKey = sessionKey;
  return this;
}
