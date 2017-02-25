const fs = require('fs')
const crypto = require('crypto')
const NodeRSA = require('node-rsa')
const logger = require('./logger.js')

const privateKeyFilename = './data/private_key.pem'

let privateKey
let sessionKey
let sessionDecypher

const isUserCreated = true

function initCrypto() {
  try {
    fs.statSync(privateKeyFilename)
  } catch (e) {
    logger.error(`Error loading private key: ${e}`)
    process.exit(1)
  }
  privateKey = new NodeRSA(fs.readFileSync(privateKeyFilename))
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
  logger.debug(toHex(rawBuffer[0]))
  logger.debug(toHex(rawBuffer[1]))
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

function dumpRequest(sock, rawBuffer, requestCode) {
  logger.debug(`\n-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
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
  let responseBytes
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
    // session_cypher = crypto.createCipheriv('des-cbc', Buffer.from(sessionKey, 'hex'),
    // desIV).setAutoPadding(false)
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

module.exports = {
  npsGetCustomerIdByContextId,
  npsGetPersonaInfoByName,
  npsGetPersonaMapsByCustomerId,
  getRequestCode,
  dumpRequest,
  dumpResponse,
  toHex,
  decryptSessionKey,
  decryptCmd,
  initCrypto,
  isUserCreated,
}
