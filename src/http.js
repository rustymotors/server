const app = require('express')()
const bodyParser = require('body-parser')
const http = require('http')
const https = require('https')
const sslConfig = require('ssl-config')('old')
const fs = require('fs')

const logger = require('./logger.js')
const patchServer = require('./patch_server.js')

function generateShardList(config) {
  return `[The Clocktower]
  Description=The Clocktower
  ShardId=44
  LoginServerIP=${config.ipServer}
  LoginServerPort=8226
  LobbyServerIP=${config.ipServer}
  LobbyServerPort=7003
  MCOTSServerIP=${config.ipServer}
  StatusId=0
  Status_Reason=
  ServerGroup_Name=Group - 1
  Population=88
  MaxPersonasPerUser=2
  DiagnosticServerHost=${config.ipServer}
  DiagnosticServerPort=80`
}

function start(config, callback) {
  // Setup SSL config
  const httpsOptions = {
    key: fs.readFileSync(config.privateKeyFilename),
    cert: fs.readFileSync(config.certFilename),
    rejectUnauthorized: false,
    ciphers: sslConfig.ciphers,
    honorCipherOrder: true,
    secureOptions: sslConfig.minimumTLSVersion,
  }

  app.get('/ShardList/', (req, res) => {
    res.set('Content-Type', 'text/plain')
    res.send(generateShardList(config))
  })

  app.get('/key', (req, res) => {
    res.setHeader('Content-disposition', 'attachment; filename=pub.key')
    res.write(fs.readFileSync(config.publicKeyFilename).toString('hex'))
    res.end()
  })

  app.use(bodyParser.json()) // support json encoded bodies
  app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

  // Server port is set by PORT env or web_port from config file with fallback to 3000
  app.set('port', config.serverAuthLogin.port)
  app.set('port_ssl', config.serverPatch.port)

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
  callback(null)
}

module.exports = {
  start,
}
