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

const net = require("net");

function startTCPListener(listenerPort, connectionMgr, callback) {
  let remoteAddress;
  let id;

  const server = net.createServer(c => {
    // 'connection' listener
    remoteAddress = c.remoteAddress;
    id = `${remoteAddress}_${listenerPort}`;
    console.log(`Client ${remoteAddress} connected to port ${listenerPort}`);
    connectionMgr.findOrNewConnection(id, c);
    c.on("end", () => {
      connectionMgr.deleteConnection(id);
      console.log(
        `Client ${remoteAddress} disconnected from port ${listenerPort}`
      );
    });
    c.on("data", data => {
      connectionMgr.processData(id, data);
    });
    c.on("error", err => {
      if (err.code !== "ECONNRESET") {
        console.error(err.message);
        console.error(err.stack);
        process.exit(1);
      }
    });
  });
  server.listen(listenerPort, "0.0.0.0", () => {
    console.log(`Listener started on port ${listenerPort}`);
  });
}

module.exports = { startTCPListener };
