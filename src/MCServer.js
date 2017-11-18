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

const readline = require("readline");
const net = require("net");
const fs = require("fs");
const async = require("async");
const logger = require("./logger.js");
const patchServer = require("../lib/WebServer/index.js");
const TCPManager = require("./TCPManager.js");

const database = require("../lib/database/index.js");

const { startTCPListener } = require("./listenerThread.js");

const connectionMgr = require("./connectionMgr.js");

/**
  Need to open create listeners on the ports
  
  When a connection opens, cass it to a session controller that will log the
  connection and fork to a connection handlers
  **/
function startServers(callback) {
  logger.info("Starting the listening sockets...");
  const tcpPortList = [
    8228,
    8226,
    7003,
    8227,
    43300,
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
      function(callback) {
        /**
         * Start all the TCP port listeners
         */
        tcpPortList.map(port => {
          startTCPListener(port, connectionMgr, callback);
        });
        callback(null);
      },
    ],
    err => {
      if (err) {
        console.error(err.message);
        console.error(err.stack);
        process.exit(1);
      }
      // result now equals 'done'
      logger.info("Listening sockets create successfully.");
      callback(null);
    }
  );
}

function startCLI(callback) {
  logger.info("Starting the command line interface...");
  // Create the command interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  // command processing loop
  var recursiveAsyncReadLine = function() {
    rl.question("", command => {
      if (command == "exit") {
        // we need some base case, for recursion
        rl.close();
        return process.exit(); // closing RL and returning from function.
      }
      // TODO: Do something with the command
      handleCLICommand(command);
      recursiveAsyncReadLine(); // Calling this function again to ask new question
    });
  };
  // Start the CLI interface
  recursiveAsyncReadLine();
  logger.info("Command line interface started successfully.");
  callback(null);
}

function run() {
  // Connect to database
  // Start the server listeners
  async.waterfall([database.createDB, startServers, startCLI]);
}

/**
 * Fetch the sessionkey from the database by customerid
 * @param {string} customerId 
 * @param {callback} callback 
 */
function fetchSessionKey(customerId, callback) {
  database.db.serialize(function() {
    database.db.get(
      "SELECT session_key FROM sessions WHERE customer_id = $1",
      [customerId],
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

function handleCLICommand(command) {
  if (command.indexOf("session_key ") == 0) {
    // session_key <customerID>
    const customerId = parseInt(command.split(" ")[1]);
    fetchSessionKey(customerId, (err, res) => {
      if (err) {
        console.error(err.message);
        console.error(err.stack);
        process.exit(1);
      }
      if (res == undefined) {
        console.log("Unable to locate session key for customerID:", customerId);
      } else {
        console.log(
          `The sesssionKey for customerId ${customerId} is ${res.session_key}`
        );
      }
    });
  } else if (command.indexOf("dumpConnections") == 0) {
    // dumpConnections
    console.dir(connectionMgr.dumpConnections());
  } else if (command.indexOf("findConnection ") == 0) {
    // findConnection {connectionID}
    const connectionId = command.split(" ")[1];
    console.dir(connectionMgr.findConnection(connectionId));
  } else {
    console.log('Got it! Your answer was: "', command, '"');
  }
}

module.exports = { run };
