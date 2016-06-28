var crypto = require('crypto')
var net = require('net')
var nps = require('./nps/nps.js')
var packet = require('./nps/packet.js')

function init (port, listenerCB) {
  try {
    nps.initCrypto()
  } catch (err) {
    nps.logger.error(err)
    process.exit(1)
  }
}

function start (ports) {
  try {
    for (var i = 0; i < ports.length; i++) {
      net.createServer(listener).listen(ports[i], function () {
        nps.logger.info('NPS Server listening on TCP port: ' + this.address().port)
      })
    }
  } catch (e) {
    nps.logger.error(e)
    process.exit()
  }
}

function listener (sock) {
  nps.logger.info('client connected: ' + sock.address().port)

  // Add a 'data' event handler to this instance of socket
  sock.on('data', onData.bind({ sock: sock }))

  // Add a 'close' event handler to this instance of socket
  sock.on('close', function (data) {
    nps.logger.info('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort)
  })
  // Add a 'error' event handler to this instance of socket
  sock.on('error', function (err) {
    if (err.code !== 'ECONNRESET') {
      nps.logger.error(err)
    }
  })
}

function onData (data) {
  var requestCode = nps.getRequestCode(data)

  var customer
  var packetcontent
  var packetresult

  switch (requestCode) {
    case '(0x0501)NPS_REQUEST_USER_LOGIN':
      nps.setContextIdFromRequest(data)
      customer = nps.npsGetCustomerIdByContextId(nps.contextId)
      nps.dumpRequest(this.sock, data, requestCode)

      // Create the packet content
      packetcontent = crypto.randomBytes(44971)

      // This is needed, not sure for what
      Buffer.from([0x01, 0x01]).copy(packetcontent)

      // load the customer id
      customer.customerId.copy(packetcontent, 10)

      // Build the packet
      packetresult = packet.buildPacket(44975, 0x0601, packetcontent)

      nps.decryptSessionKey(data.slice(52, -10))

      nps.dumpResponse(packetresult, 128)
      this.sock.write(packetresult)
      break
    case '(0x503) NPSSelectGamePersona':
      nps.dumpRequest(this.sock, data, requestCode)

      // Create the packet content
      packetcontent = crypto.randomBytes(44971)

      // This is needed, not sure for what
      Buffer.from([0x01, 0x01]).copy(packetcontent)

      // Build the packet
      // Response Code
      // 207 = success
      packetresult = packet.buildPacket(44975, 0x0207, packetcontent)

      nps.dumpResponse(packetresult, 16)
      this.sock.write(packetresult)
      break
    case '(0x0532)NPS_REQUEST_GET_PERSONA_MAPS':
      nps.setCustomerIdFromRequest(data)
      var persona = nps.npsGetPersonaMapsByCustomerId()

      nps.dumpRequest(this.sock, data, requestCode)

      // Create the packet content
      packetcontent = crypto.randomBytes(518)

      // This is needed, not sure for what
      Buffer.from([0x01, 0x01]).copy(packetcontent)

      // This is the persona count
      persona.personacount.copy(packetcontent, 10)

      // This is the max persona count
      persona.maxpersonas.copy(packetcontent, 12)

      // PersonaId
      persona.id.copy(packetcontent, 18)

      // Shard ID
      persona.shardid.copy(packetcontent, 22)

      // Persona Name = 30-bit null terminated string
      persona.name.copy(packetcontent, 32)

      // Build the packet
      packetresult = packet.buildPacket(512, 0x0607, packetcontent)

      nps.dumpResponse(packetresult, 16)
      this.sock.write(packetresult)
      break
    // case '(0x0533)NPSValidatePersonaName': // debug
    case '(0x0519)NPS_REQUEST_GET_PERSONA_INFO_BY_NAME':
      customer = nps.npsGetCustomerIdByContextId(nps.contextId)
      nps.dumpRequest(this.sock, data, requestCode)

      // Create the packet content
      packetcontent = crypto.randomBytes(44976)

      // This is needed, not sure for what
      Buffer.from([0x01, 0x01]).copy(packetcontent)

      // load the customer id
      customer.customerId.copy(packetcontent, 10)

      // Build the packet
      packetresult = packet.buildPacket(48380, 0x0601, packetcontent)

      nps.dumpResponse(packetresult, 16)
      this.sock.write(packetresult)

      // Response Code
      // 607 = name Not Availiable / general error on debug
      // 611 = failure, no error returned / Missing game room on debug
      // 602 = failure, no error returned / general error on debug
      break
    case '(0x0100)NPS_REQUEST_GAME_CONNECT_SERVER':
      customer = nps.npsGetCustomerIdByContextId(nps.contextId)
      console.log(customer)
      nps.dumpRequest(this.sock, data, requestCode)

      // Create the packet content
      // packetcontent = crypto.randomBytes(151)
      packetcontent = Buffer.alloc(6)

      // Server ID
      Buffer.from([0x00]).copy(packetcontent)

      // This is needed, not sure for what
      // if it's 97 it says the username returned is correct
      // if it's 06 it says it's different, but it's random
      // It's parsed by the NPS cipher somehow.
      Buffer.from([0x97]).copy(packetcontent, 1)

      // load the customer id
      customer.userId.copy(packetcontent, 2)

      // RIFF Count = total packet len - 4 for header
      // Buffer.from([0x00, 0x05]).copy(packetcontent, 1490)

      // Build the packet
      packetresult = packet.buildPacket(8, 0x0120, packetcontent)

      nps.dumpResponse(packetresult, 8)
      this.sock.write(packetresult)
      break
    case '(0x1101)NPSSendCommand':
      // 30c = GetMiniRiff
      // 128 = NPSGetMiniUserList

      nps.logger.debug('cmd: ' + nps.decryptCmd(new Buffer(data.slice(4))).toString('hex'))

      nps.dumpRequest(this.sock, data, requestCode)

      // Create the packet content
      packetcontent = crypto.randomBytes(151)

      // This is needed, not sure for what
      Buffer.from([0x01, 0x01]).copy(packetcontent)

      // Build the packet
      packetresult = packet.buildPacket(155, 0x0612, packetcontent)

      nps.dumpResponse(packetresult, 16)
      this.sock.write(packetresult)
      break
    case '(0x050F)NPSLogOutGameUser':
      nps.logger.debug('cmd: ' + nps.decryptCmd(new Buffer(data.slice(4))).toString('hex'))

      nps.dumpRequest(this.sock, data, requestCode)

      // Create the packet content
      packetcontent = crypto.randomBytes(253)

      // This is needed, not sure for what
      Buffer.from([0x01, 0x01]).copy(packetcontent)

      // Build the packet
      packetresult = packet.buildPacket(257, 0x0612, packetcontent)

      nps.dumpResponse(packetresult, 16)
      this.sock.write(packetresult)
      break
    default:
      nps.dumpRequest(this.sock, data, requestCode)

      // Create the packet content
      packetcontent = crypto.randomBytes(44971)

      // This is needed, not sure for what
      Buffer.from([0x01, 0x01]).copy(packetcontent)

      // Build the packet
      packetresult = packet.buildPacket(10, 0x0601, packetcontent)

      nps.dumpResponse(packetresult, 16)
      this.sock.write(packetresult)
  }
}

module.exports = {
  init: init,
  start: start
}
