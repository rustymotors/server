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
import * as fs from "fs";
import { Socket } from "net";
import { config } from "../../config/config";
import { IConfigurationFile } from "../../config/config";
import { logger } from "../../src/logger";

/**
 * Load the RSA private key and return a NodeRSA object
 * @returns {NodeRSA}
 */
function fetchPrivateKeyFromFile(privateKeyPath: string) {
  try {
    fs.statSync(privateKeyPath);
  } catch (e) {
    logger.error(`[npsUserStatus] Error loading private key: ${e}`);
    process.exit(1);
  }
  return fs.readFileSync(privateKeyPath).toString();
}

/**
 * Structure the raw packet into a login packet structure
 * @param {Socket} socket
 * @param {Buffer} packet
 * @returns {LoginPacket}
 */

export class NPSUserStatus {
  public opCode: number;
  public contextId: string;
  public sessionKey: string;
  private buffer: Buffer;

  constructor(socket: Socket, packet: Buffer) {
    // Save the NPS opCode
    this.opCode = packet.readInt16LE(0);

    // Save the contextId
    this.contextId = packet.slice(14, 48).toString();

    // Save the raw packet
    this.buffer = packet;

    // Save the sessionKey
    this.sessionKey = this.extractSessionKeyFromPacket(
      config.serverConfig,
      packet
    );
    return this;
  }

  /**
   * extractSessionKeyFromPacket
   *
   * Take 128 bytes
   * They are the utf-8 of the hex bytes that are the key
   */
  public extractSessionKeyFromPacket(
    serverConfig: IConfigurationFile["serverConfig"],
    packet: Buffer
  ) {
    // Decrypt the sessionKey
    const privateKey = fetchPrivateKeyFromFile(serverConfig.privateKeyFilename);

    const sessionKeyStr = Buffer.from(
      packet.slice(52, -10).toString("utf8"),
      "hex"
    );
    logger.debug(
      `[npsUserStatus] Encrypted Session Key String: ${sessionKeyStr.toString(
        "hex"
      )}`
    );
    const decrypted = crypto.privateDecrypt(privateKey, sessionKeyStr);
    logger.debug(`[npsUserStatus] Unsliced key: ${decrypted.toString("hex")}`);
    const sessionKey = decrypted.slice(2, -4).toString("hex");

    return sessionKey;
  }
}
