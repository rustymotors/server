var net = require('net')
const dgram = require('dgram')
var nps = require('./nps.js')
var personaServer = require('../persona/server.js')

var NPS_LISTEN_PORTS_TCP = ['7003', '8226', '8227', '8228', '43300']

function initServer () {
  for (var tcp_port = 0; tcp_port < NPS_LISTEN_PORTS_TCP.length; tcp_port++) {
    net.createServer(npsListener).listen(NPS_LISTEN_PORTS_TCP[tcp_port], function () {
      // console.log('NPS Server listening on TCP port: ' + this.address().port)
    })
  }
  // TCP 9000 = 9499
  for (var tcp_port_range = 9000; tcp_port_range < 9500; tcp_port_range++) {
    net.createServer(npsListener).listen(tcp_port_range, function () {
      // console.log('NPS Server listening on TCP port: ' + this.address().port)
    })
  }
  // UDP 9500 - 9999
  for (var udp_port_range = 9500; udp_port_range < 10000; udp_port_range++) {
    dgram.createSocket('udp4')
      .on('error', udpErrorHandler)
      .on('message', udpMessageHandler)
      .on('listening', udpListiner)
      .bind(udp_port_range)
  }
}

function udpErrorHandler (err) {
  console.log(`server error:\n` + err.stack)
  this.close()
}

function udpMessageHandler (msg, rinfo) {
  console.log('server got: ' + msg + ' from ' + rinfo.address + ':' + rinfo.port)
}

function udpListiner () {
  // console.log('NPS Server listening on UDP port: ' + this.address().port)
}

dgram.createSocket('udp4').on('error', udpErrorHandler).on('message', udpMessageHandler).on('listening', udpListiner).bind()

function npsListener (sock) {
  sock.on('data', function (data) {
    var responseBuffer
    var responseCodeBuffer = new Buffer(2)
    var requestCode = nps.getRequestCode(data)

    if (requestCode !== 'p2pool') {
      console.log('client connected: ' + sock.address().port)
    }

    switch (requestCode) {
      case 'NPS_REQUEST_USER_LOGIN':
        responseBuffer = new Buffer(48380)
        responseBuffer.fill(0)

        // Response Code
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

        break
      case 'NPS_REQUEST_GET_PERSONA_MAPS':
        responseBuffer = personaServer.npsResponse_GetPersonaMaps()
        break
      case 'NPS_REQUEST_GET_PERSONA_INFO_BY_NAME':
        responseBuffer = new Buffer(48380)
        responseBuffer.fill(0)

        // Response Code
        // 607 = name Not Availiable
        // 611 = failure, no error returned
        // 602 = failure, no error returned
        responseCodeBuffer.fill(0)
        responseCodeBuffer[0] = 0x06
        responseCodeBuffer[1] = 0x02
        responseCodeBuffer.copy(responseBuffer)

        responseBuffer[2] = 0xAF
        responseBuffer[3] = 0xAF

        // CustomerId
        // var customerIdBuffer = new Buffer(4)
        // customerIdBuffer.fill(0)
        // customerIdBuffer[0] = 0xAB
        // customerIdBuffer[1] = 0x01
        // customerIdBuffer[2] = 0x00
        // customerIdBuffer[3] = 0x00
        // customerIdBuffer.copy(responseBuffer, 12)

        break
      case 'p2pool':
        return
      default:
        responseBuffer = new Buffer(4)
        responseBuffer.fill(0)
    }
    nps.dumpRequest(sock, data, requestCode)

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
    sock.write(responseBuffer)
  })

  // Add a 'error' event handler to this instance of socket
  sock.on('error', function (err) {
    var e = err; e = ''; console.log(e)
    // console.log('ERROR: ' + err)
  })
}

module.exports = {
  initServer: initServer
}
