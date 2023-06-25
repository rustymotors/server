import { ServerError } from "mcos/shared";
import { ISocket, TServerLogger } from "mcos/shared/interfaces";
import { IncomingMessage, ServerResponse } from "node:http";

/**
 * Handles web-based user logins
 * Please use {@link getAuthServer()} to get a singleton instance
 * @classdesc
 */

export class AuthServer {
    static _instance: AuthServer;

    _log: TServerLogger;

    constructor(log: TServerLogger) {
        this._log = log;
    }

    /**
     * Get the single instance of the class
     *
     */
    static getInstance(log: TServerLogger): AuthServer {
        if (!AuthServer._instance) {
            AuthServer._instance = new AuthServer(log);
        }
        return AuthServer._instance;
    }

    _handleGetTicket(): string {
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

    /**
     * @private
     * @param {Socket} socket
     */
    _socketEventHandler(socket: ISocket) {
        socket.on("error", (error) => {
            const err = ServerError.fromError(error as Error);
            err.message = `[AuthLogin] Socket Error: ${err.message}`;
            throw err;
        });
    }
}
/**
 * Get the single instance of the AuthServer class
 */

export function getAuthServer(log: TServerLogger): AuthServer {
    return AuthServer.getInstance(log);
}
