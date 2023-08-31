import { IncomingMessage, ServerResponse } from "node:http";
import { AuthenticationServer, Logger } from "../../interfaces/index.js";

/**
 * Handles web-based user logins
 * Please use {@link getAuthServer()} to get a singleton instance
 */

export class AuthServer implements AuthenticationServer {
    static _instance: AuthServer;

    _log: Logger;

    constructor(log: Logger) {
        this._log = log;
    }

    private _handleGetTicket(): string {
        return "Valid=TRUE\nTicket=d316cd2dd6bf870893dfbaaf17f965884e";
    }

    // File deepcode ignore NoRateLimitingForExpensiveWebOperation: Not using express, unsure how to handle rate limiting on raw http
    /**
     * Handle incoming http requests
     *
     */
    handleRequest(
        request: IncomingMessage,
        response: ServerResponse
    ): ServerResponse {
        this._log(
            "debug",
            `[Web] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`
        );
        if (request.url?.startsWith("/AuthLogin")) {
            response.setHeader("Content-Type", "text/plain");
            return response.end(this._handleGetTicket());
        }

        return response.end("Unknown request.");
    }
}
/**
 * Get the single instance of the AuthServer class
 */

export function getAuthServer(log: Logger): AuthServer {
    if (!AuthServer._instance) {
        AuthServer._instance = new AuthServer(log);
    }
    return AuthServer._instance;
}
