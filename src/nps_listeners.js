const crypto = require('crypto')
const handler = require('./nps_handlers.js')
const logger = require('./logger.js')
const packet = require('./packet.js')
const util = require('./nps_utils.js')

function sendPacketOkToLogin(session) {
  const packetcontent = crypto.randomBytes(151)

  // This is needed, not sure for what
  Buffer.from([0x01, 0x01]).copy(packetcontent)

  const packetresult = packet.buildPacket(4, 0x0230, packetcontent)
  util.dumpResponse(packetresult, 8)
  return session.lobbySocket.write(packetresult)
}

function loginListener(session) {
  const s = session.loginSocket
  s.localId = `${s.localAddress}_${s.localPort}`
  s.socketId = `${s.remoteAddress}_${s.remotePort}`
  logger.info(`Creating login socket: ${s.localId} => ${s.socketId}`)

  // Add a 'data' event handler to this instance of socket
  s.on('data', (data) => {
    handler.loginDataHandler(session, data)
  })
  s.on('error', (err) => {
    if (err.code !== 'ECONNRESET') {
      throw err
    }
  })
}

function personaListener(session) {
  const s = session.personaSocket
  s.localId = `${s.localAddress}_${s.localPort}`
  s.socketId = `${s.remoteAddress}_${s.remotePort}`
  logger.info(`Creating persona socket: ${s.localId} => ${s.socketId}`)

  // Add a 'data' event handler to this instance of socket
  s.on('data', (data) => {
    handler.personaDataHandler(session, data)
  })
  s.on('error', (err) => {
    if (err.code !== 'ECONNRESET') {
      throw err
    }
  })
}

function lobbyListener(session) {
  const sess = session
  const s = session.lobbySocket
  s.localId = `${s.localAddress}_${s.localPort}`
  s.socketId = `${s.remoteAddress}_${s.remotePort}`
  logger.info(`Creating lobby socket: ${s.localId} => ${s.socketId}`)

  if (!session.loggedIntoLobby && sendPacketOkToLogin(session)) {
    sess.loggedIntoLobby = true
  }

  // Add a 'data' event handler to this instance of socket
  s.on('data', (data) => {
    handler.lobbyDataHandler(sess, data)
  })
  s.on('error', (err) => {
    if (err.code !== 'ECONNRESET') {
      throw err
    }
  })
}

function databaseListener(session) {
  const s = session.databaseSocket
  s.localId = `${s.localAddress}_${s.localPort}`
  s.socketId = `${s.remoteAddress}_${s.remotePort}`
  logger.info(`Creating database socket: ${s.localId} => ${s.socketId}`)

  // Add a 'data' event handler to this instance of socket
  s.on('data', (data) => {
    handler.databaseDataHandler(session, data)
  })
  s.on('error', (err) => {
    if (err.code !== 'ECONNRESET') {
      throw err
    }
  })
}

module.exports = {
  loginListener,
  personaListener,
  lobbyListener,
  databaseListener,
}
