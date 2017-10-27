/* Internal dependencies */
const readline = require('readline')
const net = require('net')
const async = require('async')
const logger = require('./logger.js')
const patchServer = require('../lib/WebServer/index.js')
const loginServer = require('../lib/LoginServer/index.js')()
const personaServer = require('../lib/PersonaServer/index.js')()
const listener = require('./nps_listeners.js')

const db = require('../lib/database/index.js')

function MCServer() {
    if (!(this instanceof MCServer)) {
        return new MCServer()
    }
}

/**
Need to open create listeners on the ports

When a connection opens, cass it to a session controller that will log the
connection and fork to a connection handlers
**/

MCServer.prototype.startServers = function startServers(callback) {
    logger.info('Starting the listening sockets...')
    const tcpPortList = [
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

    async.waterfall(
        [
            patchServer.start,
            loginServer.start,
            personaServer.start,
            function(callback) {
                // arg1 now equals 'one' and arg2 now equals 'two'
                tcpPortList.map(port => {
                    net
                        .createServer(socket => {
                            listener.listener(socket)
                        })
                        .listen(port, '0.0.0.0', () => {
                            logger.debug(
                                `Started TCP listener on TCP port: ${port}`
                            )
                        })
                })
                callback(null)
            }
        ],
        function(err) {
            if (err) {
                throw err
            }
            // result now equals 'done'
            logger.info('Listening sockets create successfully.')
            callback(null)
        }
    )
}

function fetchSessionKey(customerId, callback) {
    db.query(
        `SELECT session_key FROM sessions WHERE customer_id = ${customerId}`,
        (err, res) => {
            if (err) {
                // Unknown error
                console.error(
                    `DATABASE ERROR: Unable to retrieve sessionKey: ${err.message}`
                )
                callback(err)
            } else {
                callback(null, res)
            }
        }
    )
}

function handleCLICommand(command) {
    if (command.indexOf('session_key ') == 0) {
        // session_key <customerID>
        const customerId = parseInt(command.split(' ')[1])
        fetchSessionKey(customerId, (err, res) => {
            if (err) {
                throw err
            }
            if (res.rows[0] == undefined) {
                console.log(
                    'Unable to locate session key for customerID:',
                    customerId
                )
            } else {
                console.log(
                    `The sesssionKey for customerId ${customerId} is ${res
                        .rows[0].session_key}`
                )
            }
        })
    } else {
        console.log('Got it! Your answer was: "', command, '"')
    }
}

MCServer.prototype.startCLI = function startCLI(callback) {
    logger.info('Starting the command line interface...')

    // Create the command interface
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    // command processing loop
    var recursiveAsyncReadLine = function() {
        rl.question('', function(command) {
            if (command == 'exit') {
                //we need some base case, for recursion
                rl.close()
                return process.exit() //closing RL and returning from function.
            }
            // TODO: Do something with the command
            handleCLICommand(command)
            recursiveAsyncReadLine() //Calling this function again to ask new question
        })
    }

    // Start the CLI interface
    recursiveAsyncReadLine()
    logger.info('Command line interface started successfully.')
    callback(null)
}

MCServer.prototype.run = function run() {
    // Connect to database
    db.query('SELECT NOW()', err => {
        if (err) {
            if (err.message.indexOf(' connect ECONNREFUSED') >= 0) {
                // Database not reachable
                console.error(
                    'DATABASE ERROR: Unable to connect to Database: ',
                    err.message
                )
            } else {
                // Unknown error
                console.error(`Error connecting to database: ${err.message}`)
            }
            // Database error, exit
            process.exit(0)
        } else {
            // Start the server listeners
            async.waterfall([this.startServers, this.startCLI])
        }
    })
}

module.exports = { MCServer }
