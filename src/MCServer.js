/* Internal dependencies */
const readline = require("readline");
const logger = require("./logger.js");
const http = require("./http.js");
const nps = require("./nps.js");
const TCPManager = require("./TCPManager.js");

function MCServer() {
  if (!(this instanceof MCServer)) {
    return new MCServer();
  }
}

// returning true means fatal error; thread should exit
// bool ProcessInput( MessageNode* node, ConnectionInfo * info)
MCServer.prototype.start = function ProcessInput(node, info) {
  let preDecryptMsgNo = Buffer.from([0xff, 0xff, 0xff, 0xff]);
};

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

  nps.start(err => {
    if (err) {
      throw err;
    }
    logger.info("TCP Servers started");
  });

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

module.exports = MCServer;
