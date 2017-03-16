const series = require('async/series')
const fs = require('fs')
const crypto = require('crypto')
const net = require('net')

const NodeRSA = require('node-rsa')
const logger = require('./logger.js')
const packet = require('./packet.js')

function initCrypto(config) {
  try {
    fs.statSync(config.privateKeyFilename)
  } catch (e) {
    logger.error(`Error loading private key: ${e}`)
    process.exit(1)
  }
  // privateKey = new NodeRSA(fs.readFileSync(config.privateKeyFilename))
  return new NodeRSA(fs.readFileSync(config.privateKeyFilename))
}

function npsGetCustomerIdByContextId(contextId) {
  switch (contextId.toString()) {
    case 'd316cd2dd6bf870893dfbaaf17f965884e':
      return {
        userId: Buffer.from([0x00, 0x00, 0x00, 0x01]),
        customerId: Buffer.from([0xAB, 0x01, 0x00, 0x00]),
      }
    case '5213dee3a6bcdb133373b2d4f3b9962758':
      return {
        userId: Buffer.from([0x00, 0x00, 0x00, 0x02]),
        customerId: Buffer.from([0xAC, 0x01, 0x00, 0x00]),
      }
    default:
      logger.error(`Unknown contextId: ${contextId.toString()}`)
      process.exit(1)
      return null
  }
}

function npsGetPersonaMapsByCustomerId(customerId) {
  const name = Buffer.alloc(30)
  switch (customerId.readUInt32BE()) {
    case 2868969472:
      Buffer.from('Doc', 'utf8').copy(name)
      return {
        personacount: Buffer.from([0x00, 0x01]),
        // Max Personas are how many there are not how many allowed
        maxpersonas: Buffer.from([0x00, 0x02]),
        id: Buffer.from([0x00, 0x00, 0x00, 0x01]),
        name,
        shardid: Buffer.from([0x00, 0x00, 0x00, 0x2C]),
      }
    default:
      logger.error(`Unknown customerId: ${customerId.readUInt32BE()}`)
      process.exit(1)
      return null
  }
}

function npsCheckToken() {
  // data[17] = plate name
  return null
}

function npsGetPersonaInfoByName(name) {
  return {
    name,
  }
}

function toHex(d) {
  const hexByte = `0${Number(d).toString(16)}`
  return `${hexByte.slice(-2).toUpperCase()}`
}

function getRequestCode(rawBuffer) {
  const requestCode = `${toHex(rawBuffer[0])}${toHex(rawBuffer[1])}`
  switch (requestCode) {
    case '0100':
      return '(0x0100) NPS_REQUEST_GAME_CONNECT_SERVER'
    case '0501':
      return '(0x0501) NPSUserLogin'
    case '0503':
      return '(0x503) NPSSelectGamePersona'
    case '050F':
      return '(0x050F) NPSLogOutGameUser'
    case '0518':
      return '(0x0518) NPSGetBuddyInfoByName'
    case '0519':
      return '(0x0519) NPSGetPersonaInfoByName'
    case '0532':
      return '(0x0532) NPSGetPersonaMaps'
    case '0533': // debug
      return '(0x0533) NPSValidatePersonaName'
    case '0534': // debug
      return '(0x0534) NPSCheckToken'
    case '1101':
      return '(0x1101) NPSSendCommand'
    case '2472':
    case '7B22':
    case '4745':
    case 'FBC0':
      return 'p2pool'
    default:
      return `Unknown request code: ${requestCode}`
  }
}

function dumpRequest(socket, rawBuffer, requestCode) {
  logger.debug(`\n-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  Request from: ${socket.localId}
  Request Code: ${requestCode}
  -----------------------------------------
  Request DATA ${socket.localId}:${rawBuffer.toString('ascii')}
  =========================================
  Request DATA ${socket.localId}:${rawBuffer.toString('hex')}
  -----------------------------------------
  -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\n`)
}

function dumpResponse(data, count) {
  logger.debug(`Response Length: ${data.length}`)
  let responseBytes = ''
  for (let i = 0; (i < count && i < data.length); i += 1) {
    responseBytes += ` ${toHex(data[i])}`
  }
  logger.debug(`Response Bytes: ${responseBytes}`)
}

function decryptSessionKey(session, encryptedKeySet) {
  const s = session
  try {
    const encryptedKeySetB64 = Buffer.from(encryptedKeySet.toString('utf8'), 'hex').toString('base64')
    const decrypted = s.privateKey.decrypt(encryptedKeySetB64, 'base64')
    s.sessionKey = Buffer.from(Buffer.from(decrypted, 'base64').toString('hex').substring(4, 20), 'hex')
    const desIV = Buffer.alloc(8)
    s.cypher = crypto.createCipheriv('des-cbc', Buffer.from(s.sessionKey, 'hex'), desIV).setAutoPadding(false)
    s.decypher = crypto.createDecipheriv('des-cbc', Buffer.from(s.sessionKey, 'hex'), desIV).setAutoPadding(false)
    logger.debug('decrypted: ', s.sessionKey)
  } catch (e) {
    logger.error(e)
  }
  return s
}

