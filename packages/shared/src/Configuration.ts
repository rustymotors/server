import type { Logger } from "pino";
import { getServerLogger, type ServerLogger } from "./log.js";

/**
 * @module shared/Configuration
 * @exports Configuration
 */

export class Configuration {
	certificateFile!: string;
	privateKeyFile!: string;
	publicKeyFile!: string;
	host!: string;
	logLevel!: string;
	static instance: Configuration | undefined;
	/**
	 *
	 * @param {object} args
	 * @param {string} [args.host="localhost"]
	 * @param {string} [args.certificateFile="certificates/certificate.pem"]
	 * @param {string} [args.privateKeyFile="certificates/privatekey.pem"]
	 * @param {string} [args.publicKeyFile="certificates/publickey.pem"]
	 * @param {string} [args.logLevel="info"]
	 * @param {module:pino.Logger} [args.logger=getServerLogger({})]
	 */
	constructor({
		host = "localhost",
		certificateFile = "certificates/certificate.pem",
		privateKeyFile = "certificates/privatekey.pem",
		publicKeyFile = "certificates/publickey.pem",
		logLevel = "info",
		logger = getServerLogger({}),
	}: {
		host?: string;
		certificateFile?: string;
		privateKeyFile?: string;
		publicKeyFile?: string;
		logLevel?: string;
		logger?: ServerLogger;
	}) {
		try {
			this.certificateFile = certificateFile;

			this.privateKeyFile = privateKeyFile;

			this.publicKeyFile = publicKeyFile;

			this.host = host;

			this.logLevel = logLevel.toLowerCase();
			Configuration.instance = this;
		} catch (error) {
			logger.fatal(`Error in core server: ${String(error)}`);
		}
	}
}

/**
 * Get a singleton instance of Configuration
 *
 * @param {object} param0
 * @param {string} [param0.host="localhost"]
 * @param {string} [param0.certificateFile="certificates/certificate.pem"]
 * @param {string} [param0.privateKeyFile="certificates/privatekey.pem"]
 * @param {string} [param0.publicKeyFile="certificates/publickey.pem"]
 * @param {string} [param0.logLevel="info"]
 * @param {module:pino.Logger} [param0.logger=getServerLogger({})]
 * @returns {Configuration}
 */
export function getServerConfiguration({
	host,
	certificateFile,
	privateKeyFile,
	publicKeyFile,
	logLevel,
	logger,
}: {
	host?: string;
	certificateFile?: string;
	privateKeyFile?: string;
	publicKeyFile?: string;
	logLevel?: string;
	logger?: Logger;
}): Configuration {
	if (typeof Configuration.instance === "undefined") {
		Configuration.instance = new Configuration({
			host,
			certificateFile,
			privateKeyFile,
			publicKeyFile,
			logLevel,
			logger,
		});
	}

	return Configuration.instance;
}
