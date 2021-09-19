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
const config = {
  certificate: {
    privateKeyFilename: "data/private_key.pem",
    publicKeyFilename: "data/pub.key",
    certFilename: "data/mcouniverse.crt",
  },
  serverSettings: {
    host: "0.0.0.0",
  },
  serviceConnections: {
    databaseURL: "db.mco.db",
  },
};
export default config;
