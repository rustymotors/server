var crypto = require('crypto')
var net = require('net')
var nps = require('./nps/nps.js')

function init (port, listenerCB) {
  try {
    nps.initCrypto()
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

function start (ports) {
  try {
    for (var i = 0; i < ports.length; i++) {
      net.createServer(listener).listen(ports[i], function () {
        console.log('NPS Server listening on TCP port: ' + this.address().port)
      })
    }
  } catch (e) {
    console.log(e)
    process.exit()
  }
}

function listener (sock) {
  console.log('client connected: ' + sock.address().port)

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

  var responseCodeBuffer = new Buffer(2).fill(0)

  switch (requestCode) {
    case '(0x0501)NPS_REQUEST_USER_LOGIN':
      nps.setContextIdFromRequest(data)
      var customer = nps.npsGetCustomerIdByContextId(nps.contextId)
      nps.dumpRequest(this.sock, data, requestCode)

      // Write the data back to the socket, the client will receive it as data from the server
      // var responseBuffer = new Buffer(48380) // 48376 + 4 = Lyve
      var responseBuffer = new Buffer(44975).fill(0) // 44971 + 4 = Debug

      responseBuffer = crypto.randomBytes(responseBuffer.length)

      // Response Code
      responseCodeBuffer[0] = 0x06
      responseCodeBuffer[1] = 0x01
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
      customer.customerId.copy(responseBuffer, 12)
//      customerIdBuffer.copy(responseBuffer, 12)

      nps.decryptSessionKey(data.slice(52, -10))

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
      this.sock.write(responseBuffer)

    // sock.end()
    // Wants 4 bytes back
    //   NPSUserLogin: Error in ReceiveFromSocket, short read msgId: 61375 Len: 6 m_MsgLen: 48380
      break
    case '(0x0503)NPS_REQUEST_SELECT_GAME_PERSONA':
      responseBuffer = new Buffer(44975).fill(0)

      // responseBuffer = crypto.randomBytes(responseBuffer.length)

      // Response Code
      // 207 = success
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
      nps.setCustomerIdFromRequest(data)
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
    case '(0x0533)NPSValidatePersonaName': // debug
    case '(0x0519)NPS_REQUEST_GET_PERSONA_INFO_BY_NAME':
      responseBuffer = new Buffer(48380).fill(0)

      // Response Code
      // 607 = name Not Availiable / general error on debug
      // 611 = failure, no error returned / Missing game room on debug
      // 602 = failure, no error returned / general error on debug
      responseCodeBuffer[0] = 0x06
      responseCodeBuffer[1] = 0x01
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
    case '(0x0100)NPS_REQUEST_GAME_CONNECT_SERVER':
      responseBuffer = npsResponse_ConnectServer()
      console.log('Response Length: ' + responseBuffer.length)
      // console.log('Response Data: ' + responseBuffer.toString('hex'))
      var strDebug_responseBytes = 'Response Code: '
      // for (var iByte = 0; iByte < 32; iByte++) {
      //   strDebug_responseBytes += nps.toHex(responseBuffer[iByte]) + ' '
      // }
      console.log(strDebug_responseBytes)
      this.sock.write(responseBuffer)
      break
    case '(0x0534)NPSCheckToken':
      responseBuffer = new Buffer(48380).fill(0)

      // Response Code
      // 207 = success on debug
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
    case '(0x1101)NPSSendCommand':
      var cmdReply = processCMD(requestCode, data)
      console.log('cmd: ' + nps.decryptCmd(new Buffer(data.slice(4))))

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
      responseBuffer = new Buffer(10).fill(0)

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
  var persona = nps.npsGetPersonaMapsByCustomerId()
  var responseBuffer = new Buffer(516).fill(0)
  var responseCodeBuffer = new Buffer(2).fill(0)

  responseBuffer[2] = 0x01
  responseBuffer[3] = 0x00

  for (var i = 4; i < responseBuffer.length; i++) {
    responseBuffer[i] = nps.toHex((Math.random() * 90 | 65) + 1)
  }

  // This is the persona count
  responseBuffer[12] = 0x00
  responseBuffer[13] = 0x01

  // This is the max persona count
  responseBuffer[14] = 0x00
  responseBuffer[15] = 0x06

  // PersonaId
  var emptyId = new Buffer(4).fill(0)
  emptyId.copy(responseBuffer, 20)
  persona.id.copy(responseBuffer, 20)
  // responseBuffer[20] = 0x00
  // responseBuffer[21] = 0x00
  // responseBuffer[22] = 0x00
  // responseBuffer[23] = 0x01

  // Shard ID
  responseBuffer[24] = 0x00
  responseBuffer[25] = 0x00
  responseBuffer[26] = 0x00
  responseBuffer[27] = 0x2C

  // Persona Name = 30-bit null terminated string
  var emptyName = new Buffer(30).fill(0)
  emptyName.copy(responseBuffer, 34)
  persona.name.copy(responseBuffer, 34)
  // responseBuffer[34] = 0x44
  // responseBuffer[35] = 0x6F
  // responseBuffer[36] = 0x63
  // responseBuffer[37] = 0x20
  //
  // responseBuffer[38] = 0x42
  // responseBuffer[39] = 0x72
  // responseBuffer[40] = 0x6F
  // responseBuffer[41] = 0x77
  //
  // responseBuffer[42] = 0x6E
  // responseBuffer[43] = 0x00
  // responseBuffer[44] = 0x00
  // responseBuffer[45] = 0x00
  //
  // responseBuffer[46] = 0x00
  // responseBuffer[47] = 0x00
  // responseBuffer[48] = 0x00
  // responseBuffer[49] = 0x00
  //
  // responseBuffer[50] = 0x00
  // responseBuffer[51] = 0x00
  // responseBuffer[52] = 0x00
  // responseBuffer[53] = 0x00
  //
  // responseBuffer[54] = 0x00
  // responseBuffer[55] = 0x00
  // responseBuffer[56] = 0x00
  // responseBuffer[57] = 0x00
  //
  // responseBuffer[58] = 0x00
  // responseBuffer[59] = 0x00
  // responseBuffer[60] = 0x00
  // responseBuffer[61] = 0x00
  //
  // responseBuffer[62] = 0x00
  // responseBuffer[63] = 0x00
  // responseBuffer[64] = 0x00

  // Response Code
  responseCodeBuffer[0] = 0x06
  responseCodeBuffer[1] = 0x07
  responseCodeBuffer.copy(responseBuffer)

  return responseBuffer
}

function npsResponse_ConnectServer () {
  // var responseBuffer = new Buffer(155)
  var responseBuffer = new Buffer(8).fill(0)
  var responseCodeBuffer = new Buffer(2).fill(0)

  // loginResponseBuffer.copy(responseBuffer)

  responseBuffer[2] = 0x00

  // responseBuffer[3] = 0x97
  responseBuffer[3] = 0x06

  // User ID
  responseBuffer[4] = 0x00
  responseBuffer[5] = 0x00
  responseBuffer[6] = 0x00
  responseBuffer[7] = 0x01

  // Response Code
  // 120h = Success
  responseCodeBuffer[0] = 0x01
  responseCodeBuffer[1] = 0x20
  responseCodeBuffer.copy(responseBuffer)
  // loginResponseBuffer = responseBuffer

  return responseBuffer
}

function processCMD () {
  var responseBuffer = new Buffer(155).fill(0)
  var responseCodeBuffer = new Buffer(2).fill(0)

  responseBuffer[2] = 0x00
  responseBuffer[3] = 0x97

  // for (var i = 4; i < responseBuffer.length; i++) {
  //   responseBuffer[i] = nps.toHex((Math.random() * 90 | 65) + 1)
  // }

  // User ID
  responseBuffer[4] = 0x00
  responseBuffer[5] = 0x00
  responseBuffer[6] = 0x00
  responseBuffer[7] = 0x01

  // Response Code
  // 120h = Success
  responseCodeBuffer[0] = 0x06
  responseCodeBuffer[1] = 0x12
  responseCodeBuffer.copy(responseBuffer)

  return responseBuffer
}

module.exports = {
  init: init,
  start: start
}
