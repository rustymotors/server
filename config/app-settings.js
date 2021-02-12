const fs = require('fs')
const ini = require('ini')
const path = require('path')

/**
 * Reads the INI configuration file
 * @module
 */

const config = ini.parse(fs.readFileSync(path.join(process.cwd(), 'config/app_settings.ini'), 'utf8'))

/** @type {IAppSettings} */
exports.appSettings = {
  serverConfig: {
    certFilename: path.join(process.cwd(), config.serverConfig.certFilename),
    ipServer: config.serverConfig.ipServer,
    privateKeyFilename: path.join(process.cwd(), config.serverConfig.privateKeyFilename),
    publicKeyFilename: path.join(process.cwd(), config.serverConfig.publicKeyFilename),
    connectionURL: config.serverConfig.connectionURL
  }
}
