var crypto = require('crypto')
var nps = require('../nps/nps.js')
var npsServer = require('../nps/server.js')

var SERVER_PORT_PERSONA = 8228

function initServer () {
  npsServer.initServer(SERVER_PORT_PERSONA, listener)
}

function listener (sock) {
  console.log('client connected: ' + SERVER_PORT_PERSONA)

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

  var responseBuffer
  var responseCodeBuffer = new Buffer(2)

  switch (requestCode) {
    case '(0x0503)NPS_REQUEST_SELECT_GAME_PERSONA':
      responseBuffer = new Buffer(44975)
      responseBuffer.fill(0)

      // responseBuffer = crypto.randomBytes(responseBuffer.length)

      // Response Code
      // 207 = success
      responseCodeBuffer.fill(0)
      responseCodeBuffer[0] = 0x02
      responseCodeBuffer[1] = 0x07
      responseCodeBuffer.copy(responseBuffer)

      responseBuffer[2] = 0xAF
      responseBuffer[3] = 0xAF

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
      break
    case '(0x0532)NPS_REQUEST_GET_PERSONA_MAPS':
      responseBuffer = npsResponse_GetPersonaMaps()

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
      break
    case '(0x0519)NPS_REQUEST_GET_PERSONA_INFO_BY_NAME':
      responseBuffer = new Buffer(48380)
      responseBuffer.fill(0)

      // Response Code
      // 607 = name Not Availiable
      // 611 = failure, no error returned
      // 602 = failure, no error returned
      responseCodeBuffer.fill(0)
      responseCodeBuffer[0] = 0x06
      responseCodeBuffer[1] = 0x07
      responseCodeBuffer.copy(responseBuffer)

      responseBuffer[2] = 0xAF
      responseBuffer[3] = 0xAF

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
      break
    default:
      responseBuffer = new Buffer(4)
      responseBuffer.fill(0)

      nps.dumpRequest(this.sock, data, requestCode)

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

function npsResponse_GetPersonaMaps () {
  var responseBuffer = new Buffer(516)
  var responseCodeBuffer = new Buffer(2)
  responseBuffer.fill(0)

  responseBuffer[2] = 0x01
  responseBuffer[3] = 0x00

  // for (var i = 4; i < responseBuffer.length; i++) {
  //   responseBuffer[i] = nps.toHex((Math.random() * 90 | 65) + 1)
  // }

  // This is the persona count
  responseBuffer[12] = 0x00
  responseBuffer[13] = 0x01

  // This is the persona count
  responseBuffer[14] = 0x00
  responseBuffer[15] = 0x06

  // PersonaId
  responseBuffer[20] = 0x00
  responseBuffer[21] = 0x00
  responseBuffer[22] = 0x00
  responseBuffer[23] = 0x01

  // Shard ID
  responseBuffer[24] = 0x00
  responseBuffer[25] = 0x00
  responseBuffer[26] = 0x00
  responseBuffer[27] = 0x2C

  // Persona Name = 30-bit null terminated string
  responseBuffer[34] = 0x44
  responseBuffer[35] = 0x6F
  responseBuffer[36] = 0x63
  responseBuffer[37] = 0x20

  responseBuffer[38] = 0x42
  responseBuffer[39] = 0x72
  responseBuffer[40] = 0x6F
  responseBuffer[41] = 0x77

  responseBuffer[42] = 0x6E
  responseBuffer[43] = 0x00
  responseBuffer[44] = 0x00
  responseBuffer[45] = 0x00

  responseBuffer[46] = 0x00
  responseBuffer[47] = 0x00
  responseBuffer[48] = 0x00
  responseBuffer[49] = 0x00

  responseBuffer[50] = 0x00
  responseBuffer[51] = 0x00
  responseBuffer[52] = 0x00
  responseBuffer[53] = 0x00

  responseBuffer[54] = 0x00
  responseBuffer[55] = 0x00
  responseBuffer[56] = 0x00
  responseBuffer[57] = 0x00

  responseBuffer[58] = 0x00
  responseBuffer[59] = 0x00
  responseBuffer[60] = 0x00
  responseBuffer[61] = 0x00

  responseBuffer[62] = 0x00
  responseBuffer[63] = 0x00
  responseBuffer[64] = 0x00

  // Response Code
  responseCodeBuffer.fill(0)
  responseCodeBuffer[0] = 0x06
  responseCodeBuffer[1] = 0x07
  responseCodeBuffer.copy(responseBuffer)

  return responseBuffer
}

module.exports = {
  initServer: initServer
}
