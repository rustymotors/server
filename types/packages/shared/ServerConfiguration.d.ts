import { ConfigurationServer, ServerConfiguration, ELOG_LEVEL } from "../interfaces/index.js";
/**
 * Configue and return a new ServerConfiguration object
 * @param {string} externalHost
 * @param {string} certificateFile
 * @param {string} privateKeyFile
 * @param {string} publicKeyFile
 * @param {ELOG_LEVEL} [logLevel="INFO"]
 * @returns {Configuration}
 */
export declare function setConfiguration({ externalHost, certificateFile, privateKeyFile, publicKeyFile, logLevel, }: {
    externalHost: string;
    certificateFile: string;
    privateKeyFile: string;
    publicKeyFile: string;
    logLevel: ELOG_LEVEL;
}): ServerConfiguration;
export declare function getServerConfiguration(): ConfigurationServer;
//# sourceMappingURL=ServerConfiguration.d.ts.map