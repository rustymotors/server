import * as P from "pino";
export type ServerLoggerLevels =
    | "fatal"
    | "error"
    | "warn"
    | "info"
    | "debug"
    | "trace"
    | "silent";
type ServerLoggerOptions = {
    level: ServerLoggerLevels;
    name?: string;
};
/**
 * @static
 * @property {ServerLogger} instance
 */
export declare class ServerLogger {
    logger: P.Logger;
    static instance: ServerLogger;
    /**
     * Creates an instance of ServerLogger.
     * @param {ServerLoggerOptions} options
     */
    constructor(options?: ServerLoggerOptions);
    /**
     * @param {string} message
     */
    fatal(message: string): void;
    /**
     * @param {string} message
     */
    error(message: string): void;
    /**
     * @param {string} message
     */
    warn(message: string): void;
    /**
     * @param {string} message
     */
    info(message: string): void;
    /**
     * @param {string} message
     */
    debug(message: string): void;
    /**
     * @param {string} message
     */
    trace(message: string): void;
}
/**
 * Get a logger instance
 *
 * @param {ServerLoggerOptions} options
 * @return {ServerLogger}
 */
export declare function getServerLogger(
    options?: ServerLoggerOptions,
): ServerLogger;
export declare const log: ServerLogger;
export {};
