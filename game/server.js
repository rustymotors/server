var crypto = require('crypto')
var nps = require('../nps/nps.js')
var npsServer = require('../nps/server.js')

var SERVER_PORT_LOBBY = 7003

function initServer () {
  npsServer.initServer(SERVER_PORT_LOBBY, listener)
}

function listener (sock) {
  console.log('client connected: ' + SERVER_PORT_LOBBY)

  // Add a 'data' event handler to this instance of socket
  sock.on('data', onData.bind({
    sock: sock
  }))

  // Add a 'close' event handler to this instance of socket
  sock.on('close', function (data) {
    console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort)
  })
  // Add a 'error' event handler to this instance of socket
  sock.on('error', function (err) {
    console.log('ERROR: ' + err)
  })
}

function onData (data) {
  var requestCode = nps.getRequestCode(data)
  nps.dumpRequest(this.sock, data, requestCode)

  var responseBuffer

  switch (requestCode) {
    case '(0x0100)NPS_REQUEST_GAME_CONNECT_SERVER':
      responseBuffer = npsResponse_ConnectServer()

      console.log('Response Length: ' + responseBuffer.length)
      // console.log('Response Data: ' + responseBuffer.toString('hex'))
      var strDebug_responseBytes = 'Response Code: '
      for (var iByte = 0; iByte < 32; iByte++) {
        strDebug_responseBytes += nps.toHex(responseBuffer[iByte]) + ' '
      }
      console.log(strDebug_responseBytes)
      this.sock.write(responseBuffer)
      break
    case '(0x1101)NPSSendCommand':
      var cmdReply = processCMD(requestCode, data)

      console.log('Response Length: ' + cmdReply.length)
      // console.log('Response Data: ' + responseBuffer.toString('hex'))
      strDebug_responseBytes = 'Response Code: '
      for (var iCmdReplyByte = 0; iCmdReplyByte < 32; iCmdReplyByte++) {
        strDebug_responseBytes += nps.toHex(cmdReply[iCmdReplyByte]) + ' '
      }
      console.log(strDebug_responseBytes)
      this.sock.write(cmdReply)
      break
    default:
      responseBuffer = new Buffer(4)
      responseBuffer.fill(0)

      console.log('Response Length: ' + responseBuffer.length)
      // console.log('Response Data: ' + responseBuffer.toString('hex'))
      console.log('Response Code: ' + nps.toHex(responseBuffer[0]) +
        nps.toHex(responseBuffer[1]) +
        nps.toHex(responseBuffer[2]) +
        nps.toHex(responseBuffer[3]) +
        nps.toHex(responseBuffer[4]) +
        nps.toHex(responseBuffer[5]) +
        nps.toHex(responseBuffer[6]) +
        nps.toHex(responseBuffer[7])
      )
      this.sock.write(responseBuffer)
  }
}

var loginResponseBuffer = new Buffer(155)
loginResponseBuffer.fill(0)
loginResponseBuffer = crypto.randomBytes(loginResponseBuffer.length)

function npsResponse_ConnectServer () {
  var responseBuffer = new Buffer(155)
  var responseCodeBuffer = new Buffer(2)
  responseBuffer.fill(0)

  loginResponseBuffer.copy(responseBuffer)

  responseBuffer[2] = 0x00
  responseBuffer[3] = 0x97

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
  loginResponseBuffer = responseBuffer

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
  initServer: initServer
}
