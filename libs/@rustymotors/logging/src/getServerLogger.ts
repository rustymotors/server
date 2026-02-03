import { LogLevel, ServerLogger } from './types.js';
import * as winston from 'winston';
import DailyRotateFile from "winston-daily-rotate-file"

let loggerInstance: winston.Logger | undefined = undefined;

export function getServerLogger(name?: string): ServerLogger {
	if (typeof loggerInstance !== 'undefined') {
		const loggerName = name || 'core';
		return wrapLogger(loggerInstance.child({ defaultMeta: { name: loggerName } }));
	}
	const loggerName = name || 'core';
	const envLevel = (process.env['MCO_LOG_LEVEL'] || process.env['LOG_LEVEL']) as LogLevel;
	const logLevel: LogLevel = envLevel ?? 'verbose';
	const logFormat = process.env['LOG_FORMAT'] === 'json' ? 'json' : 'simple';

	// Choose format based on environment variable
	const consoleFormat = logFormat === 'json'
		? winston.format.json()
		: winston.format.combine(
			  winston.format.colorize(),
			  winston.format.simple(),
		  );

	let logger = winston.createLogger({
		defaultMeta: {
			name: loggerName,
		},
		level: logLevel,
		transports: [
			new winston.transports.Console({
				level: logLevel,
				format: consoleFormat,
			}),
			new DailyRotateFile({
				level: logLevel,
				filename: 'data/application-%DATE%.log',
				datePattern: 'YYYY-MM-DD-HH',
				zippedArchive: true,
				maxSize: '20m',
				maxFiles: '14d',
				format: logFormat === 'json' ? winston.format.json() : winston.format.combine(
					winston.format.timestamp(),
					winston.format.simple(),
				),
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