function decryptCmd(session, cypherCmd) {
  const s = session
  logger.debug(`raw cmd: ${cypherCmd.toString('hex')}`)
  const decryptedCommand = s.decypher.update(cypherCmd)
  s.decryptedCmd = decryptedCommand
  return s
}

function encryptCmd(session, cypherCmd) {
  const s = session
  // logger.debug('raw cmd: ' + cypherCmd + cypherCmd.length)
  s.encryptedCommand = s.cypher.update(cypherCmd)
  return s
}

function userLogin(session, data, requestCode) {
  const s = session

  dumpRequest(s.loginSocket, data, requestCode)
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
  // packetresult = packet.buildPacket(44975, 0x0601, packetcontent)
  const packetresult = packet.buildPacket(516, 0x0601, packetcontent)

  dumpResponse(packetresult, 516)

  const loginSession = decryptSessionKey(s, data.slice(52, -10))

  loginSession.packetresult = packetresult

  return loginSession
}

function getPersonaMaps(session, data, requestCode) {
  dumpRequest(session.personaSocket, data, requestCode)

  const customerId = Buffer.alloc(4)
  data.copy(customerId, 0, 12)
  const persona = npsGetPersonaMapsByCustomerId(customerId)

  // Create the packet content
  // packetcontent = crypto.randomBytes(1024)
  const packetcontent = packet.premadePersonaMaps()

    // This is needed, not sure for what
  Buffer.from([0x01, 0x01]).copy(packetcontent)

    // This is the persona count
  persona.personacount.copy(packetcontent, 10)

    // This is the max persona count
  persona.maxpersonas.copy(packetcontent, 18)

    // PersonaId
  persona.id.copy(packetcontent, 18)

    // Shard ID
  persona.shardid.copy(packetcontent, 22)

    // Persona Name = 30-bit null terminated string
  persona.name.copy(packetcontent, 32)

    // Build the packet
  const packetresult = packet.buildPacket(1024, 0x0607, packetcontent)

  dumpResponse(packetresult, 1024)
  return packetresult
}

function sendCommand(session, data, requestCode) {
  const s = session
  const cmd = decryptCmd(s, new Buffer(data.slice(4)))
  logger.debug(`decryptedCmd: ${cmd.decryptedCmd.toString('hex')}`)
  logger.debug(`cmd: ${cmd.decryptedCmd}`)

  dumpRequest(session.lobbySocket, data, requestCode)

    // Create the packet content
  // packetcontent = crypto.randomBytes(8)
  const packetcontent = Buffer.from([0x02, 0x19, 0x02, 0x19, 0x02, 0x19, 0x02, 0x19,
    0x02, 0x19, 0x02, 0x19, 0x02, 0x19, 0x02, 0x19, 0x02, 0x19, 0x02, 0x19])

    // This is needed, not sure for what
  // Buffer.from([0x01, 0x01]).copy(packetcontent)

    // Build the packet
  const packetresult = packet.buildPacket(24, 0x0219,
    packetcontent)

  dumpResponse(packetresult, 24)

  const cmdEncrypted = encryptCmd(s, packetresult)
  logger.debug(`encryptedResponse: ${cmdEncrypted.encryptedCommand.toString('hex')}`)
  return cmdEncrypted
}

function logoutGameUser(session, data, requestCode) {
  logger.debug(`cmd: ${decryptCmd(new Buffer(data.slice(4))).toString('hex')}`)

  dumpRequest(session.loginSocket, data, requestCode)

    // Create the packet content
  const packetcontent = crypto.randomBytes(253)

    // This is needed, not sure for what
  Buffer.from([0x01, 0x01]).copy(packetcontent)

    // Build the packet
  const packetresult = packet.buildPacket(257, 0x0612, packetcontent)

  dumpResponse(packetresult, 16)
  return packetresult
}

function loginDataHandler(session, rawData) {
  let s = session
  const requestCode = getRequestCode(rawData)

  switch (requestCode) {
    case '(0x0501) NPSUserLogin': {
      s = userLogin(s, rawData, requestCode)

      // Update the onData handler with the new session
      s.loginSocket.removeListener('data', loginDataHandler)
      s.loginSocket.on('data', (data) => {
        loginDataHandler(s, data)
      })

      s.loginSocket.write(s.packetresult)
      break
    }
    case '(0x050F) NPSLogOutGameUser': {
      const packetLogout = logoutGameUser(session, rawData, requestCode)
      s.loginSocket.write(packetLogout)
      break
    }
    default:
      throw new Error(`Unknown code ${requestCode} was recieved on port 8226`)
  }
  return s
}

