/// <reference types="node" resolution-mode="require"/>
import { IncomingMessage, ServerResponse } from "node:http";
import { GamePatchingServer, Logger } from "../../interfaces/index.js";
/**
 * The PatchServer class handles HTTP requests from the client for patching and upgrades
 * Please use {@link getPatchServer()} to access
 * @export
 * @class PatchServer
 */
export declare class PatchServer implements GamePatchingServer {
    /**
     *
     *
     * @static
     * @type {PatchServer}
     * @memberof PatchServer
     */
    static _instance: GamePatchingServer;
    /**
     *
     *
     * @private
     * @type {TServerLogger}
     * @memberof PatchServer
     */
    private readonly _log;
    /**
     * Creates an instance of PatchServer.
     * Please use getInstance() instead
     * @param {TServerLogger} log
     * @this {PatchServer}
     * @memberof PatchServer
     */
    constructor(log: Logger);
    /**
     * Return the instance of the PatchServer class
     *
     * @static
     * @param {TServerLogger} log
     * @return {PatchServer}
     * @memberof PatchServer
     */
    static getInstance(log: Logger): GamePatchingServer;
    /**
     * Returns the hard-coded value that tells the client there are no updates or patches
     * @param {IncomingMessage} request
     * @param {ServerResponse} response
     * @returns {ServerResponse}
     */
    castanetResponse(request: IncomingMessage, response: ServerResponse): ServerResponse;
    /**
     * Routes incomming HTTP requests
     * @param {IncomingMessage} request
     * @param {ServerResponse} response
     * @returns {ServerResponse}
     */
    handleRequest(request: IncomingMessage, response: ServerResponse): ServerResponse;
}
/**
 * Return the instance of the PatchServer class
 * @param {TServerLogger} log
 * @returns {PatchServer}
 */
export declare function getPatchServer(log: Logger): GamePatchingServer;
//# sourceMappingURL=PatchServer.d.ts.map