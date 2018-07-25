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
const { processData } = require("./connectionMgr");
const { logger } = require("./logger");
const { sendPacketOkLogin } = require("./TCPManager");

/**
 * Given a port and a connection manager object, create a new TCP socket listener for that port
 * @param {Int} localPort
 * @param {connectionMgr} connectionMgr
 */
async function startTCPListener(
  localPort,
  connectionMgr
) {
  net
    .createServer(socket => {
      // Received a new connection
      // Turn it into a connection object
      const connection = connectionMgr.findOrNewConnection(socket);

      const { remoteAddress } = socket;
      logger.info(
        `[listenerThread] Client ${remoteAddress} connected to port ${localPort}`
      );
      if (socket.localPort === 7003 && connection.inQueue) {
        sendPacketOkLogin(socket);
        connection.inQueue = false;
      }
      socket.on("end", () => {
        connectionMgr.deleteConnection(connection);
        logger.info(
          `[listenerThread] Client ${remoteAddress} disconnected from port ${localPort}`
        );
      });
      socket.on("data", async data => {
        try {
          const rawPacket = {
            connection,
            data,
            localPort,
            remoteAddress,
            timestamp: Date.now(),
          };
          // Dump the raw packet
          logger.debug("rawPacket's data prior to proccessing: ", rawPacket.data.toString("hex"))

          const newConnection = await processData(rawPacket);
          connectionMgr.updateConnectionById(connection.id, newConnection);
        } catch (error) {
          logger.error(error);
          logger.error(error.stack);
          process.exit();
        }
      });
      socket.on("error", (err) => {
        if (err.code !== "ECONNRESET") {
          logger.error(err.message);
          logger.error(err.stack);
          process.exit(1);
        }
      });
    })
    .listen({ port: localPort, host: "0.0.0.0" }, () => {
      logger.info(`[listenerThread] Listener started on port ${localPort}`);
    });
}
module.exports = { startTCPListener }