/// <reference types="node" />
import { IncomingMessage, ServerResponse } from "node:http";
import { TConfiguration, TServerLogger } from "mcos/shared/interfaces";
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
    static getInstance(config: TConfiguration, log: TServerLogger): ShardServer;
    /**
     * Creates an instance of ShardServer.
     *
     * Please use {@link ShardServer.getInstance()} instead
     * @param {TConfiguration} config
     * @param {TServerLogger} log
     * @memberof ShardServer
     */
    constructor(config: TConfiguration, log: TServerLogger);
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
export declare function getShardServer(config: TConfiguration, log: TServerLogger): ShardServer;
