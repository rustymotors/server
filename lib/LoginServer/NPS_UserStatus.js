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

const fs = require("fs");
const NodeRSA = require("node-rsa");
const logger = require("../../src/logger.js");
const configurationFile = require("../../config/config.json");

/**
 * Load the RSA private key and return a NodeRSA object
 * @returns {NodeRSA}
 */
function initCrypto() {
  const config = configurationFile.serverConfig;
  try {
    fs.statSync(config.privateKeyFilename);
  } catch (e) {
    logger.error(`Error loading private key: ${e}`);
    process.exit(1);
  }
  return new NodeRSA(fs.readFileSync(config.privateKeyFilename));
}

/**
 * Structure the raw packet into a login packet structure
 * @param {Socket} socket 
 * @param {Buffer} packet 
 * @returns {LoginPacket}
 */
function NPS_UserStatus(socket, packet) {
  // logger.debug("Full Packet: ", packet.toString("hex"));

  if (!(this instanceof NPS_UserStatus)) {
    return new NPS_UserStatus(socket, packet);
  }

  // Save the NPS opCode
  this.opCode = packet.readInt16LE();

  // Save the contextId
  this.contextId = packet.slice(14, 48).toString();

  // Save the raw packet
  this.buffer = packet;

  // Decrypt the sessionKey
  const decrypt = initCrypto();

  this.sessionKeyStr = Buffer.from(
    packet.slice(52, -10).toString("utf8"),
    "hex"
  );
  // logger.warn(
  //   `Session Key before decryption: ${this.sessionKeyStr.toString("hex")}`
  // );
  const decrypted = decrypt.decrypt(
    this.sessionKeyStr.toString("base64"),
    "base64"
  );
  const sessionKey = Buffer.from(
    Buffer.from(decrypted, "base64")
      .toString("hex")
      .substring(4, 68),
    "hex"
  );

  // Save the sessionKey
  this.sessionKey = sessionKey;
}

module.exports = NPS_UserStatus;
