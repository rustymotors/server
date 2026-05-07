import { LeveledLogMethod } from 'winston';

export interface ServerLogger {
	error: LeveledLogMethod;
	warn: LeveledLogMethod;
	info: LeveledLogMethod;
	verbose: LeveledLogMethod;
	debug: LeveledLogMethod;
	/** @deprecated Use debug instead */
	trace: LeveledLogMethod;
	child(bindings: Record<string, unknown>): ServerLogger;
}

export type LogLevel = 'error' | 'warn' | 'info' | 'verbose' | 'debug';

export interface LogContext {
	connectionId?: string;
	port?: number;
	remoteAddress?: string;
	remotePort?: number;
	personaId?: number | string;
	[key: string]: unknown;
}
