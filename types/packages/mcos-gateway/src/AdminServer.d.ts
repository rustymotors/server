/// <reference types="node" />
import { IncomingMessage } from "node:http";
import { IAdminServer, TJSONResponse, TServerLogger } from "mcos/shared/interfaces";
/**
 * The admin server.
 * Please use {@link getAdminServer()} to get the single instance of this class.
 * @classdesc
 * @property {config} config
 * @property {IMCServer} mcServer
 * @property {Server} httpServer
 */
export declare class AdminServer implements IAdminServer {
    static _instance: AdminServer;
    _log: TServerLogger;
    constructor(log: TServerLogger);
    /**
     * Get the single instance of the class
     *
     */
    static getInstance(log: TServerLogger): AdminServer;
    /**
     * Handle incomming http requests
     *
     */
    handleRequest(request: IncomingMessage): TJSONResponse;
}
/**
 * Get the single instance of the AdminServer class
 */
export declare function getAdminServer(log: TServerLogger): AdminServer;
