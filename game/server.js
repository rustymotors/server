var net = require('net')
var nps = require('../nps/nps.js')

var SERVER_PORT_GAME = 7223

var SERVER_GAME_m_MsgLen = 50652

var gameServer

function initServer () {
  gameServer = net.createServer(function (sock) { // connection' listener
    console.log('client connected: ' + SERVER_PORT_GAME)

    // Add a 'data' event handler to this instance of socket
    sock.on('data', function (data) {
      var requestCode = nps.npsGetRequestCodeToBuffer(data)
      console.log('-----------------------------------------')
      console.log('Request Code: ' + requestCode)
      console.log('-----------------------------------------')
      console.log('DATA ' + sock.remoteAddress + ': ' + data)
      console.log('=========================================')
      console.log('DATA ' + sock.remoteAddress + ': ' + data.toString('hex'))
      console.log('-----------------------------------------')
      // Write the data back to the socket, the client will receive it as data from the server
      var tmp = new Buffer(SERVER_GAME_m_MsgLen)
      // Set MsgID: 2 bytes
      tmp = nps.npsRequestResponse(tmp, requestCode)
      tmp[2] = 0x00
      tmp[3] = 0x00

      // Return Code
      console.log(tmp.length)
      console.log(tmp[0].toString(16) + ' ' +
        tmp[1].toString(16) + ' ' +
        tmp[2].toString(16) + ' ' +
        tmp[3].toString(16) + ' ' +
        tmp[4].toString(16) + ' ' +
        tmp[5].toString(16))
      // Send NPS Response code
      sock.write(tmp)
      // sock.end()
      // Wants 4 bytes back
      //   NPSUserLogin: Error in ReceiveFromSocket, short read msgId: 61375 Len: 6 m_MsgLen: 48380
    })

    // Add a 'close' event handler to this instance of socket
    sock.on('close', function (data) {
      console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort)
    })
    // Add a 'error' event handler to this instance of socket
    sock.on('error', function (err) {
      console.log('ERROR: ' + err)
    })
  })
  gameServer.listen(SERVER_PORT_GAME, function () { // listening' listener
    console.log('server bound: ' + SERVER_PORT_GAME)
  })
}

module.exports = {
  initServer: initServer
}
