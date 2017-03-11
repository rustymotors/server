const series = require('async/series')
const fs = require('fs')
const crypto = require('crypto')
const net = require('net')

const NodeRSA = require('node-rsa')
const logger = require('./logger.js')
const packet = require('./packet.js')

let privateKey
let sessionKey
let sessionCypher
let sessionDecypher

let inQueue = false
let isUserCreated = true

function initCrypto(config) {
  try {
    fs.statSync(config.privateKeyFilename)
  } catch (e) {
    logger.error(`Error loading private key: ${e}`)
    process.exit(1)
  }
  privateKey = new NodeRSA(fs.readFileSync(config.privateKeyFilename))
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
      if (isUserCreated) {
        Buffer.from('Doc', 'utf8').copy(name)
        return {
          personacount: Buffer.from([0x00, 0x01]),
          // Max Personas are how many there are not how many allowed
          maxpersonas: Buffer.from([0x00, 0x02]),
          id: Buffer.from([0x00, 0x00, 0x00, 0x01]),
          name,
          shardid: Buffer.from([0x00, 0x00, 0x00, 0x2C]),
        }
      }
      Buffer.from('', 'utf8').copy(name)
      return {
        personacount: Buffer.from([0x00, 0x00]),
        // Max Personas are how many there are not how many allowed
        maxpersonas: Buffer.from([0x00, 0x00]),
        id: Buffer.from([0x00, 0x00, 0x00, 0x00]),
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

function dumpRequest(sock, id, rawBuffer, requestCode) {
  logger.debug(`\n-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  Request from: ${id}
  Request Code: ${requestCode}
  -----------------------------------------
  Request DATA ${sock.remoteAddress}:${sock.localPort}:${rawBuffer.toString('ascii')}
  =========================================
  Request DATA ${sock.remoteAddress}:${rawBuffer.toString('hex')}
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

function decryptSessionKey(encryptedKeySet) {
  try {
    const encryptedKeySetB64 = Buffer.from(encryptedKeySet.toString('utf8'), 'hex').toString('base64')
    const decrypted = privateKey.decrypt(encryptedKeySetB64, 'base64')
    sessionKey = Buffer.from(Buffer.from(decrypted, 'base64').toString('hex').substring(4, 20), 'hex')
    const desIV = Buffer.alloc(8)
    sessionCypher = crypto.createCipheriv('des-cbc', Buffer.from(sessionKey, 'hex'), desIV).setAutoPadding(false)
    sessionDecypher = crypto.createDecipheriv('des-cbc', Buffer.from(sessionKey, 'hex'), desIV).setAutoPadding(false)
    logger.debug('decrypted: ', sessionKey)
  } catch (e) {
    logger.error(e)
  }
}

function decryptCmd(cypherCmd) {
  // logger.debug('raw cmd: ' + cypherCmd + cypherCmd.length)
  return sessionDecypher.update(cypherCmd)
}

function encryptCmd(cypherCmd) {
  // logger.debug('raw cmd: ' + cypherCmd + cypherCmd.length)
  return sessionCypher.update(cypherCmd)
}

function userLogin(sock, id, data, requestCode) {
  dumpRequest(sock, id, data, requestCode)
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

  decryptSessionKey(data.slice(52, -10))

  module.exports.inQueue = true
  return packetresult
}

function getPersonaMaps(sock, id, data, requestCode) {
  dumpRequest(sock, id, data, requestCode)

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

function sendCommand(sock, id, data, requestCode) {
  const decryptedCmd = decryptCmd(new Buffer(data.slice(4))).toString('hex')
  logger.debug(`decryptedCmd: ${decryptedCmd.toString('hex')}`)
  logger.debug(`cmd: ${decryptedCmd}`)

  dumpRequest(sock, id, data, requestCode)

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

  const encryptedResponse = encryptCmd(packetresult)
  logger.debug(`encryptedResponse: ${encryptedResponse.toString('hex')}`)
  return encryptedResponse
}

function logoutGameUser(sock, id, data, requestCode) {
  logger.debug(`cmd: ${decryptCmd(new Buffer(data.slice(4))).toString('hex')}`)

  dumpRequest(sock, id, data, requestCode)

    // Create the packet content
  const packetcontent = crypto.randomBytes(253)

    // This is needed, not sure for what
  Buffer.from([0x01, 0x01]).copy(packetcontent)

    // Build the packet
  const packetresult = packet.buildPacket(257, 0x0612, packetcontent)

  dumpResponse(packetresult, 16)
  return packetresult
}

function onData(sock, id, data) {
  const requestCode = getRequestCode(data)

  logger.info(`Data request ${requestCode} from ${sock.remoteAddress}_${sock.localPort}`)

  if (requestCode === '(0x0501) NPSUserLogin') {
    return sock.write(userLogin(sock, id, data, requestCode))
  }

  // Persona_UseSelected
  if (requestCode === '(0x503) NPSSelectGamePersona') {
    dumpRequest(sock, id, data, requestCode)

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
    return sock.write(packetresult)
  }

  if (requestCode === '(0x0532) NPSGetPersonaMaps') {
    return sock.write(getPersonaMaps(sock, id, data, requestCode))
  }

  if (requestCode === '(0x0533) NPSValidatePersonaName') {
    dumpRequest(sock, id, data, requestCode)

    const customerId = Buffer.alloc(4)
    data.copy(customerId, 0, 12)
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
    return sock.write(packetresult)
  }

  if (requestCode === '(0x0534) NPSCheckToken') {
    dumpRequest(sock, id, data, requestCode)

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
    return sock.write(packetresult)
  }

  if (requestCode === '(0x0519) NPSGetPersonaInfoByName') {
    dumpRequest(sock, id, data, requestCode)
    const personaName = Buffer.alloc(data.length - 30)
    data.copy(personaName, 0, 30)

    logger.debug(`personaName ${personaName}`)

      // Create the packet content
    const packetcontent = crypto.randomBytes(44976)

      // This is needed, not sure for what
    Buffer.from([0x01, 0x01]).copy(packetcontent)

      // Build the packet
    const packetresult = packet.buildPacket(48380, 0x0601, packetcontent)

    dumpResponse(packetresult, 16)
    return sock.write(packetresult)

      // Response Code
      // 607 = persona name not available
      // 611 = No error, starter car lot
      // 602 = No error, starter car lot
  }

  if (requestCode === '(0x0100) NPS_REQUEST_GAME_CONNECT_SERVER') {
    dumpRequest(sock, id, data, requestCode)
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
    return sock.write(packetresult)
  }

  if (requestCode === '(0x1101) NPSSendCommand') {
    const packetCommand = sendCommand(sock, id, data, requestCode)
    return sock.write(packetCommand)
  }

  if (requestCode === '(0x050F) NPSLogOutGameUser') {
    const packetLogout = logoutGameUser(sock, id, data, requestCode)
    return sock.write(packetLogout)
  }

// Anything else
  dumpRequest(sock, id, data, requestCode)
  isUserCreated = true

      // Create the packet content
  const packetcontent = crypto.randomBytes(44971)

      // This is needed, not sure for what
  Buffer.from([0x01, 0x01]).copy(packetcontent)

      // Build the packet
  const packetresult = packet.buildPacket(600, 0x0000, packetcontent)

  dumpResponse(packetresult, 600)
  return sock.write(packetresult)
}

function listener(sock) {
  const localId = `${sock.localAddress}_${sock.localPort}`
  const socketId = `${sock.remoteAddress}_${sock.remotePort}`
  logger.info(`Creating socket: ${localId} => ${socketId}`)
  // sock.setKeepAlive(true)
  if (sock.localPort === 7003 && inQueue === true) {
    const packetcontent = crypto.randomBytes(151)

    // This is needed, not sure for what
    Buffer.from([0x01, 0x01]).copy(packetcontent)

    const packetresult = packet.buildPacket(4, 0x0230, packetcontent)
    inQueue = false
    dumpResponse(packetresult, 8)
    sock.write(packetresult)
  }


  const socket = sock

  // Add a 'data' event handler to this instance of socket
  sock.on('data', (data) => {
    onData(socket, socketId, data)
  })
  // Add a 'close' event handler to this instance of socket
  sock.on('close', () => {
    logger.info(`Closing socket: ${localId} => ${socketId}`)
  })
  // Add a 'error' event handler to this instance of socket
  sock.on('error', (err) => {
    if (err.code !== 'ECONNRESET') {
      logger.error(err)
    }
  })
}

function start(config, cbStart) {
  /* Initialize the crypto */
  try {
    initCrypto(config)
  } catch (err) {
    logger.error(err)
    process.exit(1)
  }

  // Start the servers
  series({
    serverLogin: (callback) => {
      const server = net.createServer(listener)
      server.listen(config.serverLogin.port, () => {
        logger.info(`${config.serverLogin.name} Server listening on TCP port: ${config.serverLogin.port}`)
        callback(null, server)
      })
    },
    serverPersona: (callback) => {
      const server = net.createServer(listener)
      server.listen(config.serverPersona.port, () => {
        logger.info(`${config.serverPersona.name} Server listening on TCP port: ${config.serverPersona.port}`)
        callback(null, server)
      })
    },
    serverLobby: (callback) => {
      const server = net.createServer(listener)
      server.listen(config.serverLobby.port, () => {
        logger.info(`${config.serverLobby.name} Server listening on TCP port: ${config.serverLobby.port}`)
        callback(null, server)
      })
    },
    serverDatabase: (callback) => {
      const server = net.createServer(listener)
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
  decryptSessionKey,
  encryptCmd,
  decryptCmd,
  initCrypto,
  isUserCreated,
  userLogin,
  getPersonaMaps,
  sendCommand,
  logoutGameUser,
}
