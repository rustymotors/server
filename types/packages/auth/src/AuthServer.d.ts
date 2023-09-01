/// <reference types="node" />
import { IncomingMessage, ServerResponse } from "node:http";
import { AuthenticationServer, Logger } from "../../interfaces/index.js";
/**
 * Handles web-based user logins
 * Please use {@link getAuthServer()} to get a singleton instance
 */
export declare class AuthServer implements AuthenticationServer {
    static _instance: AuthServer;
    _log: Logger;
    constructor(log: Logger);
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
export declare function getAuthServer(log: Logger): AuthServer;
//# sourceMappingURL=AuthServer.d.ts.map