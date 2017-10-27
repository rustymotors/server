const net = require('net')
const util = require('../../src/nps_utils.js')
const logger = require('../../src/logger.js')
const packet = require('../../src/packet.js')

const LoginPacket = require('./LoginPacket.js')

const db = require('../database/index.js')

function getRequestCode(rawBuffer) {
    return `${util.toHex(rawBuffer[0])}${util.toHex(rawBuffer[1])}`
}

function updateSessionKey(customerId, sessionKey) {
    db.query(
        'INSERT INTO sessions (customer_id, session_key) VALUES ($1, $2) ON CONFLICT (customer_id) DO UPDATE SET session_key = $2',
        [customerId, sessionKey],
        err => {
            if (err) {
                // Unknown error
                console.error(
                    `DATABASE ERROR: Unable to store sessionKey: ${err.message}`
                )
            } else {
                logger.debug(
                    `DATABASE: Updated ${customerId} session with session key ${sessionKey}`
                )
            }
        }
    )
}

function npsGetCustomerIdByContextId(contextId) {
    switch (contextId.toString()) {
    case 'd316cd2dd6bf870893dfbaaf17f965884e':
        return {
            userId: Buffer.from([0x00, 0x00, 0x00, 0x02]),
            customerId: Buffer.from([0x00, 0x00, 0x00, 0x01])
        }
    case '5213dee3a6bcdb133373b2d4f3b9962758':
        return {
            userId: Buffer.from([0x00, 0x00, 0x00, 0x02]),
            customerId: Buffer.from([0xac, 0x01, 0x00, 0x00])
        }
    default:
        logger.error(`Unknown contextId: ${contextId.toString()}`)
        process.exit(1)
        return null
    }
}

function userLogin(socket, data) {
    const loginPacket = LoginPacket(socket, data)

    util.dumpRequest(socket, data)
    const contextId = Buffer.alloc(34)
    data.copy(contextId, 0, 14, 48)
    const customer = npsGetCustomerIdByContextId(contextId)

    // Create the packet content
    // packetcontent = crypto.randomBytes(44971)
    // packetcontent = crypto.randomBytes(516)
    const packetcontent = packet.premadeLogin()

    // This is needed, not sure for what
    Buffer.from([0x01, 0x01]).copy(packetcontent)

    // load the customer id
    customer.customerId.copy(packetcontent, 10)

    // Don't use queue?
    Buffer.from([0x00]).copy(packetcontent, 207)
    // Don't use queue? (debug)
    Buffer.from([0x00]).copy(packetcontent, 463)

    // Set response Code 0x0601 (debug)
    packetcontent[255] = 0x06
    packetcontent[256] = 0x01

    // For debug
    packetcontent[257] = 0x01
    packetcontent[258] = 0x01

    // load the customer id (debug)
    customer.customerId.copy(packetcontent, 267)

    // Build the packet
    const packetresult = packet.buildPacket(556, 0x0601, packetcontent)

    util.dumpResponse(packetresult, packetresult.length)

    logger.debug('Decrypted sessionKey: ', loginPacket.sessionKey)
    updateSessionKey(
        customer.customerId.readInt32BE(),
        loginPacket.sessionKey.toString('hex')
    )

    return packetresult
}

function loginDataHandler(socket, rawData) {
    const requestCode = getRequestCode(rawData)

    switch (requestCode) {
    // npsUserLogin
    case '0501': {
        const responsePacket = userLogin(socket, rawData)

        socket.write(responsePacket)
        break
    }
    default:
        util.dumpRequest(socket, rawData, requestCode)
        logger.error(
            `Unknown code ${requestCode} was recieved on port 8226`
        )
    }
}

function loginListener(socket) {
    socket.localId = `${socket.localAddress}_${socket.localPort}`
    socket.socketId = `${socket.remoteAddress}_${socket.remotePort}`
    logger.info(
        `Creating login socket: ${socket.localId} => ${socket.socketId}`
    )

    // Add a 'data' event handler to this instance of socket
    socket.on('data', data => {
        loginDataHandler(socket, data)
    })
    socket.on('error', err => {
        if (err.code !== 'ECONNRESET') {
            throw err
        }
    })
    socket.on('close', () => {
        logger.info(
            `Closing login socket: ${socket.localId} => ${socket.socketId}`
        )
    })
}

function LoginServer() {
    if (!(this instanceof LoginServer)) {
        return new LoginServer()
    }
}

/**
Need to open create listeners on the ports

When a connection opens, cass it to a session controller that will log the
connection and fork to a connection handlers
**/

LoginServer.prototype.start = function start(callback) {
    net
        .createServer(socket => {
            loginListener(socket)
        })
        .listen('8226', '0.0.0.0', () => {
            logger.info('Started Login listener on TCP port: 8228')
            callback(null)
        })
}

module.exports = LoginServer
