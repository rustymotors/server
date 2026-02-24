import { type LogLevel, type ServerLogger } from './types.js';
import * as winston from 'winston';
import DailyRotateFile from "winston-daily-rotate-file"

let loggerInstance: winston.Logger | undefined = undefined;

function getOrCreateLogger(): winston.Logger {
	if (loggerInstance) {
		return loggerInstance;
	}

	const envLevel = (process.env['MCO_LOG_LEVEL'] || process.env['LOG_LEVEL']) as LogLevel;
	const logLevel: LogLevel = envLevel ?? 'verbose';

	const consoleFormat = winston.format.combine(
		winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
		winston.format.printf(({ timestamp, level, message, loggerName, ...rest }) => {
			const name = loggerName ? ` [${loggerName}]` : '';
			const extra = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : '';
			return `${timestamp} ${level}${name} ${message}${extra}`;
		}),
	);

	const logger = winston.createLogger({
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
				format: winston.format.combine(
					winston.format.timestamp(),
					winston.format.json(),
				),
			}),
		],
	});

	loggerInstance = logger;
	return logger;
}

export function getServerLogger(name?: string): ServerLogger {
	const logger = getOrCreateLogger();
	const loggerName = name || 'core';
	return wrapLogger(logger, loggerName);
}

function wrapLogger(logger: winston.Logger, name: string): ServerLogger {
	const withName = (msgOrMeta: unknown, ...args: unknown[]) => {
		if (typeof msgOrMeta === 'string') {
			// log.info("message", { extra })
			const meta = (args[0] && typeof args[0] === 'object') ? args[0] as Record<string, unknown> : {};
			return { message: msgOrMeta, ...meta, loggerName: name };
		}
		// log.info({ message: "...", extra })
		if (typeof msgOrMeta === 'object' && msgOrMeta !== null) {
			return { ...(msgOrMeta as Record<string, unknown>), loggerName: name };
		}
		return { message: String(msgOrMeta), loggerName: name };
	};

	const makeLogFn = (level: string) => {
		return (msgOrMeta: unknown, ...args: unknown[]) => {
			const merged = withName(msgOrMeta, ...args);
			logger.log(level, merged);
		};
	};

	return {
		error: makeLogFn('error') as winston.LeveledLogMethod,
		warn: makeLogFn('warn') as winston.LeveledLogMethod,
		info: makeLogFn('info') as winston.LeveledLogMethod,
		verbose: makeLogFn('verbose') as winston.LeveledLogMethod,
		debug: makeLogFn('verbose') as winston.LeveledLogMethod,
		trace: makeLogFn('verbose') as winston.LeveledLogMethod,
	};
}
