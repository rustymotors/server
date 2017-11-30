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
const { sendPacketOkLogin } = require("./TCPManager.js");

/**
 * Given a port and a connection manager object, create a new TCP socket listener for that port
 * @param {Int} listenerPort 
 * @param {connectionMgr} connectionMgr 
 * @param {Function} callback 
 */
function startTCPListener(listenerPort, connectionMgr, callback) {
  const server = net.createServer(socket => {
    const remoteAddress = socket.remoteAddress;
    logger.log(`Client ${remoteAddress} connected to port ${listenerPort}`);
    const con = connectionMgr.findOrNewConnection(
      remoteAddress,
      socket,
      connectionMgr
    );
    if (socket.localPort == 7003 && con.inQueue) {
      sendPacketOkLogin(socket);
      con.inQueue = false;
    }
    socket.on("end", () => {
      connectionMgr.deleteConnection(remoteAddress);
      logger.log(
        `Client ${remoteAddress} disconnected from port ${listenerPort}`
      );
    });
    socket.on("data", data => {
      connectionMgr.processData(listenerPort, remoteAddress, data);
    });
    socket.on("error", err => {
      if (err.code !== "ECONNRESET") {
        logger.error(err.message);
        logger.error(err.stack);
        process.exit(1);
      }
    });
  });
  server.listen(listenerPort, "0.0.0.0", () => {
    logger.log(`Listener started on port ${listenerPort}`);
  });
}

module.exports = { startTCPListener };
