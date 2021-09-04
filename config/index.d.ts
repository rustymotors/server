/**
 * @module mco_config
 */
export interface IAppConfiguration {
  certificate: {
    privateKeyFilename: string
    publicKeyFilename: string
    certFilename: string
  }
  serverSettings: {
    ipServer: string
  }
  serviceConnections: {
    databaseURL: string
  }
  defaultLogLevel: string
}
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
export declare const certificate: IAppConfiguration['certificate']
export declare const serverSettings: IAppConfiguration['serverSettings']
export declare const serviceConnections: IAppConfiguration['serviceConnections']
export declare const defaultLogLevel: IAppConfiguration['defaultLogLevel']
declare const config: IAppConfiguration
export default config
