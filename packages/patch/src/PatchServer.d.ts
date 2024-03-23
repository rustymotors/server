/// <reference types="node" />
/// <reference types="node" />
import { IncomingMessage, ServerResponse } from "node:http";
import { ServerLogger } from "../../shared";
import { Buffer } from "node:buffer";
export declare const CastanetResponse: {
    body: Buffer;
    header: {
        type: string;
        value: string;
    };
};
/**
 * The PatchServer class handles HTTP requests from the client for patching and upgrades
 * Please use {@link getPatchServer()} to access
 * @export
 * @class PatchServer
 */
export declare class PatchServer {
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
     * @type {ServerLogger}
     */
    _log: ServerLogger;
    /**
     * Creates an instance of PatchServer.
     * Please use getInstance() instead
     * @param {ServerLogger} log
     * @memberof PatchServer
     */
    constructor(log: ServerLogger);
    /**
     * Return the instance of the PatchServer class
     *
     * @static
     * @param {ServerLogger} log
     * @return {PatchServer}
     * @memberof PatchServer
     */
    static getInstance(log: ServerLogger): PatchServer;
    /**
     * Returns the hard-coded value that tells the client there are no updates or patches
     * @param {IncomingMessage} request
     * @param {ServerResponse} response
     * @returns {ServerResponse}
     */
    castanetResponse(
        request: IncomingMessage,
        response: ServerResponse,
    ): ServerResponse;
    /**
     * Routes incomming HTTP requests
     * @param {IncomingMessage} request
     * @param {ServerResponse} response
     * @returns {ServerResponse}
     */
    handleRequest(
        request: IncomingMessage,
        response: ServerResponse,
    ): ServerResponse;
}
/**
 * Return the instance of the PatchServer class
 * @returns {PatchServer}
 */
export declare function getPatchServer(log: ServerLogger): PatchServer;
