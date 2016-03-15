var net = require('net')

var m_MsgLen = 48380

var server = net.createServer(function (sock) { // connection' listener
  console.log('client connected')

  // Add a 'data' event handler to this instance of socket
  sock.on('data', function (data) {
    console.log('-----------------------------------------')
    console.log('DATA ' + sock.remoteAddress + ': ' + data)
    console.log('=========================================')
    console.log('DATA ' + sock.remoteAddress + ': ' + data.toString('hex'))
    console.log('-----------------------------------------')
    // Write the data back to the socket, the client will receive it as data from the server
    var tmp = new Buffer(m_MsgLen - 2)
    // Set MsgID: 2 bytes

    // Return Code
    console.log(tmp.length)
    console.log(tmp[0].toString(16) + ' ' +
      tmp[1].toString(16) + ' ' +
      tmp[2].toString(16) + ' ' +
      tmp[3].toString(16) + ' ' +
      tmp[4].toString(16) + ' ' +
      tmp[5].toString(16))
      // Send NPS Response code
    tmp = npsAddResponseCodeToBuffer(tmp, 'NPS_AUTH_OK')
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
server.listen(8226, function () { // listening' listener
  console.log('server bound')
})

function npsAddResponseCodeToBuffer (buff, responseCode) {
  switch (responseCode) {
    // hex 601 = ok
    case 'NPS_AUTH_OK':
      buff[0] = 0x06
      buff[1] = 0x01
      return buff
    // hex 623 = problem with account
    case 'NPS_AUTH_DENIED':
      buff[0] = 0x06
      buff[1] = 0x23
      return buff
    default:
      return buff
  }
}
