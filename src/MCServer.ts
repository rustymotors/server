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

import ConnectionMgr from "./connectionMgr";
import { IServerConfiguration } from "./IServerConfiguration";
import { startTCPListener } from "./listenerThread";
import { logger } from "./logger";

const connectionMgr = new ConnectionMgr();

export class MCServer {
  /**
   * Start the HTTP, HTTPS and TCP connection listeners
   * @param {Function} callback
   */

  public async startServers(config: IServerConfiguration) {
    logger.info("Starting the listening sockets...");
    const tcpPortList = [
      6660,
      8228,
      8226,
      7003,
      8227,
      43200,
      43300,
      43400,
      53303,
      9000,
      9001,
      9002,
      9003,
      9004,
      9005,
      9006,
      9007,
      9008,
      9009,
      9010,
      9011,
      9012,
      9013,
      9014,
    ];

    await tcpPortList.map(port =>
      startTCPListener(port, connectionMgr, config)
    );
    logger.info("Listening sockets create successfully.");
  }
}
