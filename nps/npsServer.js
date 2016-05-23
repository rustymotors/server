var net = require('net')
const dgram = require('dgram')
var crypto = require('crypto')
var nps = require('./nps.js')
var personaServer = require('../persona/server.js')
var gameServer = require('../game/server.js')

var NPS_LISTEN_PORTS_TCP = ['7003', '8226', '8227', '8228', '43300']

function initServer () {
  for (var tcp_port = 0; tcp_port < NPS_LISTEN_PORTS_TCP.length; tcp_port++) {
    net.createServer(npsListener).listen(NPS_LISTEN_PORTS_TCP[tcp_port], function () {
      // console.log('NPS Server listening on TCP port: ' + this.address().port)
    })
  }
  // TCP 9000 = 9499
  // for (var tcp_port_range = 9000; tcp_port_range < 9500; tcp_port_range++) {
  //   net.createServer(npsListener).listen(tcp_port_range, function () {
  //     // console.log('NPS Server listening on TCP port: ' + this.address().port)
  //   })
  // }
  // // UDP 9500 - 9999
  // for (var udp_port_range = 9500; udp_port_range < 10000; udp_port_range++) {
  //   dgram.createSocket('udp4')
  //     .on('error', udpErrorHandler)
  //     .on('message', udpMessageHandler)
  //     .on('listening', udpListiner)
  //     .bind(udp_port_range)
  // }
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

    switch (requestCode) {
      case '(0x0501)NPS_REQUEST_USER_LOGIN':
        responseBuffer = new Buffer(48380)
        responseBuffer.fill(0)

        responseBuffer = crypto.randomBytes(responseBuffer.length)

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
        break
      case '(0x0503)NPS_REQUEST_SELECT_GAME_PERSONA':
        responseBuffer = new Buffer(44975)
        responseBuffer.fill(0)

        // Response Code
        // 207 = success
        responseCodeBuffer.fill(0)
        responseCodeBuffer[0] = 0x02
        responseCodeBuffer[1] = 0x07
        responseCodeBuffer.copy(responseBuffer)

        responseBuffer[2] = 0xAF
        responseBuffer[3] = 0xAF

        for (var j = 4; j < responseBuffer.length; j++) {
          responseBuffer[j] = nps.randomValueHex(1)
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
        break
      case '(0x0100)NPS_REQUEST_GAME_CONNECT_SERVER':
        responseBuffer = gameServer.npsResponse_ConnectServer()

        nps.dumpRequest(sock, data, requestCode)

        console.log('Response Length: ' + responseBuffer.length)
        // console.log('Response Data: ' + responseBuffer.toString('hex'))
        var strDebug_responseBytes = 'Response Code: '
        for (var iByte = 0; iByte < 32; iByte++) {
          strDebug_responseBytes += nps.toHex(responseBuffer[iByte]) + ' '
        }
        console.log(strDebug_responseBytes)
        sock.write(responseBuffer)
        break
      case '(0x0532)NPS_REQUEST_GET_PERSONA_MAPS':
        responseBuffer = personaServer.npsResponse_GetPersonaMaps()

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
        responseCodeBuffer[1] = 0x01
        responseCodeBuffer.copy(responseBuffer)

        responseBuffer[2] = 0xAF
        responseBuffer[3] = 0xAF

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
        break
      case '(0x1101)NPSSendCommand':
        var cmdReply = gameServer.processCMD(requestCode, data)

        nps.dumpRequest(sock, data, requestCode)

        console.log('Response Length: ' + cmdReply.length)
        // console.log('Response Data: ' + responseBuffer.toString('hex'))
        strDebug_responseBytes = 'Response Code: '
        for (var iCmdReplyByte = 0; iCmdReplyByte < 32; iCmdReplyByte++) {
          strDebug_responseBytes += nps.toHex(cmdReply[iCmdReplyByte]) + ' '
        }
        console.log(strDebug_responseBytes)
        sock.write(cmdReply)
        break
      // case 'p2pool':
      //   return
      default:
        responseBuffer = new Buffer(4)
        responseBuffer.fill(0)

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
    }
  })

  // Add a 'error' event handler to this instance of socket
  sock.on('error', function (err) {
    console.log('ERROR: ' + err)
  })
}

module.exports = {
  initServer: initServer
}
