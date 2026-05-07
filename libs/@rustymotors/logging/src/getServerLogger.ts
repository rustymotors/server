import { AsyncLocalStorage } from 'node:async_hooks';
import { type LogContext, type LogLevel, type ServerLogger } from './types.js';
import * as winston from 'winston';
import DailyRotateFile from "winston-daily-rotate-file"

let loggerInstance: winston.Logger | undefined = undefined;

const logContextStorage = new AsyncLocalStorage<LogContext>();

export function runWithLogContext<T>(ctx: LogContext, fn: () => T): T {
	return logContextStorage.run(ctx, fn);
}

export function getLogContext(): LogContext | undefined {
	return logContextStorage.getStore();
}

export function setLogContext(partial: Partial<LogContext>): void {
	const store = logContextStorage.getStore();
	if (store) {
		Object.assign(store, partial);
	}
}

/**
 * Capture the current log context and return a wrapper that re-enters it when
 * called. Use this for callbacks that fire from outside the originating async
 * frame — most notably EventEmitter listeners (e.g. `socket.on('end' | 'error')`),
 * because EventEmitter does not propagate AsyncLocalStorage context across emit.
 *
 * If there is no current context, the function is returned unchanged.
 */
export function bindLogContext<F extends (...args: unknown[]) => unknown>(
	fn: F,
): F {
	const captured = logContextStorage.getStore();
	if (!captured) return fn;
	return ((...args: unknown[]) =>
		logContextStorage.run(captured, () => fn(...args))) as F;
}

function serializeError(err: Error): Record<string, unknown> {
	const e = err as NodeJS.ErrnoException;
	const out: Record<string, unknown> = {
		name: err.name,
		message: err.message,
		stack: err.stack,
	};
	if (e.code !== undefined) out['code'] = e.code;
	if (e.errno !== undefined) out['errno'] = e.errno;
	if (e.syscall !== undefined) out['syscall'] = e.syscall;
	if ((err as Error & { cause?: unknown }).cause !== undefined) {
		const cause = (err as Error & { cause?: unknown }).cause;
		out['cause'] = cause instanceof Error ? serializeError(cause) : cause;
	}
	return out;
}

function normalizeMeta(meta: Record<string, unknown>): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const [k, v] of Object.entries(meta)) {
		out[k] = v instanceof Error ? serializeError(v) : v;
	}
	return out;
}

function getOrCreateLogger(): winston.Logger {
	if (loggerInstance) {
		return loggerInstance;
	}

	const envLevel = (process.env['MCO_LOG_LEVEL'] || process.env['LOG_LEVEL']) as LogLevel;
	const logLevel: LogLevel = envLevel ?? 'verbose';

	const consoleFormat = winston.format.combine(
		winston.format.errors({ stack: true }),
		winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
		winston.format.printf(({ timestamp, level, message, loggerName, stack, err, ...rest }) => {
			const name = loggerName ? ` [${loggerName}]` : '';
			const extra = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : '';
			const errStack =
				typeof stack === 'string'
					? `\n${stack}`
					: err && typeof err === 'object' && typeof (err as { stack?: unknown }).stack === 'string'
						? `\n${(err as { stack: string }).stack}`
						: '';
			return `${timestamp} ${level}${name} ${message}${extra}${errStack}`;
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
					winston.format.errors({ stack: true }),
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
	return wrapLogger(logger, loggerName, {});
}

/**
 * @internal Exposed for testing. Production code should use getServerLogger.
 * Wraps an existing Winston logger with the ServerLogger API plus ALS context
 * merging and error normalization.
 */
export function _createServerLoggerForTesting(
	logger: winston.Logger,
	name: string,
	bindings: Record<string, unknown> = {},
): ServerLogger {
	return wrapLogger(logger, name, bindings);
}

function wrapLogger(
	logger: winston.Logger,
	name: string,
	bindings: Record<string, unknown>,
): ServerLogger {
	const buildInfo = (msgOrMeta: unknown, args: unknown[]): Record<string, unknown> => {
		const ctx = logContextStorage.getStore() ?? {};
		if (msgOrMeta instanceof Error) {
			return {
				...ctx,
				...bindings,
				message: msgOrMeta.message,
				err: serializeError(msgOrMeta),
				loggerName: name,
			};
		}
		if (typeof msgOrMeta === 'string') {
			const rawMeta =
				args[0] && typeof args[0] === 'object' && !(args[0] instanceof Error)
					? (args[0] as Record<string, unknown>)
					: args[0] instanceof Error
						? { err: args[0] }
						: {};
			return {
				...ctx,
				...bindings,
				...normalizeMeta(rawMeta),
				message: msgOrMeta,
				loggerName: name,
			};
		}
		if (typeof msgOrMeta === 'object' && msgOrMeta !== null) {
			return {
				...ctx,
				...bindings,
				...normalizeMeta(msgOrMeta as Record<string, unknown>),
				loggerName: name,
			};
		}
		return { ...ctx, ...bindings, message: String(msgOrMeta), loggerName: name };
	};

	const makeLogFn = (level: string) => {
		return (msgOrMeta: unknown, ...args: unknown[]) => {
			const merged = buildInfo(msgOrMeta, args);
			logger.log(level, merged);
		};
	};

	return {
		error: makeLogFn('error') as winston.LeveledLogMethod,
		warn: makeLogFn('warn') as winston.LeveledLogMethod,
		info: makeLogFn('info') as winston.LeveledLogMethod,
		verbose: makeLogFn('verbose') as winston.LeveledLogMethod,
		debug: makeLogFn('debug') as winston.LeveledLogMethod,
		trace: makeLogFn('debug') as winston.LeveledLogMethod,
		child: (newBindings) =>
			wrapLogger(logger, name, { ...bindings, ...newBindings }),
	};
}
