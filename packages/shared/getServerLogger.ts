import { LogLevel } from './src/types.js';
import { Logger } from './src/types.js';
import * as winston from 'winston';
import DailyRotateFile from "winston-daily-rotate-file"

export type ServerLogger = Logger;

let loggerInstance: winston.Logger | undefined = undefined;

export function getServerLogger(name?: string): Logger {
    if (typeof loggerInstance !== 'undefined') {
        return wrapLogger(loggerInstance.child({name}));
    }
    const loggerName = name || 'core';
    const logLevel: LogLevel = 'verbose';

    const logger = winston.createLogger({
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

function wrapLogger(logger: winston.Logger): Logger {
    return {
        error: logger.error.bind(logger),
        info: logger.info.bind(logger),
        warn: logger.info.bind(logger),
        verbose: logger.verbose.bind(logger),
        debug: logger.verbose.bind(logger),
        trace: logger.verbose.bind(logger),
    };
}
