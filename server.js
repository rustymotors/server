'use strict'

/* External dependencies */
const crypto = require('crypto')
const net = require('net')
const app = require('express')()
const https = require('https')
const fs = require('fs')
const sslConfig = require('ssl-config')('old')
const bodyParser = require('body-parser')
const series = require('async/series')

/* Internal dependencies */
const logger = require('./src/logger.js')
const nps = require('./src/nps.js')
const packet = require('./src/packet.js')
const patchServer = require('./src/patch_server.js')

// Config settings
logger.level = 'debug'

const config = {
  'ipServer': 'mc.drazisil.com',
  serverAuthLogin: {
    'name': 'AuthLogin',
    'port': 80
  },
  serverPatch: {
    'name': 'Patch',
    'port': 443
  },
  serverLogin: {
    'name': 'Login',
    'port': 8226
  },
  serverPersona: {
    'name': 'Login',
    'port': 8228
  },
  serverLobby: {
    'name': 'Lobby',
    'port': 7003
  },
  serverDatabase: {
    'name': 'Database',
    'port': 43300
  }
}

const key = fs.readFileSync('./data/private_key.pem')
const cert = fs.readFileSync('./data/cert.pem')

// Setup SSL config
const httpsOptions = {
  key: key,
  cert: cert,
  rejectUnauthorized: false,
  ciphers: sslConfig.ciphers,
  honorCipherOrder: true,
  secureOptions: sslConfig.minimumTLSVersion
}

function start (config, callback) {
  series({
    serverLogin: function (callback) {
      const server = net.createServer(listener)
      server.listen(config.serverLogin.port, function () {
        logger.info(config.serverLogin.name + ' Server listening on TCP port: ' + config.serverLogin.port)
        callback(null, server)
      })
    },
    serverPersona: function (callback) {
      const server = net.createServer(listener)
      server.listen(config.serverPersona.port, function () {
        logger.info(config.serverPersona.name + ' Server listening on TCP port: ' + config.serverPersona.port)
        callback(null, server)
      })
    },
    serverLobby: function (callback) {
      const server = net.createServer(listener)
      server.listen(config.serverLobby.port, function () {
        logger.info(config.serverLobby.name + ' Server listening on TCP port: ' + config.serverLobby.port)
        callback(null, server)
      })
    },
    serverDatabase: function (callback) {
      const server = net.createServer(listener)
      server.listen(config.serverDatabase.port, function () {
        logger.info(config.serverDatabase.name + ' Server listening on TCP port: ' + config.serverDatabase.port)
        callback(null, server)
      })
    }
  }, function (err, results) {
    if (err) { throw err }
    // Not currently using this
    results = null

    callback(null)
  })
}

