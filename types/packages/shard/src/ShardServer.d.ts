/// <reference types="node" resolution-mode="require"/>
import { IncomingMessage, ServerResponse } from "node:http";
import { Logger, ServerConfiguration } from "../../interfaces/index.js";
/**
 * Manages patch and update server connections
 * Also handles the shard list, and some utility endpoints
 */
/**
 *
 *
 * @export
 * @class ShardServer
 */
export declare class ShardServer {
    /**
     *
     *
     * @static
     * @type {ShardServer}
     * @memberof ShardServer
     */
    static instance: ShardServer;
    /**
     *
     *
     * @private
     * @type {Server}
     * @memberof ShardServer
     */
    private readonly _server;
    /**
     * @private
     * @type {string[]} */
    private _possibleShards;
    /**
     * @private
     * @type {TServerLogger}
     */
    private readonly _log;
    /**
     * @private
     * @type {TConfiguration}
     */
    private readonly _config;
    /**
     * Return the instance of the ShardServer class
     * @param {TConfiguration} config
     * @param {TServerLogger} log
     * @returns {ShardServer}
     */
    static getInstance(config: ServerConfiguration, log: Logger): ShardServer;
    /**
     * Creates an instance of ShardServer.
     *
     * Please use {@link ShardServer.getInstance()} instead
     * @param {TConfiguration} config
     * @param {TServerLogger} log
     * @memberof ShardServer
     */
    constructor(config: ServerConfiguration, log: Logger);
    /**
     * Generate a shard list web document
     *
     * @private
     * @return {string}
     * @memberof! PatchServer
     */
    _generateShardList(): string;
    /**
     * Handle incoming http requests
     * @return {ServerResponse}
     * @param {IncomingMessage} request
     * @param {ServerResponse} response
     */
    handleRequest(request: IncomingMessage, response: ServerResponse): ServerResponse;
}
/**
 * Get the shard server instance
 * @param {TConfiguration} config
 * @param {TServerLogger} log
 * @returns {ShardServer}
 */
export declare function getShardServer(config: ServerConfiguration, log: Logger): ShardServer;
//# sourceMappingURL=ShardServer.d.ts.map