function personaDataHandler(session, rawData) {
  const s = session
  const requestCode = getRequestCode(rawData)

  switch (requestCode) {
    // Persona_UseSelected
    case '(0x503) NPSSelectGamePersona': {
      dumpRequest(session.personaSocket, rawData, requestCode)

      // Create the packet content
      const packetcontent = crypto.randomBytes(44971)

      // This is needed, not sure for what
      Buffer.from([0x01, 0x01]).copy(packetcontent)

      // Build the packet
      // Response Code
      // 207 = success
      // packetresult = packet.buildPacket(44975, 0x0207, packetcontent)
      const packetresult = packet.buildPacket(261, 0x0207, packetcontent)

      dumpResponse(packetresult, 16)
      session.personaSocket.write(packetresult)
      break
    }
    case '(0x0532) NPSGetPersonaMaps':
      session.personaSocket.write(getPersonaMaps(session, rawData, requestCode))
      break
    case '(0x0533) NPSValidatePersonaName': {
      dumpRequest(session.personaSocket, rawData, requestCode)

      const customerId = Buffer.alloc(4)
      rawData.copy(customerId, 0, 12)
      const persona = npsGetPersonaMapsByCustomerId(customerId)

      // Create the packet content
      const packetcontent = crypto.randomBytes(1024)

      // This is needed, not sure for what
      Buffer.from([0x01, 0x01]).copy(packetcontent)

      // This is the persona count
      persona.personacount.copy(packetcontent, 10)

      // This is the max persona count
      persona.maxpersonas.copy(packetcontent, 18)

      // PersonaId
      persona.id.copy(packetcontent, 18)

      // Shard ID
      persona.shardid.copy(packetcontent, 22)

      // Persona Name = 30-bit null terminated string
      persona.name.copy(packetcontent, 32)

      // Build the packet
      const packetresult = packet.buildPacket(1024, 0x0601, packetcontent)

      dumpResponse(packetresult, 1024)
      s.personaSocket.write(packetresult)
      break
    }
    case '(0x0534) NPSCheckToken': {
      dumpRequest(session.personaSocket, rawData, requestCode)

      // const customerId = Buffer.alloc(4)
      // data.copy(customerId, 0, 12)
      // const persona = nps.npsGetPersonaMapsByCustomerId(customerId)

      // Create the packet content
      const packetcontent = crypto.randomBytes(1024)

      // This is needed, not sure for what
      Buffer.from([0x01, 0x01]).copy(packetcontent)

      // This is the persona count
      // persona.personacount.copy(packetcontent, 10)

      // This is the max persona count
      // persona.maxpersonas.copy(packetcontent, 18)

      // PersonaId
      // persona.id.copy(packetcontent, 18)

      // Shard ID
      // persona.shardid.copy(packetcontent, 22)

      // Persona Name = 30-bit null terminated string
      // persona.name.copy(packetcontent, 32)

      // Build the packet
      const packetresult = packet.buildPacket(1024, 0x0207, packetcontent)

      dumpResponse(packetresult, 1024)
      s.personaSocket.write(packetresult)
      break
    }
    case '(0x0519) NPSGetPersonaInfoByName': {
      dumpRequest(session.personaSocket, rawData, requestCode)
      const personaName = Buffer.alloc(rawData.length - 30)
      rawData.copy(personaName, 0, 30)

      logger.debug(`personaName ${personaName}`)

      // Create the packet content
      const packetcontent = crypto.randomBytes(44976)

      // This is needed, not sure for what
      Buffer.from([0x01, 0x01]).copy(packetcontent)

      // Build the packet
      const packetresult = packet.buildPacket(48380, 0x0601, packetcontent)

      dumpResponse(packetresult, 16)
      s.personaSocket.write(packetresult)

      // Response Code
      // 607 = persona name not available
      // 611 = No error, starter car lot
      // 602 = No error, starter car lot
      break
    }
    default:
      throw new Error(`Unknown code ${requestCode} was recieved on port 8226`)
  }
  return s
}

