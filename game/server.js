var nps = require('../nps/nps.js')

function npsResponse_ConnectServer () {
  var responseBuffer = new Buffer(155)
  var responseCodeBuffer = new Buffer(2)
  responseBuffer.fill(0)

  responseBuffer[2] = 0x00
  responseBuffer[3] = 0x97

  for (var i = 4; i < responseBuffer.length; i++) {
    responseBuffer[i] = nps.toHex((Math.random() * 90 | 65) + 1)
  }

  // User ID
  responseBuffer[4] = 0x00
  responseBuffer[5] = 0x00
  responseBuffer[6] = 0x00
  responseBuffer[7] = 0x01

  // Response Code
  // 120h = Success
  responseCodeBuffer.fill(0)
  responseCodeBuffer[0] = 0x01
  responseCodeBuffer[1] = 0x20
  responseCodeBuffer.copy(responseBuffer)

  return responseBuffer
}

function npsResponse_GameSelectPersona () {
  var responseBuffer = new Buffer(155)
  var responseCodeBuffer = new Buffer(2)
  responseBuffer.fill(0)

  responseBuffer[2] = 0x00
  responseBuffer[3] = 0x97

  for (var i = 4; i < responseBuffer.length; i++) {
    responseBuffer[i] = nps.toHex((Math.random() * 90 | 65) + 1)
  }

  // User ID
  responseBuffer[4] = 0x00
  responseBuffer[5] = 0x00
  responseBuffer[6] = 0x00
  responseBuffer[7] = 0x01

  // Response Code
  // 120h = Success
  responseCodeBuffer.fill(0)
  responseCodeBuffer[0] = 0x06
  responseCodeBuffer[1] = 0x12
  responseCodeBuffer.copy(responseBuffer)

  return responseBuffer
}

function processCMD () {
  var responseBuffer = new Buffer(155)
  var responseCodeBuffer = new Buffer(2)
  responseBuffer.fill(0)

  responseBuffer[2] = 0x00
  responseBuffer[3] = 0x97

  for (var i = 4; i < responseBuffer.length; i++) {
    responseBuffer[i] = nps.toHex((Math.random() * 90 | 65) + 1)
  }

  // User ID
  responseBuffer[4] = 0x00
  responseBuffer[5] = 0x00
  responseBuffer[6] = 0x00
  responseBuffer[7] = 0x01

  // Response Code
  // 120h = Success
  responseCodeBuffer.fill(0)
  responseCodeBuffer[0] = 0x06
  responseCodeBuffer[1] = 0x12
  responseCodeBuffer.copy(responseBuffer)

  return responseBuffer
}

module.exports = {
  npsResponse_ConnectServer,
  npsResponse_GameSelectPersona,
  processCMD
}
