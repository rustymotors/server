import { ELOG_LEVEL, TConfiguration, IServerConfiguration } from "./interfaces.js";
/**
 * Configue and return a new MSOCServerConfiguration object
 * @param {string} externalHost
 * @param {string} certificateFile
 * @param {string} privateKeyFile
 * @param {string} publicKeyFile
 * @param {ELOG_LEVEL} [logLevel="INFO"]
 * @returns {TConfiguration}
 */
export declare function setConfiguration({ externalHost, certificateFile, privateKeyFile, publicKeyFile, logLevel, }: {
    externalHost: string;
    certificateFile: string;
    privateKeyFile: string;
    publicKeyFile: string;
    logLevel: ELOG_LEVEL;
}): TConfiguration;
export declare function getServerConfiguration(): IServerConfiguration;
/**
 *  Get the server configuration
 * @returns {TConfiguration}
 */
export declare function getConfiguration(): TConfiguration;
