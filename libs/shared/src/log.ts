import * as P from "pino";
import type { TServerLogger } from "./types.js";

const DEFAULT_LOG_LEVEL = "trace";

export type ServerLoggerLevels =
  | "fatal"
  | "error"
  | "warn"
  | "info"
  | "debug"
  | "trace"
  | "silent";

interface ServerLoggerOptions {
  level: ServerLoggerLevels;
  name?: string;
}

/**
 * @static
 * @property {ServerLogger} instance
 */
export class ServerLogger implements TServerLogger {
  logger: P.Logger;
  static instance: ServerLogger;
  private name: string;
  private oldName: string = "";
  /**
   * Creates an instance of ServerLogger.
   * @param {ServerLoggerOptions} options
   */
  constructor(options?: ServerLoggerOptions) {
    this.name = options?.name || "server";
    const level = DEFAULT_LOG_LEVEL;
    this.logger = P.pino({
      name: this.name,
      level,
      transport: {
        targets: [
          {
            target: "pino-pretty",
            options: {
              colorize: true,
              ignore: "pid,hostname",
            },
            level: "trace",
          },
          {
            target: "pino/file",
            options: {
              destination: "server.log",
              append: false,
            },
            level: "trace",
          },
        ],
      },
    });
    ServerLogger.instance = this;
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

  setName(name: string) {
    this.oldName = this.name;
    this.logger = this.logger.child({ name });
  }

  getName() {
    return this.name;
  }

  resetName() {
    this.logger = this.logger.child({ name: this.oldName });
  }
}

/**
 * Get a logger instance
 *
 * @param {ServerLoggerOptions} options
 * @return {ServerLogger}
 */
export function getServerLogger(options?: ServerLoggerOptions): TServerLogger {
  if (typeof ServerLogger.instance === "undefined") {
    ServerLogger.instance = new ServerLogger(options);
  }

  const child = ServerLogger.instance;
  return child;
}

export const log = getServerLogger();
