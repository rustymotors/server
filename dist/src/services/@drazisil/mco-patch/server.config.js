"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    certificate: {
    // The patch server does not use ssl
    },
    serverSettings: {
        host: '0.0.0.0',
    },
    serviceConnections: {
        databaseURL: 'db.mco.db',
    },
};
//# sourceMappingURL=server.config.js.map