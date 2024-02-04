import * as P from "pino";

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
    logger: P.Logger;
    static instance: ServerLogger;
    /**
     * Creates an instance of ServerLogger.
     * @param {ServerLoggerOptions} options
     */
    constructor(options: ServerLoggerOptions) {
        this.logger = P.pino(
            {
                name: options.name,
                level: options.level,
                transport: {
                    targets: [
                        {
                            target: "pino-pretty",
                            options: {
                                colorize: true,
                                ignore: "pid,hostname",
                            },
                        },
                    ],
                },
            },
            P.destination({
                dest: "server.log",
                sync: true,
            }),
        );
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
 * @return {ServerLogger}
 */
export function getServerLogger(options: ServerLoggerOptions): ServerLogger {
    const logLevel = options.level ?? "info";
    const moduleName = options.module ?? "core";
    if (typeof ServerLogger.instance === "undefined") {
        ServerLogger.instance = new ServerLogger({
            level: logLevel, // This isn't used by the logger, but it's used by the constructor
            module: moduleName,
        });
    }

    const child = ServerLogger.instance;
    return child;
}

export const log = getServerLogger({ level: "info", module: "shared" });
