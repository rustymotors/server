/// <reference types="node" />
import { IncomingMessage } from "node:http";
import { AdminWebServer, Logger, WebJSONResponse } from "../../interfaces/index.js";
/**
 * The admin server.
 * Please use {@link getAdminServer()} to get the single instance of this class.
 * @classdesc
 * @property {config} config
 * @property {IMCServer} mcServer
 * @property {Server} httpServer
 */
export declare class AdminServer implements AdminWebServer {
    static _instance: AdminServer;
    _log: Logger;
    constructor(log: Logger);
    /**
     * Get the single instance of the class
     *
     */
    static getInstance(log: Logger): AdminServer;
    /**
     * Handle incomming http requests
     *
     */
    handleRequest(request: IncomingMessage): WebJSONResponse;
}
/**
 * Get the single instance of the AdminServer class
 */
export declare function getAdminServer(log: Logger): AdminServer;
//# sourceMappingURL=AdminServer.d.ts.map