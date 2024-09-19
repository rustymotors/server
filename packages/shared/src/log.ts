import { type Logger } from "pino";
import pino from "pino";
import * as Sentry from "@sentry/node";

type ServerLoggerOptions = {
	level?: string;
	name?: string;
};

export type ServerLogger = {
	fatal: (message: string) => void;
	error: (message: string) => void;
	warn: (message: string) => void;
	info: (message: string) => void;
	debug: (message: string) => void;
	trace: (message: string) => void;
};

/**
 * @static
 */
class SLogger {
	logger: Logger;
	static instance: ServerLogger;
	/**
	 * Creates an instance of ServerLogger.
	 * @param {ServerLoggerOptions} options
	 */
	constructor(options: ServerLoggerOptions) {
		this.logger = pino.default(options);
		this.logger.level = options.level ?? "info";
		SLogger.instance = this;
	}

	/**
	 * @param {string} message
	 */
	fatal(message: string) {
		this.logger.fatal({
			message,
			sentry_trace: Sentry.getTraceData()["sentry-trace"],
		});
	}

	/**
	 * @param {string} message
	 */
	error(message: string) {
		this.logger.error(message);
	}

	/**
	 * @param {string} message
	 */
	warn(message: string) {
		this.logger.warn(message);
	}

	/**
	 * @param {string} message
	 */
	info(message: string) {
		this.logger.info(message);
	}

	/**
	 * @param {string} message
	 */
	debug(message: string) {
		this.logger.debug(message);
	}

	/**
	 * @param {string} message
	 */
	trace(message: string) {
		this.logger.trace(message);
	}
}

/**
 * Get a logger instance
 *
 * @param {ServerLoggerOptions} options
 * @return {module:pino.Logger}
 */
export function getServerLogger(options: ServerLoggerOptions): ServerLogger {
	const logLevel = process.env["MCO_LOG_LEVEL"] ?? "info";
	const logName = `server.${options ? (options.name ?? "unknown") : "unknown"}`;
	SLogger.instance = new SLogger({
		level: logLevel,
		name: logName,
	});
	return SLogger.instance as ServerLogger;
}
