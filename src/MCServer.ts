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

import * as async from "async";
import * as readline from "readline";
import * as database from "../lib/database/index.js";
import * as patchServer from "../lib/WebServer/index.js";
import ConnectionMgr from "./connectionMgr.js";
import * as startTCPListener from "./listenerThread";
import * as logger from "./logger.js";

const connectionMgr: ConnectionMgr;

/**
 * Start the HTTP, HTTPS and TCP connection listeners
 * @param {Function} callback
 */

function startServers(callback) {
  // logger.info("Starting the listening sockets...");
  const tcpPortList = [
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
  async.waterfall(
    [
      patchServer.start,
      (cb) => {
        /**
         * Start all the TCP port listeners
         */
        tcpPortList.map((port: Number) => startTCPListener(port, connectionMgr, callback));
        cb(null);
      },
    ],
    (err: Error) => {
      if (err) {
        logger.error(err.message);
        logger.error(err.stack);
        process.exit(1);
      }
      // result now equals 'done'
      logger.info("Listening sockets create successfully.");
      callback(null);
    },
  );
}

function handleCLICommand(cmd, args) {
  const loweredCmd = cmd.toLowerCase();
  console.log(`Received: ${loweredCmd}`);
  if (loweredCmd === "findconnection") {
    console.log(connectionMgr.findConnectionById(args[0]));
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
  rl.on("line", (input) => {
    const args = input.split(" ");
    const cmd = args.shift();
    handleCLICommand(cmd, args);
  });
}

function run() {
  // Connect to database
  // Start the server listeners
  database.createDB()
    .then(startServers)
    .then(startCLI)
    .catch((err) => { throw err; });
}

export default { run };
