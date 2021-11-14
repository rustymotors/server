const { savedConfig } = require("./config.js");
const { pino: P } = require("pino");

const log = P().child({ service: "mcos:ConfigurationManager" });
log.level = process.env["LOG_LEVEL"] || "info";

/**
 *
 * @returns {AppConfiguration}
 */
function getConfig() {
  return savedConfig;
}

/**
 * @exports
 * @typedef {Object} AppConfiguration
 * @property {Object} certificate
 * @property {string} certificate.privateKeyFilename
 * @property {string} certificate.publicKeyFilename
 * @property {string} certificate.certFilename
 * @property {Object} serverSettings
 * @property {string} serverSettings.ipServer
 * @property {Object} serviceConnections
 * @property {string} serviceConnections.databaseURL
 * @property {string} defaultLogLevel
 */

class ConfigurationManager {
  /** @private */
  constructor() {
    // Intentionally empty
  }

  /** @type {ConfigurationManager} */
  static _instance;

  /**
   *
   * @returns {ConfigurationManager}
   */
  static getInstance() {
    if (!ConfigurationManager._instance) {
      ConfigurationManager._instance = new ConfigurationManager();
    }
    return ConfigurationManager._instance;
  }

  /**
   *
   * @param {Buffer} data
   */
  handleData(data) {
    const payload = data.toString();
    log.debug(`Payload: ${payload}`);
    // TODO: feat: have config server react to payloads - https://github.com/drazisil/mco-server/issues/1017
  }
}
module.exports = { getConfig, ConfigurationManager };
