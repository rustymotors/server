var net = require('net')

var NPS_LISTEN_PORTS = ['8226', '8228', '7003']

function initServer () {
  for (var port = 0; port < NPS_LISTEN_PORTS.length; port++) {
    net.createServer(npsListener).listen(NPS_LISTEN_PORTS[port], function () {
      console.log('NPS Server listening on port: ' + this.address().port)
    })
  }
}

function npsListener (sock) {
  console.log('client connected: ' + sock.address().port)

  sock.on('data', function (data) {
    var responseBuffer = new Buffer(48380)
    var responseCodeBuffer = new Buffer(2)
    responseBuffer.fill(0)
    responseCodeBuffer.fill(0)
    var requestCode = getRequestCode(data)
    switch (requestCode) {
      case 'NPS_REQUEST_USER_LOGIN':
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
        // Response Code
        responseCodeBuffer.fill(0)
        responseCodeBuffer[0] = 0x06
        responseCodeBuffer[1] = 0x07
        responseCodeBuffer.copy(responseBuffer)

    //    responseBuffer[2] = 0xAF
    //    responseBuffer[3] = 0xAF

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
        // Response Code
        // 607 = Not Availiable
        responseCodeBuffer.fill(0)
        responseCodeBuffer[0] = 0x06
        responseCodeBuffer[1] = 0x01
        responseCodeBuffer.copy(responseBuffer)

      //    responseBuffer[2] = 0xAF
      //    responseBuffer[3] = 0xAF

        // CustomerId
        // var customerIdBuffer = new Buffer(4)
        // customerIdBuffer.fill(0)
        // customerIdBuffer[0] = 0xAB
        // customerIdBuffer[1] = 0x01
        // customerIdBuffer[2] = 0x00
        // customerIdBuffer[3] = 0x00
        // customerIdBuffer.copy(responseBuffer, 12)

        break
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
    console.log('ERROR: ' + err)
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

module.exports = {
  initServer: initServer
}
