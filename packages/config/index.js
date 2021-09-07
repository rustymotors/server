// @ts-check

/**
 * @global
 * @typedef {object} IAppConfiguration
 * @property {object} IAppConfiguration.certificate
 * @property {string} IAppConfiguration.certificate.privateKeyFilename
 * @property {string} IAppConfiguration.certificate.publicKeyFilename
 * @property {string} IAppConfiguration.certificate.certFilename
 * @property {object} IAppConfiguration.serverSettings
 * @property {string} IAppConfiguration.serverSettings.ipServer
 * @property {object} IAppConfiguration.serviceConnections
 * @property {string} IAppConfiguration.serviceConnections.databaseURL
 * @property {string} IAppConfiguration.defaultLogLevel
 */

/**
 * @typedef {Object} config
 * @property {Object} certificate
 * @property {string} certificate.privateKeyFilename
 * @property {string} certificate.publicKeyFilename
 * @property {string} certificate.certFilename
 * @property {Object} serverSettings
 * @property {string} serverSettings.ipServer
 * @property {Object} serviceConnections
 * @property {string} serviceConnections.databaseURL
 * @property {string} defaultLogLevel
 * @global
 */

/** @type {IAppConfiguration["certificate"]} */
export const certificate = {
  privateKeyFilename: 'data/private_key.pem',
  publicKeyFilename: 'data/pub.key',
  certFilename: 'data/mcouniverse.crt',
}
/** @type {IAppConfiguration["serverSettings"]} */
export const serverSettings = {
  ipServer: '0.0.0.0',
}
/** @type {IAppConfiguration["serviceConnections"]} */
export const serviceConnections = {
  databaseURL: 'db.mco.db',
}
/** @type {IAppConfiguration["defaultLogLevel"]} */
export const defaultLogLevel = 'info'

/** @type {IAppConfiguration} */
const config = {
  certificate,
  serverSettings,
  serviceConnections,
  defaultLogLevel,
}
export default config