function listener (sock) {
  logger.info('client connected: ' + sock.address().port)

  const socket = sock

  // Add a 'data' event handler to this instance of socket
  sock.on('data', (data) => {
    onData(socket, data)
  })
  // Add a 'close' event handler to this instance of socket
  sock.on('close', function (data) {
    logger.debug(data)
    logger.info('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort)
  })
  // Add a 'error' event handler to this instance of socket
  sock.on('error', function (err) {
    if (err.code !== 'ECONNRESET') {
      logger.error(err)
    }
  })
}

function onData (sock, data) {
  let requestCode = nps.getRequestCode(data)

  let packetcontent
  let packetresult

  if (requestCode === '(0x0501) NPSUserLogin') {
    let contextId = Buffer.alloc(34)
    data.copy(contextId, 0, 14, 48)
    let customer = nps.npsGetCustomerIdByContextId(contextId)

      // Create the packet content
    packetcontent = crypto.randomBytes(44971)

      // This is needed, not sure for what
    Buffer.from([0x01, 0x01]).copy(packetcontent)

      // load the customer id
    customer.customerId.copy(packetcontent, 10)

      // Build the packet
    packetresult = packet.buildPacket(44975, 0x0601, packetcontent)

    nps.decryptSessionKey(data.slice(52, -10))

      // nps.dumpRequest(this.sock, data, requestCode)
      // nps.dumpResponse(packetresult, 128)
    sock.write(packetresult)
    return
  }

  if (requestCode === '(0x503) NPSSelectGamePersona') {
    nps.dumpRequest(sock, data, requestCode)

      // Create the packet content
    packetcontent = crypto.randomBytes(44971)

      // This is needed, not sure for what
    Buffer.from([0x01, 0x01]).copy(packetcontent)

      // Build the packet
      // Response Code
      // 207 = success
    packetresult = packet.buildPacket(44975, 0x0207, packetcontent)

    nps.dumpResponse(packetresult, 16)
    sock.write(packetresult)
    return
  }

  if (requestCode === '(0x0532) NPSGetPersonaMaps') {
    let customerId = Buffer.alloc(4)
    data.copy(customerId, 0, 12)
    let persona = nps.npsGetPersonaMapsByCustomerId(customerId)

    nps.dumpRequest(sock, data, requestCode)

      // Create the packet content
    packetcontent = crypto.randomBytes(518)

      // This is needed, not sure for what
    Buffer.from([0x01, 0x01]).copy(packetcontent)

      // This is the persona count
    persona.personacount.copy(packetcontent, 10)

      // This is the max persona count
    persona.maxpersonas.copy(packetcontent, 18)

      // PersonaId
    persona.id.copy(packetcontent, 18)

      // Shard ID
    persona.shardid.copy(packetcontent, 22)

      // Persona Name = 30-bit null terminated string
    persona.name.copy(packetcontent, 32)

      // Build the packet
    packetresult = packet.buildPacket(512, 0x0607, packetcontent)

    nps.dumpResponse(packetresult, 512)
    sock.write(packetresult)
    return
  }

  if (requestCode === '(0x0519) NPSGetPersonaInfoByName') {
    let personaName = Buffer.alloc(data.length - 30)
    data.copy(personaName, 0, 30)

    console.log(personaName)

    nps.dumpRequest(sock, data, requestCode)

      // Create the packet content
    packetcontent = crypto.randomBytes(44976)

      // This is needed, not sure for what
    Buffer.from([0x01, 0x01]).copy(packetcontent)

      // Build the packet
    packetresult = packet.buildPacket(48380, 0x0601, packetcontent)

    nps.dumpResponse(packetresult, 16)
    sock.write(packetresult)

      // Response Code
      // 607 = persona name not available
      // 611 = No error, starter car lot
      // 602 = No error, starter car lot
    return
  }

  if (requestCode === '(0x0100) NPS_REQUEST_GAME_CONNECT_SERVER') {
    let contextId = Buffer.alloc(34)
    data.copy(contextId, 0, 14, 48)
    let customer = nps.npsGetCustomerIdByContextId(contextId)
    logger.debug(customer)
    nps.dumpRequest(sock, data, requestCode)

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
    sock.write(packetresult)
    return
  }

  if (requestCode === '(0x1101) NPSSendCommand') {
    logger.debug('cmd: ' + nps.decryptCmd(new Buffer(data.slice(4))).toString('hex'))

    nps.dumpRequest(sock, data, requestCode)

      // Create the packet content
    packetcontent = crypto.randomBytes(151)

      // This is needed, not sure for what
    Buffer.from([0x01, 0x01]).copy(packetcontent)

      // Build the packet
    packetresult = packet.buildPacket(155, 0x0612, packetcontent)

    nps.dumpResponse(packetresult, 16)
    sock.write(packetresult)
    return
  }

  if (requestCode === '(0x050F) NPSLogOutGameUser') {
    logger.debug('cmd: ' + nps.decryptCmd(new Buffer(data.slice(4))).toString('hex'))

    nps.dumpRequest(sock, data, requestCode)

      // Create the packet content
    packetcontent = crypto.randomBytes(253)

      // This is needed, not sure for what
    Buffer.from([0x01, 0x01]).copy(packetcontent)

      // Build the packet
    packetresult = packet.buildPacket(257, 0x0612, packetcontent)

    nps.dumpResponse(packetresult, 16)
    sock.write(packetresult)
    return
  }

// Anything else
  nps.dumpRequest(sock, data, requestCode)
  nps.isUserCreated = true

      // Create the packet content
  packetcontent = crypto.randomBytes(44971)

      // This is needed, not sure for what
  Buffer.from([0x01, 0x01]).copy(packetcontent)

      // Build the packet
  packetresult = packet.buildPacket(4, 0x0000, packetcontent)

  nps.dumpResponse(packetresult, 16)
  sock.write(packetresult)
}

/* Initialize the crypto */
try {
  nps.initCrypto()
} catch (err) {
  nps.logger.error(err)
  process.exit(1)
}

/* Start the NPS servers */
start(config, function (err) {
  if (err) { throw err }
  logger.info('Servers started')
})

/* Start the Patch server */

/* Start the AuthLogin server */

app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

// Server port is set by PORT env or web_port from config file with fallback to 3000
app.set('port', 80)
app.set('port_ssl', 443)

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
  // logger.debug(req.method)
  // logger.debug(req.url)

  res.set('Content-Type', 'text/plain')
  res.send('Valid=TRUE\nTicket=d316cd2dd6bf870893dfbaaf17f965884e')
})

var shardList =
  '[The Clocktower]\n' +
  'Description=The Clocktower\n' +
  'ShardId=44\n' +
  'LoginServerIP=' + config.ipServer + '\n' +
  'LoginServerPort=8226\n' +
  'LobbyServerIP=' + config.ipServer + '\n' +
  'LobbyServerPort=7003\n' +
  'MCOTSServerIP=' + config.ipServer + '\n' +
  'StatusId=0\n' +
  'Status_Reason=\n' +
  'ServerGroup_Name=Group - 1\n' +
  'Population=88\n' +
  'MaxPersonasPerUser=2\n' +
  'DiagnosticServerHost=' + config.ipServer + '\n' +
  'DiagnosticServerPort=80'

app.get('/ShardList/', function (req, res) {
  // logger.debug(req.method)
  // logger.debug(req.url)

  res.set('Content-Type', 'text/plain')
  res.send(shardList)
})

app.get('/key', function (req, res) {
  // logger.debug(req.method)
  // logger.debug(req.url)

  var key = fs.readFileSync('./data/pub.key').toString('hex')
  res.setHeader('Content-disposition', 'attachment; filename=pub.key')
  res.write(key)
  res.end()
})

app.use(function (req, res) {
  logger.debug(req.headers)
  logger.debug(req.method)
  logger.debug(req.url)
  res.send('404')
})

const serverPatch = require('http').createServer(app)
serverPatch.listen(app.get('port'), function () {
  logger.info('Patch server listening on port ' + app.get('port'))
})

var httpsServer = https.createServer(httpsOptions, app).listen(app.get('port_ssl'), function () {
  logger.info('AuthLogin server listening on port ' + app.get('port_ssl'))
})

// ================================================
// ================================================
// ================================================

httpsServer.on('connection', function (socket) {
  logger.info('New SSL connection')
  socket.on('error', function (error) {
    logger.error('Socket Error: ' + error.message)
  })
  socket.on('close', function () {
    logger.info('Socket Connection closed')
  })
})

httpsServer.on('error', function (error, socket) {
  logger.debug(socket)
  logger.error('Error: ' + error)
})

httpsServer.on('tlsClientError', function (err, sock) {
  logger.debug(sock)
  logger.error(err)
})

