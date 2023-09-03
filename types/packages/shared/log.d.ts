import { LoggerOptions, Logger } from "pino";
declare module "pino" {
    interface LoggerOptions {
        module?: string;
    }
}
export declare class ServerLogger {
    readonly logger: Logger;
    static instance: ServerLogger;
    constructor(options: LoggerOptions);
    fatal(message: string): void;
    error(message: string): void;
    warn(message: string): void;
    info(message: string): void;
    debug(message: string): void;
    trace(message: string): void;
    child(options: LoggerOptions): Logger;
}
export declare function getServerLogger(options: LoggerOptions): Logger;
//# sourceMappingURL=log.d.ts.map