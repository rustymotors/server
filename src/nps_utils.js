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

const logger = require("./logger.js");
const packet = require("./packet.js");

function toHex(d) {
  const hexByte = `0${Number(d).toString(16)}`;
  return `${hexByte.slice(-2).toUpperCase()}`;
}

function dumpRequest(socket, rawBuffer) {
  const localId = `${socket.remoteAddress}_${socket.localPort}`;
  const requestCode = `${toHex(rawBuffer[0])}${toHex(rawBuffer[1])}`;
  logger.debug(`
  -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  Request from: ${socket.remoteAddress} on ${socket.localPort}
  Request Code: ${requestCode}
  -----------------------------------------
  Request DATA ${localId}:${rawBuffer.toString("ascii")}
  -----------------------------------------
  Request DATA ${localId}:${rawBuffer.toString("hex")}
  -----------------------------------------
  -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  `);
}

function dumpResponse(data, count) {
  logger.debug(`Response Length: ${data.length}`);
  let responseBytes = "";
  for (let i = 0; i < count && i < data.length; i += 1) {
    responseBytes += ` ${toHex(data[i])}`;
  }
  logger.debug(`Response Bytes: ${responseBytes}\n
    -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\n`);
}

function npsHeartbeat(socket, rawData) {
  dumpRequest(socket, rawData);

  const packetcontent = Buffer.alloc(8);
  const packetresult = packet.buildPacket(8, 0x0127, packetcontent);
  dumpResponse(packetresult, 8);
  return packetresult;
}

module.exports = {
  toHex,
  dumpRequest,
  dumpResponse,
  npsHeartbeat,
};