function lobbyDataHandler(session, rawData) {
  const s = session
  const requestCode = getRequestCode(rawData)

  switch (requestCode) {
    case '(0x0100) NPS_REQUEST_GAME_CONNECT_SERVER': {
      dumpRequest(session.lobbySocket, rawData, requestCode)
      // const contextId = Buffer.alloc(34)
      // data.copy(contextId, 0, 14, 48)
      // const customer = nps.npsGetCustomerIdByContextId(contextId)
      // logger.debug(`customer: ${customer}`)


      // Create the packet content
      const packetcontent = Buffer.alloc(6)

      // Server ID
      Buffer.from([0x00]).copy(packetcontent)

      // This is needed, not sure for what
      // Buffer.from([0x01, 0x01]).copy(packetcontent)

      // if it's 97 it says the username returned is correct
      // if it's 06 it says it's different, but it's random
      // It's parsed by the NPS cipher somehow.
      Buffer.from([0x05]).copy(packetcontent, 1)

        // load the customer id
      Buffer.from([0xAB, 0x01, 0x00, 0x00]).copy(packetcontent, 2)

      // RIFF Count = total packet len - 4 for header
      // Buffer.from([0x00, 0x05]).copy(packetcontent, 1490)

      // Build the packet
      const packetresult = packet.buildPacket(8, 0x0120, packetcontent)

      dumpResponse(packetresult, 8)
      s.lobbySocket.write(packetresult)
      break
    }
    case '(0x1101) NPSSendCommand': {
      const cmd = sendCommand(s, rawData, requestCode)
      s.lobbySocket.write(cmd.encryptedCommand)
      break
    }
    default:
      throw new Error(`Unknown code ${requestCode} was recieved on port 7003`)
  }
  return s
}

function databaseDataHandler(session, rawData) {
  // const s = session
  const requestCode = getRequestCode(rawData)

  switch (requestCode) {
    default:
      throw new Error(`Unknown code ${requestCode} was recieved on port 43300`)
  }
  // return s
}

function sendPacketOkToLogin(session) {
  const packetcontent = crypto.randomBytes(151)

  // This is needed, not sure for what
  Buffer.from([0x01, 0x01]).copy(packetcontent)

  const packetresult = packet.buildPacket(4, 0x0230, packetcontent)
  dumpResponse(packetresult, 8)
  return session.lobbySocket.write(packetresult)
}

function loginListener(session) {
  const s = session.loginSocket
  s.localId = `${s.localAddress}_${s.localPort}`
  s.socketId = `${s.remoteAddress}_${s.remotePort}`
  logger.info(`Creating login socket: ${s.localId} => ${s.socketId}`)

  // Add a 'data' event handler to this instance of socket
  s.on('data', (data) => {
    loginDataHandler(session, data)
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
    personaDataHandler(session, data)
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
    lobbyDataHandler(sess, data)
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
    databaseDataHandler(session, data)
  })
  s.on('error', (err) => {
    if (err.code !== 'ECONNRESET') {
      throw err
    }
  })
}

function start(config, cbStart) {
  /* Initialize the crypto */
  let privateKey = null
  try {
    privateKey = initCrypto(config)
  } catch (err) {
    logger.error(err)
    process.exit(1)
  }

  // Start the servers
  const session = {
    privateKey,
  }
  series({
    serverLogin: (callback) => {
      const server = net.createServer((socket) => {
        session.loginSocket = socket
        loginListener(session)
      })
      server.listen(config.serverLogin.port, () => {
        logger.info(`${config.serverLogin.name} Server listening on TCP port: ${config.serverLogin.port}`)
        callback(null, server)
      })
    },
    serverPersona: (callback) => {
      const server = net.createServer((socket) => {
        session.personaSocket = socket
        personaListener(session)
      })
      server.listen(config.serverPersona.port, () => {
        logger.info(`${config.serverPersona.name} Server listening on TCP port: ${config.serverPersona.port}`)
        callback(null, server)
      })
    },
    serverLobby: (callback) => {
      const server = net.createServer((socket) => {
        session.lobbySocket = socket
        lobbyListener(session)
      })
      server.listen(config.serverLobby.port, () => {
        logger.info(`${config.serverLobby.name} Server listening on TCP port: ${config.serverLobby.port}`)
        callback(null, server)
      })
    },
    serverDatabase: (callback) => {
      const server = net.createServer((socket) => {
        session.databaseSocket = socket
        databaseListener(session)
      })
      server.listen(config.serverDatabase.port, () => {
        logger.info(`${config.serverDatabase.name} Server listening on TCP port: ${config.serverDatabase.port}`)
        callback(null, server)
      })
    },
  }, (err) => {
    if (err) { throw err }
    // Not currently using this

    cbStart(null)
  })
}

module.exports = {
  start,
  npsCheckToken,
  npsGetCustomerIdByContextId,
  npsGetPersonaInfoByName,
  npsGetPersonaMapsByCustomerId,
  getRequestCode,
  dumpRequest,
  dumpResponse,
  toHex,
  // decryptSessionKey,
  encryptCmd,
  decryptCmd,
  initCrypto,
  // isUserCreated,
  userLogin,
  getPersonaMaps,
  sendCommand,
  logoutGameUser,
}
