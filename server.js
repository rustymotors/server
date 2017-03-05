/* External dependencies */
const http = require('http')

/* Internal dependencies */
const logger = require('./src/logger.js')
const nps = require('./src/nps.js')

// Config settings
logger.level = 'debug'


const serverConfig = {
  ipServer: 'mc.drazisil.com',
  publicKeyFilename: './data/pub.key',
  privateKeyFilename: './data/private_key.pem',
  certFilename: './data/cert.pem',
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

/* Start the NPS servers */
http.start(serverConfig, (err) => {
  if (err) { throw err }
  logger.info('HTTP Servers started')
})

nps.start(serverConfig, (err) => {
  if (err) { throw err }
  logger.info('TCP Servers started')
})
