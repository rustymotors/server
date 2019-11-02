// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as crypto from "crypto";
import * as fs from "fs";

import { NPSMsg } from "../MCOTS/NPSMsg";
import { Logger } from "../../shared/loggerManager";
import { IServerConfiguration } from "../../shared/configManager";

/**
 * Load the RSA private key and return a NodeRSA object
 * @returns {NodeRSA}
 */
function fetchPrivateKeyFromFile(privateKeyPath: string) {
  try {
    fs.statSync(privateKeyPath);
  } catch (e) {
    throw new Error(`[npsUserStatus] Error loading private key: ${e}`);
  }
  return fs.readFileSync(privateKeyPath).toString();
}

/**
 * Structure the raw packet into a login packet structure
 * @param {Socket} socket
 * @param {Buffer} packet
 * @returns {LoginPacket}
 */

export class NPSUserStatus extends NPSMsg {
  public logger = new Logger().getLogger("NPSUserStatus");
  public opCode: number;
  public contextId: string;
  public buffer: Buffer;
  public sessionKey: string = "";

  constructor(packet: Buffer) {
    super("Recieved");
    // Save the NPS opCode
    this.opCode = packet.readInt16LE(0);

    // Save the contextId
    this.contextId = packet.slice(14, 48).toString();

    // Save the raw packet
    this.buffer = packet;

    return this;
  }

  /**
   * extractSessionKeyFromPacket
   *
   * Take 128 bytes
   * They are the utf-8 of the hex bytes that are the key
   */
  public extractSessionKeyFromPacket(
    serverConfig: IServerConfiguration["serverConfig"],
    packet: Buffer
  ) {
    // Decrypt the sessionKey
    const privateKey = fetchPrivateKeyFromFile(serverConfig.privateKeyFilename);

    const sessionKeyStr = Buffer.from(
      packet.slice(52, -10).toString("utf8"),
      "hex"
    );
    const decrypted = crypto.privateDecrypt(privateKey, sessionKeyStr);
    this.sessionKey = decrypted.slice(2, -4).toString("hex");
  }

  public toJSON() {
    return {
      msgNo: this.msgNo.toString(16),
      msgLength: this.msgLength,
      msgVersion: this.msgVersion,
      content: this.content.toString("hex"),
      direction: this.direction,
      opCode: this.opCode,
      contextId: this.contextId,
      sessionKey: this.sessionKey,
      rawBuffer: this.buffer.toString("hex"),
    };
  }

  public dumpPacket() {
    this.dumpPacketHeader("NPSUserStatus");
    this.logger.debug(
      {
        contextId: this.contextId,
        sessionKey: this.sessionKey,
      },
      "NPSUserStatus"
    );
  }
}
