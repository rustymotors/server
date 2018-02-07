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

import * as net from 'net';
import sendPacketOkLogin from './TCPManager.js';
const logger = require('./logger.js');
const { processData } = require('./connectionMgr');
import ConnectionMgr from "./connectionMgr";
import { Connection } from "./Connection";

export interface RawPacket {
  timestamp: Number
  remoteAddress: String
  localPort: Number
  connection: Connection
  data: Buffer
}

/**
 * Given a port and a connection manager object, create a new TCP socket listener for that port
 * @param {Int} localPort
 * @param {connectionMgr} connectionMgr
 */
export default async function startTCPListener(localPort: Number, connectionMgr: ConnectionMgr) {
  net.createServer((socket) => {
    // Received a new connection
    // Turn it into a connection object
    const connection = connectionMgr.findOrNewConnection(socket);

    const { remoteAddress } = socket;
    // logger.info(`Client ${remoteAddress} connected to port ${localPort}`);
    if (socket.localPort === 7003 && connection.inQueue) {
      sendPacketOkLogin(socket);
      connection.inQueue = false;
    }
    socket.on('end', () => {
      connectionMgr.deleteConnection(connection);
      // logger.info(`Client ${remoteAddress} disconnected from port ${localPort}`);
    });
    socket.on('data', async (data) => {
      try {
        const rawPacket: RawPacket = {
          timestamp: Date.now(),
          remoteAddress,
          localPort,
          connection,
          data,
        };
        // Dump the raw packet
        const newConnection = await processData(rawPacket);
        connectionMgr.updateConnectionById(remoteAddress, newConnection);
      } catch (error) {
        console.error(error);
        throw error;
      }
    });
    socket.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code !== 'ECONNRESET') {
        logger.error(err.message);
        logger.error(err.stack);
        process.exit(1);
      }
    });
  }).listen({ port: localPort, hostname: '0.0.0.0'}, () => {
    // logger.info(`Listener started on port ${localPort}`);
  });
}
