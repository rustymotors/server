import createPino from "pino";

/**
 * @module shared/log
 */

/**
 * @typedef {object} ServerLoggerOptions
 * @property {string} [level]
 * @property {string} [module]
 * @property {string} [name]
 */

/**
 * @static
 * @property {ServerLogger} instance
 */
export class ServerLogger {
    /**
     * Creates an instance of ServerLogger.
     * @param {ServerLoggerOptions} options
     */
    constructor(options) {
        this.logger = createPino.pino(options);
        this.logger.level = options.level ?? "info";
        ServerLogger.instance = this;
    }

    /**
     * @param {string} message
     */
    fatal(message) {
        this.logger.fatal(message);
    }

    /**
     * @param {string} message
     */
    error(message) {
        this.logger.error(message);
    }

    /**
     * @param {string} message
     */
    warn(message) {
        this.logger.warn(message);
    }

    /**
     * @param {string} message
     */
    info(message) {
        this.logger.info(message);
    }

    /**
     * @param {string} message
     */
    debug(message) {
        this.logger.debug(message);
    }

    /**
     * @param {string} message
     */
    trace(message) {
        this.logger.trace(message);
    }

    /**
     * @global
     * @external pino
     * @see {@link https://www.npmjs.com/package/pino}
     */

    /**
     * @param {module:pino.LoggerOptions} options
     * @returns {module:pino.Logger}
     */
    child(options) {
        const child = this.logger.child(options);
        return child;
    }
}

/** @type {ServerLogger | undefined} */
ServerLogger.instance = undefined;

/**
 * Get a logger instance
 *
 * @param {ServerLoggerOptions} options
 * @return {module:pino.Logger}
 */
export function getServerLogger(options) {
    const logLevel = options.level ?? "info";
    const moduleName = options.module ?? "core";
    if (typeof ServerLogger.instance === "undefined") {
        ServerLogger.instance = new ServerLogger({
            name: "mcos",
            level: logLevel, // This isn't used by the logger, but it's used by the constructor
            module: moduleName,
        });
    }

    const child = ServerLogger.instance.child(options);
    child.level = logLevel;
    return child;
}
