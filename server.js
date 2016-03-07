var net = require('net')
var server = net.createServer(function (sock) { // connection' listener
  console.log('client connected')

  // Add a 'data' event handler to this instance of socket
  sock.on('data', function (data) {
    console.log('DATA ' + sock.remoteAddress + ': ' + data)
    // Write the data back to the socket, the client will receive it as data from the server
    sock.write('You said "' + data + '"')
  })

  // Add a 'close' event handler to this instance of socket
  sock.on('close', function (data) {
    console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort)
  })
})
server.listen(8226, function () { // listening' listener
  console.log('server bound')
})
