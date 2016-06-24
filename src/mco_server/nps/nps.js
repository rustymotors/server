var fs = require('fs')
var crypto = require('crypto')
var NodeRSA = require('node-rsa')
var logger = require('winston')

logger.cli()
// logger.add(logger.transports.File, { filename: 'logs/mco_server.log' })
logger.add(require('winston-daily-rotate-file'), {
  filename: 'logs/mco_server.log',
  json: true,
  datePattern: '.dd-MM-yyyy'
})
logger.level = 'debug'

var privateKeyFilename = './data/private_key.pem'
var cryptoLoaded = false
var privateKey
var session_key
var desIV = new Buffer('0000000000000000', 'hex')
var contextId = new Buffer(34).fill(0)
var customerId = new Buffer(4).fill(0)
var userId = new Buffer(4).fill(0)

function initCrypto () {
  if (cryptoLoaded === false) {
    try {
      fs.statSync(privateKeyFilename)
    } catch (e) {
      throw new Error('Error loading private key: ' + e)
    }
    privateKey = new NodeRSA(fs.readFileSync(privateKeyFilename))
    cryptoLoaded = true
  }
}

function npsGetCustomerIdByContextId (contextIdRequest) {
  contextId = contextIdRequest
  switch (contextId.toString()) {
    case 'd316cd2dd6bf870893dfbaaf17f965884e':
      userId = new Buffer('0x0001', 'hex')
      customerId = new Buffer('AB010000', 'hex')
      return {
        'userId': userId,
        'customerId': customerId
      }
    case '5213dee3a6bcdb133373b2d4f3b9962758':
      userId = new Buffer('0x0002', 'hex')
      customerId = new Buffer('Ac010000', 'hex')
      return {
        'userId': userId,
        'customerId': customerId
      }
  }
}

function npsGetPersonaMapsByCustomerId () {
  switch (customerId.readUInt32BE()) {
    case 2868969472:
      return {
        'id': Buffer.from([0x00, 0x00, 0x00, 0x01]),
        'name': new Buffer('Doc Brown', 'utf8')
      }
    case 2885746688:
      return {
        'id': Buffer.from([0x00, 0x00, 0x00, 0x02]),
        'name': new Buffer('Biff', 'utf8')
      }
  }
}

function getRequestCode (rawBuffer) {
  var requestCode = toHex(rawBuffer[0]) + toHex(rawBuffer[1])
  switch (requestCode) {
    case '0100':
      return '(0x0100)NPS_REQUEST_GAME_CONNECT_SERVER'
    case '0501':
      return '(0x0501)NPS_REQUEST_USER_LOGIN'
    case '0503':
      return '(0x0503)NPS_REQUEST_SELECT_GAME_PERSONA'
    case '050F':
      return '(0x050F)NPS_REQUEST_LOG_OUT_USER'
    case '0519':
      return '(0x0519)NPS_REQUEST_GET_PERSONA_INFO_BY_NAME'
    case '0532':
      return '(0x0532)NPS_REQUEST_GET_PERSONA_MAPS'
    case '0533': // debug
      return '(0x0533)NPSValidatePersonaName'
    case '0534': // debug
      return '(0x0534)NPSCheckToken'
    case '1101':
      return '(0x1101)NPSSendCommand'
    case '2472':
    case '7B22':
    case '4745':
    case 'FBC0':
      return 'p2pool'
    default:
      return 'Unknown request code: ' + requestCode
  }
}

function setContextIdFromRequest (data) {
  data.copy(contextId, 0, 14, 48)
}

function setCustomerIdFromRequest (data) {
  data.copy(customerId, 0, 12)
}
function dumpRequest (sock, rawBuffer, requestCode) {
  logger.debug('-----------------------------------------')
  logger.debug('Request Code: ' + requestCode)
  logger.debug('-----------------------------------------')
  logger.debug('Request DATA ' + sock.remoteAddress + ': ' + rawBuffer)
  logger.debug('=========================================')
  logger.debug('Request DATA ' + sock.remoteAddress + ': ' + rawBuffer.toString('hex'))
  logger.debug('-----------------------------------------')
}

function toHex (d) {
  return ('0' + (Number(d).toString(16))).slice(-2).toUpperCase()
}

function decryptSessionKey (encryptedKeySet) {
  initCrypto()
  try {
    encryptedKeySet = new Buffer(encryptedKeySet.toString('utf8'), 'hex')
    var encryptedKeySetB64 = encryptedKeySet.toString('base64')
    var decrypted = privateKey.decrypt(encryptedKeySetB64, 'base64')
    session_key = new Buffer(new Buffer(decrypted, 'base64').toString('hex').substring(4, 20), 'hex')
    logger.debug('decrypted: ', session_key)
  } catch (e) {
    logger.error(e)
  }
}

function decryptCmd (cypherCmd) {
  var plaintext = crypto.createDecipheriv('des', new Buffer(session_key, 'hex'), desIV)
    .update(cypherCmd, 'hex', 'hex')
  desIV = cypherCmd
  return plaintext
}

module.exports = {
  userId: userId,
  customerId: customerId,
  contextId: contextId,
  setContextIdFromRequest: setContextIdFromRequest,
  setCustomerIdFromRequest: setCustomerIdFromRequest,
  npsGetCustomerIdByContextId: npsGetCustomerIdByContextId,
  npsGetPersonaMapsByCustomerId: npsGetPersonaMapsByCustomerId,
  getRequestCode: getRequestCode,
  dumpRequest: dumpRequest,
  toHex: toHex,
  decryptSessionKey: decryptSessionKey,
  decryptCmd: decryptCmd,
  initCrypto: initCrypto,
  logger: logger
}
