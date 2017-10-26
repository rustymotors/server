const handler = require('./nps_handlers.js')
const logger = require('./logger.js')
const TCPManager = require('./TCPManager.js').TCPManager()

function loginListener(session) {
    const s = session.loginSocket
    s.localId = `${s.localAddress}_${s.localPort}`
    s.socketId = `${s.remoteAddress}_${s.remotePort}`
    logger.info(`Creating login socket: ${s.localId} => ${s.socketId}`)

    // Add a 'data' event handler to this instance of socket
    s.on('data', data => {
        handler.loginDataHandler(session, data)
    })
    s.on('error', err => {
        if (err.code !== 'ECONNRESET') {
            throw err
        }
    })
    s.on('close', () => {
        logger.info(`Closing login socket: ${s.localId} => ${s.socketId}`)
    })
}

function lobbyListener(session) {
    const sess = session
    const s = session.lobbySocket
    s.localId = `${s.localAddress}_${s.localPort}`
    s.socketId = `${s.remoteAddress}_${s.remotePort}`
    logger.info(`Creating lobby socket: ${s.localId} => ${s.socketId}`)

    // Add a 'data' event handler to this instance of socket
    s.on('data', data => {
        handler.lobbyDataHandler(sess, data)
    })
    s.on('error', err => {
        if (err.code !== 'ECONNRESET') {
            throw err
        }
    })
    s.on('close', () => {
        logger.info(`Closing lobby socket: ${s.localId} => ${s.socketId}`)
    })
}

function databaseListener(session) {
    const s = session.databaseSocket
    s.localId = `${s.localAddress}_${s.localPort}`
    s.socketId = `${s.remoteAddress}_${s.remotePort}`
    // logger.info(`Creating database socket: ${s.localId} => ${s.socketId}`);

    // Add a 'data' event handler to this instance of socket
    s.on('data', data => {
        handler.databaseDataHandler(session, data)
    })
    s.on('error', err => {
        if (err.code !== 'ECONNRESET') {
            throw err
        }
    })
    s.on('close', () => {
        //logger.info(`Closing database socket: ${s.localId} => ${s.socketId}`);
    })
}

function listener(session, socket) {
    // Is this a login connection?
    if (socket.localPort == 8226) {
        logger.debug('New Login Connection...')

        // Add a 'data' event handler to this instance of socket
        socket.on('data', data => {
            handler.loginDataHandler(session, socket, data)
        })
        socket.on('error', err => {
            if (err.code !== 'ECONNRESET') {
                throw err
            }
        })
        socket.on('close', () => {
            logger.info('Closing Login socket')
        })
    } else {
        const con = TCPManager.getFreeConnection()

        con.sock = socket

        logger.debug('New Connection...')
        logger.debug('ConnectionID: ', con.id)

        // Add a 'data' event handler to this instance of socket
        socket.on('data', data => {
            handler.handler(con, data)
        })
        socket.on('error', err => {
            if (err.code !== 'ECONNRESET') {
                throw err
            }
        })
        socket.on('close', () => {
            logger.info(
                `Closing socket id ${con.id} for port ${con.sock
                    .localPort} from ${con.sock.remoteAddress}`
            )
        })
    }
}

module.exports = {
    loginListener,
    lobbyListener,
    databaseListener,
    listener
}
