/* External dependencies */
var crypto = require('crypto')
var net = require('net')
var express = require('express')
var http = require('http')
var https = require('https')
var fs = require('fs')
var sslConfig = require('ssl-config')('old')

var bodyParser = require('body-parser')

/* Internal dependencies */
var config = require('./config.json')
var logger = require('./src/logger.js')
var nps = require('./src/nps.js')
var packet = require('./src/packet.js')
const patchServer = require('./src/patch_server.js')

var key = fs.readFileSync('./data/private_key.pem')
var cert = fs.readFileSync('./data/cert.pem')
// var cert = fs.readFileSync('./cert.pem')
var httpsOptions = {
  key: key,
  cert: cert,
  rejectUnauthorized: false,
  ciphers: sslConfig.ciphers,
  honorCipherOrder: true,
  secureOptions: sslConfig.minimumTLSVersion
}

function start (ports) {
  try {
    for (var i = 0; i < ports.length; i++) {
      net.createServer(listener).listen(ports[i], function () {
        logger.info('NPS Server listening on TCP port: ' + this.address().port)
      })
    }
  } catch (e) {
    logger.error(e)
    process.exit()
  }
}

function listener (sock) {
  logger.info('client connected: ' + sock.address().port)

  // Add a 'data' event handler to this instance of socket
  sock.on('data', onData.bind({ sock: sock }))

  // Add a 'close' event handler to this instance of socket
  sock.on('close', function (data) {
    logger.info('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort)
  })
  // Add a 'error' event handler to this instance of socket
  sock.on('error', function (err) {
    if (err.code !== 'ECONNRESET') {
      logger.error(err)
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
      packetresult = packet.buildPacket(48380, 0x0602, packetcontent)

      nps.dumpResponse(packetresult, 16)
      this.sock.write(packetresult)

      // Response Code
      // 607 = name Not Availiable / general error on debug
      // 611 = failure, no error returned / Missing game room on debug
      // 602 = failure, no error returned / general error on debug **WORKS
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

      logger.debug('cmd: ' + nps.decryptCmd(new Buffer(data.slice(4))).toString('hex'))

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
      logger.debug('cmd: ' + nps.decryptCmd(new Buffer(data.slice(4))).toString('hex'))

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
      nps.isUserCreated = true

      // Create the packet content
      packetcontent = crypto.randomBytes(44971)

      // This is needed, not sure for what
      Buffer.from([0x01, 0x01]).copy(packetcontent)

      // Build the packet
      packetresult = packet.buildPacket(10, 0x0612, packetcontent)

      nps.dumpResponse(packetresult, 16)
      this.sock.write(packetresult)
  }
}

/* Initialize the crypto */
try {
  nps.initCrypto()
} catch (err) {
  nps.logger.error(err)
  process.exit(1)
}

/* Start the NPS servers */
start(config.server_ports)

/* Start the Patch server */
var app = express()

/* Start the AuthLogin server */

app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

// Server port is set by PORT env or web_port from config file with fallback to 3000
app.set('port', process.env.PORT || config.web_port || 80)
app.set('port_ssl', process.env.PORT_SSL || config.web_port_ssl || 443)

app.post('/games/EA_Seattle/MotorCity/UpdateInfo', function (req, res) {
  const response = patchServer.patchUpdateInfo(req)
  res.set(response.headers)
  res.send(response.body)
})

app.post('/games/EA_Seattle/MotorCity/NPS', function (req, res) {
  const response = patchServer.patchNPS(req)
  res.set(response.headers)
  res.send(response.body)
})

app.post('/games/EA_Seattle/MotorCity/MCO', function (req, res) {
  const response = patchServer.patchMCO(req)
  res.set(response.headers)
  res.send(response.body)
})

app.get('/AuthLogin', function (req, res) {
  console.log(req.method)
  console.log(req.url)
  res.set('Content-Type', 'text/plain')
  res.send('Valid=TRUE\nTicket=d316cd2dd6bf870893dfbaaf17f965884e')
})

// echo "[Twin Pines Mall]\n";
// echo "Description=Twin Pines Mall\n";
// echo "ShardId=88\n";
// echo "LoginServerIP=163.172.11.141\n";
// echo "LoginServerPort=8226\n";
// echo "LobbyServerIP=163.172.11.141\n";
// echo "LobbyServerPort=7003\n";
// echo "MCOTSServerIP=163.172.11.141\n";
// echo "StatusId=0\n";
// echo "Status_Reason=\n";
// echo "ServerGroup_Name=Group - 1\n";
// echo "Population=88\n";
// echo "MaxPersonasPerUser=2\n";
// echo "DiagnosticServerHost=mco.blocksplorer.com\n";
// echo "DiagnosticServerPort=80\n";
// echo "\n";
// Old IP = 108.183.123.230
var serverIP = '192.168.1.127'
var shardList =
  '[The Clocktower]\n' +
  'Description=The Clocktower\n' +
  'ShardId=44\n' +
  'LoginServerIP=' + serverIP + '\n' +
  'LoginServerPort=8226\n' +
  'LobbyServerIP=' + serverIP + '\n' +
  'LobbyServerPort=7003\n' +
  'MCOTSServerIP=' + serverIP + '\n' +
  'StatusId=0\n' +
  'Status_Reason=\n' +
  'ServerGroup_Name=Group - 1\n' +
  'Population=88\n' +
  'MaxPersonasPerUser=2\n' +
  'DiagnosticServerHost=' + serverIP + '\n' +
  'DiagnosticServerPort=80'

app.get('/ShardList/', function (req, res) {
  console.log(req.method)
  console.log(req.url)
  res.set('Content-Type', 'text/plain')
  res.send(shardList)
})

app.get('/key', function (req, res) {
  console.log(req.method)
  console.log(req.url)

  var key = fs.readFileSync('./data/pub.key').toString('hex')
  res.setHeader('Content-disposition', 'attachment; filename=pub.key')
  res.write(key)
  res.end()
})

app.use(function (req, res) {
  console.dir(req.headers)
  console.log(req.method)
  console.log(req.url)
  res.send('404')
})
// app.use(express.static('public'))

http.createServer(app).listen(app.get('port'), function () {
  logger.info('Patch server listening on port ' + app.get('port'))
})

var httpsServer = https.createServer(httpsOptions, app).listen(app.get('port_ssl'), function () {
  logger.info('AuthLogin server listening on port ' + app.get('port_ssl'))
})

httpsServer.on('connection', function (socket) {
  console.log('New SSL connection')
  socket.on('error', function (error) {
    console.log('Socket Error: ' + error.message)
  })
  socket.on('close', function () {
    console.log('Socket Connection closed')
  })
})

httpsServer.on('error', function (error, socket) {
  console.log('Error: ' + error)
})

httpsServer.on('tlsClientError', function (err, sock) {
  console.log(err)
})

