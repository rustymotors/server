import EventEmitter from "node:events";
import { IncomingMessage, Server, ServerResponse } from "node:http";

export interface IWebServer extends EventEmitter {
    listeningPort: number;
    nodeServer: Server;
}

export interface ILogger {
    error: (message: string) => void;
    warn: (message: string) => void;
    info: (message: string) => void;
    debug: (message: string) => void;
}

export interface IRoute {
    canHandle(url: string, method: string): boolean;
    handle(request: IncomingMessage, response: ServerResponse): Promise<void>;
}
