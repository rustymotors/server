import { IPatchServer, TServerLogger } from "mcos/shared/interfaces";
import { IncomingMessage, ServerResponse, createServer } from "node:http";
import { CastanetResponse } from "./index.js";

/**
 * The PatchServer class handles HTTP requests from the client for patching and upgrades
 * Please use {@link getPatchServer()} to access
 * @export
 * @class PatchServer
 */

export class PatchServer implements IPatchServer {
    /**
     *
     *
     * @static
     * @type {PatchServer}
     * @memberof PatchServer
     */
    public static _instance: PatchServer;

    /**
     *
     *
     * @private
     * @type {TServerLogger}
     * @memberof PatchServer
     */
    private readonly _log: TServerLogger;

    /**
     * Creates an instance of PatchServer.
     * Please use getInstance() instead
     * @param {TServerLogger} log
     * @this {PatchServer}
     * @memberof PatchServer
     */
    constructor(log: TServerLogger) {
        this._log = log;
    }

    /**
     * Return the instance of the PatchServer class
     *
     * @static
     * @param {TServerLogger} log
     * @return {PatchServer}
     * @memberof PatchServer
     */
    static getInstance(log: TServerLogger): PatchServer {
        if (!PatchServer._instance) {
            PatchServer._instance = new PatchServer(log);
        }
        return PatchServer._instance;
    }

    /**
     * Returns the hard-coded value that tells the client there are no updates or patches
     * @param {IncomingMessage} request
     * @param {ServerResponse} response
     * @returns {ServerResponse}
     */
    castanetResponse(
        request: IncomingMessage,
        response: ServerResponse
    ): ServerResponse {
        this._log(
            "debug",
            `[PATCH] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`
        );

        response.setHeader(
            CastanetResponse.header.type,
            CastanetResponse.header.value
        );
        return response.end(CastanetResponse.body);
    }

    /**
     * Routes incomming HTTP requests
     * @param {IncomingMessage} request
     * @param {ServerResponse} response
     * @returns {ServerResponse}
     */
    handleRequest(
        request: IncomingMessage,
        response: ServerResponse
    ): ServerResponse {
        if (
            request.url === "/games/EA_Seattle/MotorCity/UpdateInfo" ||
            request.url === "/games/EA_Seattle/MotorCity/NPS" ||
            request.url === "/games/EA_Seattle/MotorCity/MCO"
        ) {
            return this.castanetResponse(request, response);
        }
        response.statusCode = 404;
        return response.end("");
    }
}
/**
 * Return the instance of the PatchServer class
 * @param {TServerLogger} log
 * @returns {PatchServer}
 */

export function getPatchServer(log: TServerLogger): PatchServer {
    return PatchServer.getInstance(log);
}
