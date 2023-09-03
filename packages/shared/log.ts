import createLogger, { LoggerOptions, Logger } from "pino";

declare module "pino" {
    interface LoggerOptions {
        module?: string;
    }
}

export class ServerLogger {
    readonly logger: Logger;
    static instance: ServerLogger;

    constructor(options: LoggerOptions) {
        this.logger = createLogger.pino(options);
        this.logger.level = options.level ?? "info";
    }

    public fatal(message: string): void {
        this.logger.fatal(message);
    }

    public error(message: string): void {
        this.logger.error(message);
    }

    public warn(message: string): void {
        this.logger.warn(message);
    }

    public info(message: string): void {
        this.logger.info(message);
    }

    public debug(message: string): void {
        this.logger.debug(message);
    }

    public trace(message: string): void {
        this.logger.trace(message);
    }

    public child(options: LoggerOptions): Logger {
        const child = this.logger.child(options);
        return child;
    }
}

export function getServerLogger(options: LoggerOptions): Logger {
    const logLevel = options.level ?? "info";
    const moduleName = options.module  ?? "core";
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
