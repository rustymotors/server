const lobby = require('./lobby.js')
const logger = require('./logger.js')
const mcots = require('./mcots.js')
const util = require('./nps_utils.js')
const tcpManager = require('./TCPManager.js').TCPManager()

const MessageNode = require('./MessageNode.js')

function getRequestCode(rawBuffer) {
    return `${util.toHex(rawBuffer[0])}${util.toHex(rawBuffer[1])}`
}

function lobbyDataHandler(socket, rawData) {
    const requestCode = getRequestCode(rawData)

    switch (requestCode) {
    // npsRequestGameConnectServer
    case '0100': {
        const packetresult = lobby.npsRequestGameConnectServer(
            socket,
            rawData
        )
        socket.write(packetresult)
        break
    }
    // npsHeartbeat
    case '0217': {
        const packetresult = util.npsHeartbeat(socket, rawData)
        socket.write(packetresult)
        break
    }
    // npsSendCommand
    case '1101': {
        const cmd = lobby.sendCommand(socket, rawData, requestCode)
        socket.write(cmd.encryptedCommand)
        break
    }
    default:
        util.dumpRequest(socket, rawData, requestCode)
        logger.error(
            `Unknown code ${requestCode} was recieved on port 7003`
        )
    }
}

function databaseDataHandler(session, rawData) {
    const messageNode = MessageNode.MessageNode(rawData)
    logger.info(`=============================================
    Recieved packet on port ${session.databaseSocket.localPort} from ${session
    .databaseSocket.remoteAddress}...`)
    logger.debug('Header Length: ', messageNode.header.length)
    logger.debug('Header MCOSIG: ', messageNode.header.mcosig)
    logger.debug('Sequence: ', messageNode.seq)
    logger.debug('Flags: ', messageNode.flags)
    logger.debug('Buffer: ', messageNode.buffer)
    logger.debug('Buffer as string: ', messageNode.buffer.toString('hex'))
    logger.info('=============================================')

    if (messageNode.header.mcosig == 'TOMC') {
        logger.debug('Packet has a valid MCOTS header signature')
    }

    // Check if this is an unencrypted packet
    if (messageNode.flags == 0) {
        const requestCode = Buffer.from([
            messageNode.buffer[0],
            messageNode.buffer[1]
        ]).toString('hex')

        switch (requestCode) {
        case 'b601': {
            const packetresult = mcots.msgClientConnect(session, rawData)
            session.databaseSocket.write(packetresult)
            break
        }
        default:
            //util.dumpRequest(session.databaseSocket, rawData, requestCode);
            logger.error(
                `Unknown packet  ${requestCode} was recieved on port 43300`
            )
            return
        }
    } else if (messageNode.flags == 8) {
        // Packet is encrypted
        const decryptedBuffer = session.enc.decodeBuffer(messageNode.buffer)
        logger.error('Unknown encrypted packet was recieved on port 43300')
        logger.debug('Using sKey: ', session.sKey)
        logger.debug('Attempt at decrypting: ', decryptedBuffer)
    } else {
        // Unknown packet
        logger.error('Unknown packet was recieved on port 43300')
    }

}

function handler(con, rawData) {
    const messageNode = MessageNode.MessageNode(rawData)
    logger.info(`=============================================
    Recieved packet on port ${con.sock.localPort} from ${con.sock
    .remoteAddress}...`)
    logger.debug('Header Length: ', messageNode.header.length)
    logger.debug('Header MCOSIG: ', messageNode.header.mcosig)
    logger.debug('Sequence: ', messageNode.seq)
    logger.debug('Flags: ', messageNode.flags)
    logger.debug('Buffer: ', messageNode.buffer)
    logger.debug('Buffer as text: ', messageNode.buffer.toString('utf8'))
    logger.debug('Buffer as string: ', messageNode.buffer.toString('hex'))
    logger.info('=============================================')

    if (messageNode.header.mcosig == 'TOMC') {
        logger.debug('Packet has a valid MCOTS header signature')
        tcpManager.MessageReceived(messageNode, con)
    } else {
        tcpManager.MessageReceived(messageNode, con)
    }
}

module.exports = {
    lobbyDataHandler,
    databaseDataHandler,
    handler
}
