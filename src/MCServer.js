/* Internal dependencies */
const readline = require('readline')
const net = require('net')
const logger = require('./logger.js')
const patchServer = require('../lib/WebServer/index.js')
const loginServer = require('../lib/LoginServer/index.js')()
const personaServer = require('../lib/PersonaServer/index.js')()
const listener = require('./nps_listeners.js')

function MCServer() {
    if (!(this instanceof MCServer)) {
        return new MCServer()
    }

    this.tcpPortList = [
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
        9014
    ]
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
    })

    patchServer.start()

    loginServer.start()

    personaServer.start()

    this.tcpPortList.map(port => {
        net
            .createServer(socket => {
                listener.listener(socket)
            })
            .listen(port, '0.0.0.0', () => {
                logger.info(`Started TCP listener on TCP port: ${port}`)
            })
    })

    // const server = nps.start(err => {
    //   if (err) {
    //     throw err;
    //   }
    //   logger.info("TCP Servers started");
    // });

    // Start the command interface

    var recursiveAsyncReadLine = function() {
        rl.question('', function(command) {
            if (command == 'exit') {
                //we need some base case, for recursion
                rl.close()
                return process.exit() //closing RL and returning from function.
            }
            // TODO: Do something with the command
            console.log('Got it! Your answer was: "', command, '"')
            recursiveAsyncReadLine() //Calling this function again to ask new question
        })
    }

    recursiveAsyncReadLine()
}

module.exports = { MCServer }
