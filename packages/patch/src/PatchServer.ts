import { IncomingMessage, ServerResponse } from "node:http";
import { CastanetResponse } from "./index.js";
import { GamePatchingServer } from "../../interfaces/index.js";
import { Logger } from "pino";

/**
 * The PatchServer class handles HTTP requests from the client for patching and upgrades
 * Please use {@link getPatchServer()} to access
 * @export
 * @class PatchServer
 */

export class PatchServer implements GamePatchingServer {
    /**
     *
     *
     * @static
     * @type {PatchServer}
     * @memberof PatchServer
     */
    public static _instance: GamePatchingServer;

    /**
     *
     *
     * @private
     * @type {TServerLogger}
     * @memberof PatchServer
     */
    private readonly log: Logger;

    /**
     * Creates an instance of PatchServer.
     * Please use getInstance() instead
     * @param {TServerLogger} log
     * @this {PatchServer}
     * @memberof PatchServer
     */
    constructor(log: Logger) {
        this.log = log;
    }

    /**
     * Return the instance of the PatchServer class
     *
     * @static
     * @param {TServerLogger} log
     * @return {PatchServer}
     * @memberof PatchServer
     */
    static getInstance(log: Logger): GamePatchingServer {
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
        this.log.debug(
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

export function getPatchServer(log: Logger): GamePatchingServer {
    return PatchServer.getInstance(log);
}
