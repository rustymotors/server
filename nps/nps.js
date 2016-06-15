var fs = require('fs')
var crypto = require('crypto')
var NodeRSA = require('node-rsa')

var privateKeyFilename = './data/private_key.pem'
var cryptoLoaded = false
var privateKey
var session_key

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

function dumpRequest (sock, rawBuffer, requestCode) {
  console.log('-----------------------------------------')
  console.log('Request Code: ' + requestCode)
  console.log('-----------------------------------------')
  console.log('Request DATA ' + sock.remoteAddress + ': ' + rawBuffer)
  console.log('=========================================')
  console.log('Request DATA ' + sock.remoteAddress + ': ' + rawBuffer.toString('hex'))
  console.log('-----------------------------------------')
}

function toHex (d) {
  return ('0' + (Number(d).toString(16))).slice(-2).toUpperCase()
}

function randomValueHex (len) {
  return crypto.randomBytes(Math.ceil(len / 2))
    .toString('hex') // convert to hexadecimal format
    .slice(0, len)   // return required number of characters
}

function decryptSessionKey (encryptedKeySet) {
  initCrypto()
  try {
    encryptedKeySet = new Buffer(encryptedKeySet.toString('utf8'), 'hex')
    console.log('raw len: ', encryptedKeySet.length)
    console.log('raw: ', encryptedKeySet.toString('hex'))
    var encryptedKeySetB64 = encryptedKeySet.toString('base64')
    console.log('base64: ', encryptedKeySetB64)
    var decrypted = privateKey.decrypt(encryptedKeySetB64, 'base64')
    session_key = new Buffer(decrypted, 'base64').toString('hex').substring(4, 20)
    console.log('decrypted: ', session_key)
  } catch (e) {
    console.log(e)
  }
}

module.exports = {
  getRequestCode: getRequestCode,
  dumpRequest: dumpRequest,
  toHex: toHex,
  randomValueHex: randomValueHex,
  decryptSessionKey: decryptSessionKey,
  initCrypto: initCrypto
}
