/**
 * @module shared/Configuration
 * @exports Configuration
 */
type ConfigurationArgs = {
    host: string;
    certificateFile: string;
    privateKeyFile: string;
    publicKeyFile: string;
};
export declare class Configuration {
    certificateFile: string;
    privateKeyFile: string;
    publicKeyFile: string;
    host: string;
    static instance: Configuration | undefined;
    /**
     *
     * @param {object} args
     * @param {string} args.host
     * @param {string} args.certificateFile
     * @param {string} args.privateKeyFile
     * @param {string} args.publicKeyFile
     * @param {string} args.logLevel
     * @param {ServerLogger} args.logger
     */
    constructor(options: ConfigurationArgs);
}
/**
 * Get a singleton instance of Configuration
 *
 * @returns {Configuration}
 */
export declare function getServerConfiguration(
    options: Partial<ConfigurationArgs>,
): Configuration;
export {};
