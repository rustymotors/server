const handler = require('./nps_handlers.js')
const logger = require('./logger.js')
const TCPManager = require('./TCPManager.js').TCPManager()

function lobbyListener(socket) {
    socket.localId = `${socket.localAddress}_${socket.localPort}`
    socket.socketId = `${socket.remoteAddress}_${socket.remotePort}`
    logger.info(
        `Creating lobby socket: ${socket.localId} => ${socket.socketId}`
    )

    // Add a 'data' event handler to this instance of socket
    socket.on('data', data => {
        handler.lobbyDataHandler(socket, data)
    })
    socket.on('error', err => {
        if (err.code !== 'ECONNRESET') {
            throw err
        }
    })
    socket.on('close', () => {
        logger.info(
            `Closing lobby socket: ${socket.localId} => ${socket.socketId}`
        )
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

function listener(socket) {
    // Is this a login connection?
    if (socket.localPort == 8226) {
        logger.debug('New Login Connection...')

        // Add a 'data' event handler to this instance of socket
        socket.on('data', data => {
            handler.loginDataHandler(socket, data)
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
    lobbyListener,
    databaseListener,
    listener
}
