import pino from 'pino';

export interface Logger {
    info: (msg: string, obj?: unknown) => void;
    warn: (msg: string, obj?: unknown) => void;
    error: (msg: string, obj?: unknown) => void;
    fatal: (msg: string, obj?: unknown) => void;
    debug: (msg: string, obj?: unknown) => void;
    trace: (msg: string, obj?: unknown) => void;
    child: (obj: pino.Bindings) => Logger;
}

export type ServerLogger = Logger;
