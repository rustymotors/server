const fs = require('fs')
const ini = require('ini')
const path = require('path')

const config = ini.parse(fs.readFileSync(path.join(process.cwd(), 'config/app_settings.ini'), 'utf8'))

/**
 *
 *
 * @typedef ServerConfig
 * @property {string} certFilename
 * @property {string} ipServer
 * @property {string} privateKeyFilename
 * @property {string} publicKeyFilename
 * @property {string} connectionURL
 */

/**
 *
 *
 * @typedef AppSettings
 * @property {ServerConfig} serverConfig
 */

/** @type {AppSettings} */
const appSettings = {
  serverConfig: {
    certFilename: path.join(process.cwd(), config.serverConfig.certFilename),
    ipServer: config.serverConfig.ipServer,
    privateKeyFilename: path.join(process.cwd(), config.serverConfig.privateKeyFilename),
    publicKeyFilename: path.join(process.cwd(), config.serverConfig.publicKeyFilename),
    connectionURL: config.serverConfig.connectionURL
  }
}

module.exports = appSettings
