import { Console } from "node:console";

type ServerLoggerLevels =
    | "fatal"
    | "error"
    | "warn"
    | "info"
    | "debug"
    | "trace";

type ServerLoggerOptions = {
    level?: ServerLoggerLevels;
    module?: string;
    name?: string;
};

/**
 * @static
 * @property {ServerLogger} instance
 */
export class ServerLogger {
    level: string;
    logger: Console;
    static instance: ServerLogger | undefined;
    /**
     * Creates an instance of ServerLogger.
     * @param {ServerLoggerOptions} options
     */
    constructor(options: ServerLoggerOptions) {
        this.logger = console;
        ServerLogger.instance = this;
        this.level = options.level ?? "info";
    }

    /**
     * @param {string} message
     */
    fatal(message: string) {
            this.logger.error(message);
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
            this.logger.error(message);
    }

    /**
     * @param {string} message
     */
    info(message: string) {
            this.logger.log(message);
    }

    /**
     * @param {string} message
     */
    debug(message: string) {
        this.logger.log(message);
    }

    /**
     * @param {string} message
     */
    trace(message: string) {
        this.logger.log(message);
    }
}

/**
 * Get a logger instance
 *
 * @param {ServerLoggerOptions} options
 * @return {ServerLogger}
 */
export function getServerLogger(options: ServerLoggerOptions): ServerLogger {
    const logLevel = options.level ?? "info";
    const moduleName = options.module ?? "core";
    if (typeof ServerLogger.instance === "undefined") {
        ServerLogger.instance = new ServerLogger({
            name: "mcos",
            level: logLevel, // This isn't used by the logger, but it's used by the constructor
            module: moduleName,
        });
    }

    const child = ServerLogger.instance;
    return child;
}
