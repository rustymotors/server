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

import * as readline from "readline";
import { config, IConfigurationFile } from "../config/config";
import * as database from "../lib/database";
import ConnectionMgr from "./connectionMgr";
import startTCPListener from "./listenerThread";
import { logger } from "./logger";
import { patchServer } from "./WebServer/patchServer";
import { webServer } from "./WebServer/webServer";

export const connectionMgr = new ConnectionMgr();

/**
 * Start the HTTP, HTTPS and TCP connection listeners
 * @param {Function} callback
 */

async function startServers(configurationFile: IConfigurationFile) {
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

  await webServer.start(config);
  await patchServer.start(config)

  await tcpPortList.map((port: number) =>
    startTCPListener(port, connectionMgr)
  );
  logger.info("Listening sockets create successfully.");
}

function handleCLICommand(cmd: string, args: string[]) {
  const loweredCmd = cmd.toLowerCase();
  console.log(`Received: ${loweredCmd}`);
  if (loweredCmd === "findconnection") {
    console.log(connectionMgr.findConnectionById(Number.parseInt(args[0])));
  }

  if (loweredCmd === "findconnectionbyip") {
    console.log(
      connectionMgr.findConnectionByAddressAndPort(
        args[0],
        Number.parseInt(args[1])
      )
    );
  }

  if (loweredCmd === "dumpconnections") {
    console.log(connectionMgr.dumpConnections());
  }
  if (loweredCmd === "exit") {
    console.log("Goodbye!");
    process.exit();
  }
}

function startCLI() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.on("line", input => {
    const args = input.split(" ");
    const cmd = args.shift();
    handleCLICommand(cmd, args);
  });
}

export function run(configurationFile: IConfigurationFile) {
  // Connect to database
  // Start the server listeners
  startServers(configurationFile)
    .then(database.createDB)
    .then(startCLI)
    .then(() => console.log("All good"))
    .catch(err => {
      throw err;
    });
}
