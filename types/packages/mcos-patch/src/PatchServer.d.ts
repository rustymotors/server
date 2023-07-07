/// <reference types="node" />
import { IPatchServer, TServerLogger } from "mcos/shared/interfaces";
import { IncomingMessage, ServerResponse } from "node:http";
/**
 * The PatchServer class handles HTTP requests from the client for patching and upgrades
 * Please use {@link getPatchServer()} to access
 * @export
 * @class PatchServer
 */
export declare class PatchServer implements IPatchServer {
    /**
     *
     *
     * @static
     * @type {PatchServer}
     * @memberof PatchServer
     */
    static _instance: PatchServer;
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
    constructor(log: TServerLogger);
    /**
     * Return the instance of the PatchServer class
     *
     * @static
     * @param {TServerLogger} log
     * @return {PatchServer}
     * @memberof PatchServer
     */
    static getInstance(log: TServerLogger): PatchServer;
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
export declare function getPatchServer(log: TServerLogger): PatchServer;
