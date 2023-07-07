/// <reference types="node" />
import { IAuthServer, TServerLogger } from "mcos/shared/interfaces";
import { IncomingMessage, ServerResponse } from "node:http";
/**
 * Handles web-based user logins
 * Please use {@link getAuthServer()} to get a singleton instance
 * @classdesc
 */
export declare class AuthServer implements IAuthServer {
    static _instance: AuthServer;
    _log: TServerLogger;
    constructor(log: TServerLogger);
    private _handleGetTicket;
    /**
     * Handle incoming http requests
     *
     */
    handleRequest(request: IncomingMessage, response: ServerResponse): ServerResponse;
}
/**
 * Get the single instance of the AuthServer class
 */
export declare function getAuthServer(log: TServerLogger): AuthServer;
