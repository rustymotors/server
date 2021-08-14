// @ts-check
/**
 * @typedef {Object} config
 * @property {Object} [certificate] - optional if the server is not using ssl
 * @property {string} certificate.privateKeyFilename
 * @property {string} certificate.publicKeyFilename
 * @property {string} certificate.certFilename
 * @property {Object} serverSettings
 * @property {string} serverSettings.ipServer
 * @property {Object} serviceConnections
 * @property {string} serviceConnections.databaseURL
 */

export default {
  certificate: {
    // The patch server does not use ssl
  },
  serverSettings: {
    host: 'localhost',
  },
  serviceConnections: {
    databaseURL: 'db.mco.db',
  },
}
