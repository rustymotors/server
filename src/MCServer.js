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


const readline = require('readline');
const waterfall = require('async/waterfall');
const logger = require('./logger.js');
const patchServer = require('../lib/WebServer/index.js');
const database = require('../lib/database/index.js');
const { startTCPListener } = require('./listenerThread.js');
const connectionMgr = require('./connectionMgr.js');

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
  waterfall(
    [
      patchServer.start,
      (cb) => {
        /**
         * Start all the TCP port listeners
         */
        tcpPortList.map(port => startTCPListener(port, connectionMgr, callback));
        cb(null);
      },
    ],
    (err) => {
      if (err) {
        logger.error(err.message);
        logger.error(err.stack);
        process.exit(1);
      }
      // result now equals 'done'
      logger.info('Listening sockets create successfully.');
      callback(null);
    },
  );
}

function startCLI() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.on('line', (input) => {
    const loweredInput = input.toLowerCase();
    console.log(`Received: ${loweredInput}`);
    if (loweredInput === 'dumpconnections') {
      console.log(connectionMgr.dumpConnections());
    }
    if (loweredInput === 'exit') {
      console.log('Goodbye!');
      process.exit();
    }
  });
}

function run() {
  // Connect to database
  // Start the server listeners
  waterfall([database.createDB, startServers, startCLI]);
}

module.exports = { run };
