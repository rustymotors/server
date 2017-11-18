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
 * Start the HTTP, HTTPS and TCP connection listeners
 * @param {Function} callback
 */

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

/**
 * Start the command line interface loop
 * @param {Function} callback 
 */
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
      } else {
        /**
       * Turn the input into an array and extract the command
       */
        const args = command.split(" ");
        const cmd = args.shift();
        handleCLICommand(cmd, args);
      }

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
 * Fetch the session key from the database by customer id
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

/**
 * Lookup a session key by customer id
 * @param {String} customerId 
 */
function cliSessionKey(customerId) {
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
        `The sessionKey for customerId ${customerId} is ${res.session_key}`
      );
    }
  });
}

/**
 * Processes a command and its optional arguments
 * @param {String} cmd 
 * @param {Array} args 
 */
function handleCLICommand(cmd, args) {
  const cliCommands = {
    session_key: function() {
      cliSessionKey(args[0]);
    },
    dumpConnections: function() {
      console.dir(connectionMgr.dumpConnections());
    },
    findConnection: function() {
      console.dir(connectionMgr.findConnection(args[0]));
    },
  };
  if (typeof cliCommands[cmd] != "function" || cliCommands[cmd]()) {
    console.log(`Command ${cmd} not found, please check help`);
  }
}

module.exports = { run };
