import { LogLevel } from './src/types.js';
import { ServerLogger } from './src/types.js';
import * as winston from 'winston';
import DailyRotateFile from "winston-daily-rotate-file"

let loggerInstance: winston.Logger | undefined = undefined;

export function getServerLogger(name?: string): ServerLogger {
    if (typeof loggerInstance !== 'undefined') {
        if (name) {
            return wrapLogger(loggerInstance.child({ defaultMeta: { name }}));
        }
        return wrapLogger(loggerInstance.child({ defaultMeta: { name } }));
    }
    const loggerName = name || 'core';
    const envLevel = (process.env['MCO_LOG_LEVEL'] || process.env['LOG_LEVEL']) as LogLevel;
    const logLevel: LogLevel = envLevel ?? 'verbose';

    let logger = winston.createLogger({
        defaultMeta: {
            name: loggerName,
        },
        level: logLevel,
        transports: [
            new winston.transports.Console({
                level: logLevel,
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple(),
                ),
            }),
            new DailyRotateFile({
                level: logLevel,
                filename: 'data/application-%DATE%.log',
                datePattern: 'YYYY-MM-DD-HH',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '14d',
            }),
        ],
    });

    loggerInstance = logger;

    return wrapLogger(loggerInstance);
}
function wrapLogger(logger: winston.Logger): ServerLogger {
    return {
        error: logger.error.bind(logger),
        info: logger.info.bind(logger),
        warn: logger.warn.bind(logger),
        verbose: logger.verbose.bind(logger),
        /** @deprecated Use verbose instead */
        debug: (logger as any).debug ? (logger as any).verbose.bind(logger) : logger.verbose.bind(logger),
        /** @deprecated Use verbose instead */
        trace: (logger as any).silly ? (logger as any).verbose.bind(logger) : logger.verbose.bind(logger),
    };
}
