// @ts-check

/**
 * @module mco_config
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
 * @memberof {mco_config}
 * @global
 */
export const certificate = {
  privateKeyFilename: 'data/private_key.pem',
  publicKeyFilename: 'data/pub.key',
  certFilename: 'data/mcouniverse.crt',
}
export const serverSettings = {
  ipServer: 'localhost',
}
export const serviceConnections = {
  databaseURL: 'sqlite: :memory',
}
export const defaultLogLevel = 'info'

const config = {
  certificate,
  serverSettings,
  serviceConnections,
  defaultLogLevel,
}
export default config
