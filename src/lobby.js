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

const crypto = require("crypto");
const logger = require("./logger.js");
const packet = require("./packet.js");
const util = require("./nps_utils.js");
const MsgPack = require("./MsgPack.js");

const database = require("../lib/database/index.js");

function npsRequestGameConnectServer(socket, rawData) {
  // Load the recieved data into a MsgPack class
  const msgPack = MsgPack(rawData);

  // Return a _NPS_UserInfo structure - 40
  const packetcontent = Buffer.alloc(38);

  // MsgLen
  Buffer.from([0x00, 0x04]).copy(packetcontent);

  // NPS_USERID - User ID - persona id - long
  Buffer.from([0x00, 0x00, 0x00, 0x02]).copy(packetcontent, 2);

  // User name (32)
  const name = Buffer.alloc(32);
  Buffer.from("Doctor Brown", "utf8").copy(name);
  name.copy(packetcontent, 6);

  // UserData - User controllable data (64)
  Buffer.alloc(64).copy(packetcontent, 38);

  // Build the packet
  const packetresult = packet.buildPacket(4, 0x0120, packetcontent);

  return packetresult;
}

function fetchSessionKeyByRemoteAddress(remoteAddress, callback) {
  database.db.serialize(function() {
    database.db.get(
      "SELECT session_key, s_key FROM sessions WHERE remote_address = $1",
      [remoteAddress],
      (err, res) => {
        if (err) {
          // Unknown error
          console.error(
            `DATABASE ERROR: Unable to retrieve sessionKey: ${err.message}`
          );
          callback(err);
        } else {
          callback(null, res);
        }
      }
    );
  });
}

function decryptCmd(session, cypherCmd) {
  const s = session;
  const decryptedCommand = s.decypher.update(cypherCmd);
  s.decryptedCmd = decryptedCommand;
  return s;
}

function encryptCmd(session, cypherCmd) {
  const s = session;
  s.encryptedCommand = s.cypher.update(cypherCmd);
  return s;
}

function sendCommand(con, data) {
  fetchSessionKeyByRemoteAddress(con.sock.remoteAddress, (err, res) => {
    if (err) {
      throw err;
    }

    let s = con;

    // Create the cypher and decyper only if not already set
    if (!s.cypher & !s.decypher) {
      const desIV = Buffer.alloc(8);
      s.cypher = crypto
        .createCipheriv("des-cbc", Buffer.from(res.s_key, "hex"), desIV)
        .setAutoPadding(false);
      s.decypher = crypto
        .createDecipheriv("des-cbc", Buffer.from(res.s_key, "hex"), desIV)
        .setAutoPadding(false);
    }

    const cmd = decryptCmd(s, new Buffer(data.slice(4)));

    // Create the packet content
    const packetcontent = crypto.randomBytes(375);

    // Add the response code
    packetcontent.writeUInt16BE(0x0219, 367);
    packetcontent.writeUInt16BE(0x0101, 369);
    packetcontent.writeUInt16BE(0x022c, 371);

    // Build the packet
    const packetresult = packet.buildPacket(32, 0x0229, packetcontent);

    const cmdEncrypted = encryptCmd(s, packetresult);

    cmdEncrypted.encryptedCommand = Buffer.concat([
      Buffer.from([0x11, 0x01]),
      cmdEncrypted.encryptedCommand,
    ]);

    con.sock.write(cmdEncrypted.encryptedCommand);
    return con;
  });
}

module.exports = {
  npsRequestGameConnectServer,
  sendCommand,
};
