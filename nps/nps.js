var crypto = require('crypto')
var NodeRSA = require('node-rsa')

var privateKey = new NodeRSA('-----BEGIN PRIVATE KEY-----' +
  'MIICeQIBADANBgkqhkiG9w0BAQEFAASCAmMwggJfAgEAAoGBAMjtNzV6azZyC9HG' +
  'jf+mrLkdvkJu4DavzyLIr3YsUZq0ofxtuZjUbe3K0gmaX+UNgjLRR3K+V5cpmZi2' +
  'Qhp4lWHxKRra8T3LxrjM3A4N8k8wPuVuGYhfTX7qDqW8pFLUYOErAxcfv/6RI4GX' +
  'xDkTg1obDFZr+Phph4NAunWXBfgpAgMBAAECgYEAwQBbz9rPsXTLNa3sKG4J66dO' +
  'YrHuXZly9o6fPHxFxr1L/BXJ+avUDF6Ocvr+sh7PudCdOPLtYB5tk+s+g/7gPYhd' +
  'xtpUYvUj0TOLGedREUQeYhnBZV6uqfQbtyL3MF+qtCfOTEvVTpzNrRMNNVOFVEiC' +
  'NK6mSsy2Wo4RXI6L/6ECQQDqdmk+NWKyRXOXCEXEEzo25PEkzd3qxOaBQzZhx9/V' +
  'Ew+dy/y2+XRDdggUCpPj2Ialh2uM/djdplvhBR5Sgg+7AkEA22ItsQ24HukOddWM' +
  'rcRvbStXk1u9lYmy6YlADsYeQRKX7Qvyte/II7m7W5phOO2mJlc4bPEQkbK7it0F' +
  'J8lfawJBAIHrSVgCRwVXvLxVBiunJ9vhMspdFPoRT1UTRGAcXCh6nm2m6gsN4WG8' +
  'Vq+cSOS5R6sThgIja3cuxrzClFHN5h8CQQDNGLMoxG+ujilTpiqXxX56bDu6atkJ' +
  'tSsLQ6IcbcGZCl34YeQtjRbpt1jeYaykwSBE1ePNjWz1GUhVoR2RvaQzAkEAxAFN' +
  'MZFQ9pTrc9dJKlMWXhTq/19JlnJ4r9IhnBzXq2wnoJEJHeF3vU70uYSSeu4ymu4/' +
  'ArBsHZYjikoVxo1oRA==' +
  '-----END PRIVATE KEY-----')

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
  encryptedKeySet = new Buffer(encryptedKeySet.toString('utf8'), 'hex')
  console.log('raw len: ', encryptedKeySet.length)
  console.log('raw: ', encryptedKeySet.toString('hex'))
  var encryptedKeySetB64 = encryptedKeySet.toString('base64')
  console.log('base64: ', encryptedKeySetB64)
  var decrypted = privateKey.decrypt(encryptedKeySetB64, 'base64')
  console.log('decrypted: ', new Buffer(decrypted, 'base64').toString('hex'))
}

module.exports = {
  getRequestCode: getRequestCode,
  dumpRequest: dumpRequest,
  toHex: toHex,
  randomValueHex: randomValueHex,
  decryptSessionKey: decryptSessionKey
}
