var crypto = require('crypto')

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
    case '2472':
    case '7B22':
    case '4745':
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

module.exports = {
  getRequestCode: getRequestCode,
  dumpRequest: dumpRequest,
  toHex: toHex,
  randomValueHex: randomValueHex
}
