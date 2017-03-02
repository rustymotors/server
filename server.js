let inQueue = false

/* External dependencies */
const crypto = require('crypto')
const net = require('net')
const app = require('express')()
const http = require('http')
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


const serverConfig = {
  ipServer: 'mc.drazisil.com',
  serverAuthLogin: {
    name: 'AuthLogin',
    port: 80,
  },
  serverPatch: {
    name: 'Patch',
    port: 443,
  },
  serverLogin: {
    name: 'Login',
    port: 8226,
  },
  serverPersona: {
    name: 'Login',
    port: 8228,
  },
  serverLobby: {
    name: 'Lobby',
    port: 7003,
  },
  serverDatabase: {
    name: 'Database',
    port: 43300,
  },
}

const key = fs.readFileSync('./data/private_key.pem')
const cert = fs.readFileSync('./data/cert.pem')

// Setup SSL config
const httpsOptions = {
  key,
  cert,
  rejectUnauthorized: false,
  ciphers: sslConfig.ciphers,
  honorCipherOrder: true,
  secureOptions: sslConfig.minimumTLSVersion,
}

function onData(sock, id, data) {
  const requestCode = nps.getRequestCode(data)

  let packetcontent
  let packetresult

  if (requestCode === '(0x0501) NPSUserLogin') {
    nps.dumpRequest(sock, id, data, requestCode)
    const contextId = Buffer.alloc(34)
    data.copy(contextId, 0, 14, 48)
    const customer = nps.npsGetCustomerIdByContextId(contextId)

    // Create the packet content
    // packetcontent = crypto.randomBytes(44971)
    // packetcontent = crypto.randomBytes(516)
    packetcontent = packet.premadeLogin()

      // This is needed, not sure for what
    Buffer.from([0x01, 0x01]).copy(packetcontent)

      // load the customer id
    customer.customerId.copy(packetcontent, 10)

    // Don't use queue?
    Buffer.from([0x00]).copy(packetcontent, 207)
    // Don't use queue? (debug)
    Buffer.from([0x00]).copy(packetcontent, 463)

    // Set response Code 0x0601 (debug)
    packetcontent[255] = 0x06
    packetcontent[256] = 0x01

    // For debug
    packetcontent[257] = 0x01
    packetcontent[258] = 0x01


    // load the customer id (debug)
    customer.customerId.copy(packetcontent, 267)

    // Build the packet
    // packetresult = packet.buildPacket(44975, 0x0601, packetcontent)
    packetresult = packet.buildPacket(516, 0x0601, packetcontent)

    nps.dumpResponse(packetresult, 516)

    nps.decryptSessionKey(data.slice(52, -10))

    inQueue = true

    sock.write(packetresult)
    return
  }

  // Persona_UseSelected
  if (requestCode === '(0x503) NPSSelectGamePersona') {
    nps.dumpRequest(sock, id, data, requestCode)

      // Create the packet content
    packetcontent = crypto.randomBytes(44971)

      // This is needed, not sure for what
    Buffer.from([0x01, 0x01]).copy(packetcontent)

    // Build the packet
    // Response Code
    // 207 = success
    // packetresult = packet.buildPacket(44975, 0x0207, packetcontent)
    packetresult = packet.buildPacket(261, 0x0207, packetcontent)

    nps.dumpResponse(packetresult, 16)
    sock.write(packetresult)

    return
  }

  if (requestCode === '(0x0532) NPSGetPersonaMaps') {
    nps.dumpRequest(sock, id, data, requestCode)

    const customerId = Buffer.alloc(4)
    data.copy(customerId, 0, 12)
    const persona = nps.npsGetPersonaMapsByCustomerId(customerId)

    // Create the packet content
    // packetcontent = crypto.randomBytes(1024)
    packetcontent = packet.premadePersonaMaps()

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
    packetresult = packet.buildPacket(1024, 0x0607, packetcontent)

    nps.dumpResponse(packetresult, 1024)
    sock.write(packetresult)
    return
  }

  if (requestCode === '(0x0533) NPSValidatePersonaName') {
    nps.dumpRequest(sock, id, data, requestCode)

    const customerId = Buffer.alloc(4)
    data.copy(customerId, 0, 12)
    const persona = nps.npsGetPersonaMapsByCustomerId(customerId)

      // Create the packet content
    packetcontent = crypto.randomBytes(1024)

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
    packetresult = packet.buildPacket(1024, 0x0601, packetcontent)

    nps.dumpResponse(packetresult, 1024)
    sock.write(packetresult)
    return
  }

  if (requestCode === '(0x0534) NPSCheckToken') {
    nps.dumpRequest(sock, id, data, requestCode)

    // const customerId = Buffer.alloc(4)
    // data.copy(customerId, 0, 12)
    // const persona = nps.npsGetPersonaMapsByCustomerId(customerId)

    // Create the packet content
    packetcontent = crypto.randomBytes(1024)

    // This is needed, not sure for what
    Buffer.from([0x01, 0x01]).copy(packetcontent)

    // This is the persona count
    // persona.personacount.copy(packetcontent, 10)

    // This is the max persona count
    // persona.maxpersonas.copy(packetcontent, 18)

    // PersonaId
    // persona.id.copy(packetcontent, 18)

    // Shard ID
    // persona.shardid.copy(packetcontent, 22)

    // Persona Name = 30-bit null terminated string
    // persona.name.copy(packetcontent, 32)

    // Build the packet
    packetresult = packet.buildPacket(1024, 0x0207, packetcontent)

    nps.dumpResponse(packetresult, 1024)
    sock.write(packetresult)
    return
  }

  if (requestCode === '(0x0519) NPSGetPersonaInfoByName') {
    nps.dumpRequest(sock, id, data, requestCode)
    const personaName = Buffer.alloc(data.length - 30)
    data.copy(personaName, 0, 30)

    logger.debug(`personaName ${personaName}`)

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
    nps.dumpRequest(sock, id, data, requestCode)
    // const contextId = Buffer.alloc(34)
    // data.copy(contextId, 0, 14, 48)
    // const customer = nps.npsGetCustomerIdByContextId(contextId)
    // logger.debug(`customer: ${customer}`)


    // Create the packet content
    packetcontent = Buffer.alloc(6)

    // Server ID
    Buffer.from([0x00]).copy(packetcontent)

    // This is needed, not sure for what
    // Buffer.from([0x01, 0x01]).copy(packetcontent)

    // if it's 97 it says the username returned is correct
    // if it's 06 it says it's different, but it's random
    // It's parsed by the NPS cipher somehow.
    Buffer.from([0x05]).copy(packetcontent, 1)

      // load the customer id
    Buffer.from([0xAB, 0x01, 0x00, 0x00]).copy(packetcontent, 2)

      // RIFF Count = total packet len - 4 for header
      // Buffer.from([0x00, 0x05]).copy(packetcontent, 1490)

      // Build the packet
    packetresult = packet.buildPacket(8, 0x0120, packetcontent)

    nps.dumpResponse(packetresult, 8)
    sock.write(packetresult)
    return
  }

  if (requestCode === '(0x1101) NPSSendCommand') {
    logger.debug(`cmd: ${nps.decryptCmd(new Buffer(data.slice(4))).toString('hex')}`)

    nps.dumpRequest(sock, id, data, requestCode)

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
    logger.debug(`cmd: ${nps.decryptCmd(new Buffer(data.slice(4))).toString('hex')}`)

    nps.dumpRequest(sock, id, data, requestCode)

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
  nps.dumpRequest(sock, id, data, requestCode)
  nps.isUserCreated = true

      // Create the packet content
  packetcontent = crypto.randomBytes(44971)

      // This is needed, not sure for what
  Buffer.from([0x01, 0x01]).copy(packetcontent)

      // Build the packet
  packetresult = packet.buildPacket(600, 0x0000, packetcontent)

  nps.dumpResponse(packetresult, 600)
  sock.write(packetresult)
}

function listener(sock) {
  const localId = `${sock.localAddress}_${sock.localPort}`
  const socketId = `${sock.remoteAddress}_${sock.remotePort}`
  logger.info(`Creating socket: ${localId} => ${socketId}`)
  // sock.setKeepAlive(true)
  if (sock.localPort === 7003 && inQueue) {
    const packetcontent = crypto.randomBytes(151)

    // This is needed, not sure for what
    Buffer.from([0x01, 0x01]).copy(packetcontent)

    const packetresult = packet.buildPacket(4, 0x0230, packetcontent)
    inQueue = false
    nps.dumpResponse(packetresult, 8)
    sock.write(packetresult)
  }


  const socket = sock

  // Add a 'data' event handler to this instance of socket
  sock.on('data', (data) => {
    onData(socket, socketId, data)
  })
  // Add a 'close' event handler to this instance of socket
  sock.on('close', () => {
    logger.info(`Closing socket: ${localId} => ${socketId}`)
  })
  // Add a 'error' event handler to this instance of socket
  sock.on('error', (err) => {
    if (err.code !== 'ECONNRESET') {
      logger.error(err)
    }
  })
}

function start(config, cbStart) {
  series({
    serverLogin: (callback) => {
      const server = net.createServer(listener)
      server.listen(serverConfig.serverLogin.port, () => {
        logger.info(`${serverConfig.serverLogin.name} Server listening on TCP port: ${serverConfig.serverLogin.port}`)
        callback(null, server)
      })
    },
    serverPersona: (callback) => {
      const server = net.createServer(listener)
      server.listen(config.serverPersona.port, () => {
        logger.info(`${config.serverPersona.name} Server listening on TCP port: ${config.serverPersona.port}`)
        callback(null, server)
      })
    },
    serverLobby: (callback) => {
      const server = net.createServer(listener)
      server.listen(config.serverLobby.port, () => {
        logger.info(`${config.serverLobby.name} Server listening on TCP port: ${config.serverLobby.port}`)
        callback(null, server)
      })
    },
    serverDatabase: (callback) => {
      const server = net.createServer(listener)
      server.listen(config.serverDatabase.port, () => {
        logger.info(`${config.serverDatabase.name} Server listening on TCP port: ${config.serverDatabase.port}`)
        callback(null, server)
      })
    },
  }, (err) => {
    if (err) { throw err }
    // Not currently using this

    cbStart(null)
  })
}

/* Initialize the crypto */
try {
  nps.initCrypto()
} catch (err) {
  nps.logger.error(err)
  process.exit(1)
}

/* Start the NPS servers */
start(serverConfig, (err) => {
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

app.post('/games/EA_Seattle/MotorCity/UpdateInfo', (req, res) => {
  const response = patchServer.patchUpdateInfo(req)
  res.set(response.headers)
  res.send(response.body)
})

app.post('/games/EA_Seattle/MotorCity/NPS', (req, res) => {
  const response = patchServer.patchNPS(req)
  res.set(response.headers)
  res.send(response.body)
})

app.post('/games/EA_Seattle/MotorCity/MCO', (req, res) => {
  const response = patchServer.patchMCO(req)
  res.set(response.headers)
  res.send(response.body)
})

app.get('/AuthLogin', (req, res) => {
  res.set('Content-Type', 'text/plain')
  res.send('Valid=TRUE\nTicket=d316cd2dd6bf870893dfbaaf17f965884e')
})

const shardList = `[The Clocktower]
Description=The Clocktower
ShardId=44
LoginServerIP=${serverConfig.ipServer}
LoginServerPort=8226
LobbyServerIP=${serverConfig.ipServer}
LobbyServerPort=7003
MCOTSServerIP=${serverConfig.ipServer}
StatusId=0
Status_Reason=
ServerGroup_Name=Group - 1
Population=88
MaxPersonasPerUser=2
DiagnosticServerHost=${serverConfig.ipServer}
DiagnosticServerPort=80`

app.get('/ShardList/', (req, res) => {
  res.set('Content-Type', 'text/plain')
  res.send(shardList)
})

app.get('/key', (req, res) => {
  res.setHeader('Content-disposition', 'attachment; filename=pub.key')
  res.write(fs.readFileSync('./data/pub.key').toString('hex'))
  res.end()
})

app.use((req, res) => {
  logger.debug(`Headers: ${req.headers}`)
  logger.debug(`Method: ${req.method}`)
  logger.debug(`Url: ${req.url}`)
  res.send('404')
})

const serverPatch = http.createServer(app)
serverPatch.listen(app.get('port'), () => {
  logger.info(`Patch server listening on port ${app.get('port')}`)
})

const httpsServer = https.createServer(httpsOptions, app).listen(app.get('port_ssl'), () => {
  logger.info(`AuthLogin server listening on port ${app.get('port_ssl')}`)
})

// ================================================
// ================================================
// ================================================

httpsServer.on('connection', (socket) => {
  logger.info('New SSL connection')
  socket.on('error', (error) => {
    logger.error(`Socket Error: ${error.message}`)
  })
  socket.on('close', () => {
    logger.info('Socket Connection closed')
  })
})

httpsServer.on('error', (error) => {
  logger.error(`Error: ${error}`)
})

httpsServer.on('tlsClientError', (err) => {
  logger.error(`tlsClientError: ${err}`)
})
