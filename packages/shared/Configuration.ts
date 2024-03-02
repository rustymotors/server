import { ServerLogger, ServerLoggerLevels, getServerLogger } from "./log.js";

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

const DEFAULT_CONFIG: ConfigurationArgs = {
    host: "localhost",
    certificateFile: "certificates/certificate.pem",
    privateKeyFile: "certificates/privatekey.pem",
    publicKeyFile: "certificates/publickey.pem",
};

export class Configuration {
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
    constructor(options: ConfigurationArgs) {
        try {
            this.certificateFile = options.certificateFile;

            this.privateKeyFile = options.privateKeyFile;

            this.publicKeyFile = options.publicKeyFile;

            this.host = options.host;

            Configuration.instance = this;
        } catch (error) {
            console.error(`Error in Configuration: ${String(error)}`);
            process.exit(1);
        }
    }
}

/**
 * Get a singleton instance of Configuration
 *
 * @returns {Configuration}
 */
export function getServerConfiguration(
    options: Partial<ConfigurationArgs>,
): Configuration {
    if (typeof Configuration.instance === "undefined") {
        Configuration.instance = new Configuration({
            host: options.host || DEFAULT_CONFIG.host,
            certificateFile:
                options.certificateFile || DEFAULT_CONFIG.certificateFile,
            privateKeyFile:
                options.privateKeyFile || DEFAULT_CONFIG.privateKeyFile,
            publicKeyFile:
                options.publicKeyFile || DEFAULT_CONFIG.publicKeyFile,
        });
    }

    return Configuration.instance;
}
