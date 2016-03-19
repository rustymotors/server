var crypto = require('crypto')
var net = require('net')
const dgram = require('dgram')

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
    var requestCode = getRequestCode(data)

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
        responseBuffer = new Buffer(516)
        responseBuffer.fill(0)

        responseBuffer[2] = 0x01
        responseBuffer[3] = 0x00

        for (var i = 4; i < 517; i++) {
          responseBuffer[i] = crypto.randomBytes(1)
          if (responseBuffer[i] === 0x00) {
            responseBuffer[i] = 0x02
          }
        }

        // This is the persona count
        responseBuffer[12] = 0x00
        responseBuffer[13] = 0x01

        // Response Code
        responseCodeBuffer.fill(0)
        responseCodeBuffer[0] = 0x06
        responseCodeBuffer[1] = 0x07
        responseCodeBuffer.copy(responseBuffer)

        // CustomerId
        // var customerIdBuffer = new Buffer(4)
        // customerIdBuffer.fill(0)
        // customerIdBuffer[0] = 0xAB
        // customerIdBuffer[1] = 0x01
        // customerIdBuffer[2] = 0x00
        // customerIdBuffer[3] = 0x00
        // customerIdBuffer.copy(responseBuffer, 12)

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
    dumpRequest(sock, data, requestCode)

    console.log('Response Length: ' + responseBuffer.length)
    // console.log('Response Data: ' + responseBuffer.toString('hex'))
    console.log('Response Code: ' + toHex(responseBuffer[0]) +
      toHex(responseBuffer[1]) +
      toHex(responseBuffer[2]) +
      toHex(responseBuffer[3]) +
      toHex(responseBuffer[4]) +
      toHex(responseBuffer[5]) +
      toHex(responseBuffer[6]) +
      toHex(responseBuffer[7])
    )
    sock.write(responseBuffer)
  })

  // Add a 'error' event handler to this instance of socket
  sock.on('error', function (err) {
    var e = err; e = ''; console.log(e)
    // console.log('ERROR: ' + err)
  })
}

function getRequestCode (rawBuffer) {
  var requestCode = toHex(rawBuffer[0]) + toHex(rawBuffer[1])
  switch (requestCode) {
    case '0501':
      return 'NPS_REQUEST_USER_LOGIN'
    case '0519':
      return 'NPS_REQUEST_GET_PERSONA_INFO_BY_NAME'
    case '0532':
      return 'NPS_REQUEST_GET_PERSONA_MAPS'
    case '2472':
    case '7B22':
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
  initServer: initServer
}
