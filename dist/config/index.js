"use strict";
// @ts-check
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultLogLevel = exports.serviceConnections = exports.serverSettings = exports.certificate = void 0;
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
exports.certificate = {
    privateKeyFilename: 'data/private_key.pem',
    publicKeyFilename: 'data/pub.key',
    certFilename: 'data/mcouniverse.crt',
};
exports.serverSettings = {
    ipServer: '0.0.0.0',
};
exports.serviceConnections = {
    databaseURL: 'db.mco.db',
};
exports.defaultLogLevel = 'info';
const config = {
    certificate: exports.certificate,
    serverSettings: exports.serverSettings,
    serviceConnections: exports.serviceConnections,
    defaultLogLevel: exports.defaultLogLevel,
};
exports.default = config;
//# sourceMappingURL=index.js.map