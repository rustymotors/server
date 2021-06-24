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
module.exports = {
    certificate: {
        privateKeyFilename: "data/private_key.pem",
        publicKeyFilename: "data/pub.key",
        certFilename: "data/mcouniverse.crt"
    },
    serverSettings: {
        ipServer: "localhost"
    },
    serviceConnections: {
        databaseURL: "sqlite: :memory"
    },
    defaultLogLevel: 'info'
}