import * as Sentry from '@sentry/node';
import pino from 'pino';
import { Logger } from './interfaces.js';

export function getServerLogger(name?: string): Logger {
    if (logger) {
        return logger.child({ name });
    }
    const loggerName = name || 'core';
    const validLogLevels = [
        'fatal',
        'error',
        'warn',
        'info',
        'debug',
        'trace',
    ] as const;
    const logLevel = process.env['MCO_LOG_LEVEL'] || 'debug';

    if (!validLogLevels.includes(logLevel as LogLevel)) {
        console.warn(`Invalid log level: ${logLevel}. Defaulting to "debug"`);
    }

    logger = pino.default({
        name: loggerName,
        transport: {
            targets: [
                {
                    target: 'pino-pretty',
                    options: {
                        colorize: true,
                        translateTime: 'SYS:standard',
                    },
                    level: logLevel,
                },
                {
                    target: 'pino/file',
                    options: {
                        destination: './logs/server.log',
                        mkdir: true,
                        append: false,
                    },
                    level: logLevel,
                },
            ],
        },
        level: logLevel,
    });

    return {
        info: logger.info.bind(logger),
        warn: logger.warn.bind(logger),
        error: (msg: string, obj?: unknown) => {
            if (obj instanceof Error) {
                Sentry.captureException(obj);
            } else if (obj) {
                Sentry.captureException(new Error(msg), {
                    extra: { context: obj },
                });
            } else {
                Sentry.captureException(new Error(msg));
            }
            logger.error({ msg, obj });
        },
        fatal: logger.fatal.bind(logger),
        debug: logger.debug.bind(logger),
        trace: logger.trace.bind(logger),
        child: (obj: pino.Bindings) => logger.child(obj),
    };
}

export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export let logger: pino.Logger;
