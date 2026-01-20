import { LeveledLogMethod } from 'winston';

export interface ServerLogger {
	error: LeveledLogMethod;
	warn: LeveledLogMethod;
	info: LeveledLogMethod;
	verbose: LeveledLogMethod;
	/** @deprecated Use verbose instead */
	debug: LeveledLogMethod;
	/** @deprecated Use verbose instead */
	trace: LeveledLogMethod;
}

export type LogLevel = 'error' | 'warn' | 'info' | 'verbose';
