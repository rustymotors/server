/* Internal dependencies */
const readline = require("readline");
const net = require("net");
const logger = require("./logger.js");
const http = require("./http.js");
const listener = require("./nps_listeners.js");
const TCPManager = require("./TCPManager.js");

function MCServer() {
  if (!(this instanceof MCServer)) {
    return new MCServer();
  }

  this.tcpPortList = [
    7003,
    8226,
    8227,
    8228,
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
    9014
  ];
}

/**
Need to open create listeners on the ports

When a connection opens, cass it to a session controller that will log the
connection and fork to a connection handlers
**/

MCServer.prototype.run = function run() {
  // Create the command interface
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  /* Start the NPS servers */
  http.start(err => {
    if (err) {
      throw err;
    }
    logger.info("HTTP Servers started");
  });

  this.tcpPortList.map(port => {
    net
      .createServer(socket => {
        listener.listener(socket);
      })
      .listen(port, "0.0.0.0", () => {
        logger.info(`Started TCP listener on TCP port: ${port}`);
      });
  });

  // const server = nps.start(err => {
  //   if (err) {
  //     throw err;
  //   }
  //   logger.info("TCP Servers started");
  // });

  // Start the command interface

  var recursiveAsyncReadLine = function() {
    rl.question("", function(command) {
      if (command == "exit") {
        //we need some base case, for recursion
        rl.close();
        return process.exit(); //closing RL and returning from function.
      }
      // TODO: Do something with the command
      console.log('Got it! Your answer was: "', command, '"');
      recursiveAsyncReadLine(); //Calling this function again to ask new question
    });
  };

  recursiveAsyncReadLine();
};

module.exports = { MCServer };
