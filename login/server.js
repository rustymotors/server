var crypto = require('crypto')
var nps = require('../nps/nps.js')
var npsServer = require('../nps/server.js')

var SERVER_PORT_LOGIN = 8226

var SERVER_LOGIN_m_MsgLen = 48380

function initServer () {
  npsServer.initServer(SERVER_PORT_LOGIN, listener)
}

function listener (sock) {
  console.log('client connected: ' + SERVER_PORT_LOGIN)

  // Add a 'data' event handler to this instance of socket
  sock.on('data', onData.bind({ sock: sock }))

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

  // Write the data back to the socket, the client will receive it as data from the server
  var responseBuffer = new Buffer(SERVER_LOGIN_m_MsgLen)
  responseBuffer.fill(0)

  responseBuffer = crypto.randomBytes(responseBuffer.length)

  // Response Code
  var responseCodeBuffer = new Buffer(2)
  responseCodeBuffer.fill(0)
  responseCodeBuffer[0] = 0x06
  responseCodeBuffer[1] = 0x01
  responseCodeBuffer.copy(responseBuffer)

  responseBuffer[2] = 0xAF
  responseBuffer[3] = 0xAF

  // CustomerId
  var customerIdBuffer = new Buffer(4)
  customerIdBuffer.fill(0)
  customerIdBuffer[0] = 0xAB
  customerIdBuffer[1] = 0x01
  customerIdBuffer[2] = 0x00
  customerIdBuffer[3] = 0x00
  customerIdBuffer.copy(responseBuffer, 12)

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

  // sock.end()
  // Wants 4 bytes back
  //   NPSUserLogin: Error in ReceiveFromSocket, short read msgId: 61375 Len: 6 m_MsgLen: 48380
}

module.exports = {
  initServer: initServer
}
