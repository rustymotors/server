export type AppConfiguration = {
    certificate: {
        privateKeyFilename: string;
        publicKeyFilename: string;
        certFilename: string;
    };
    serverSettings: {
        ipServer: string;
    };
    serviceConnections: {
        databaseURL: string;
    };
    defaultLogLevel: string;
};
/**
 *
 * @returns {AppConfiguration}
 */
export function getConfig(): AppConfiguration;
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
export class ConfigurationManager {
    /** @type {ConfigurationManager} */
    static _instance: ConfigurationManager;
    /**
     *
     * @returns {ConfigurationManager}
     */
    static getInstance(): ConfigurationManager;
    /**
     *
     * @param {Buffer} data
     */
    handleData(data: Buffer): void;
}
