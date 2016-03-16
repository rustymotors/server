var net = require('net')
var nps = require('../nps/nps.js')

var SERVER_PORT_LOGIN = 8226

var SERVER_LOGIN_m_MsgLen = 48380

var loginServer

function initServer () {
  loginServer = net.createServer(function (sock) { // connection' listener
    console.log('client connected: ' + SERVER_PORT_LOGIN)

    // Add a 'data' event handler to this instance of socket
    sock.on('data', function (data) {
      console.log('-----------------------------------------')
      console.log('Request Code: ' + nps.npsGetRequestCodeToBuffer(data))
      console.log('-----------------------------------------')
      console.log('DATA ' + sock.remoteAddress + ': ' + data)
      console.log('=========================================')
      console.log('DATA ' + sock.remoteAddress + ': ' + data.toString('hex'))
      console.log('-----------------------------------------')
      // Write the data back to the socket, the client will receive it as data from the server
      var tmp = new Buffer(SERVER_LOGIN_m_MsgLen)
      // Set MsgID: 2 bytes
      tmp = nps.npsSetResponseCodeToBuffer(tmp, 'NPS_AUTH_OK')

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
  loginServer.listen(SERVER_PORT_LOGIN, function () { // listening' listener
    console.log('server bound ' + SERVER_PORT_LOGIN)
  })
}

module.exports = {
  initServer: initServer
}
