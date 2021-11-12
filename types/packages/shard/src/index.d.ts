/// <reference types="node" />
/**
 * Manages patch and update server connections
 * Also handles the shard list, and some utility endpoints
 * TODO: Document the endpoints
 */
export class ShardServer {
    /** @type {ShardServer} */
    static _instance: ShardServer;
    /**
     *
     * @returns {ShardServer}
     */
    static getInstance(): ShardServer;
    /** @type {AppConfiguration} */
    _config: AppConfiguration;
    /** @type {string[]} */
    _possibleShards: string[];
    /** @type {Server} */
    _server: Server;
    /**
     * Generate a shard list web document
     *
     * @return {string}
     */
    _generateShardList(): string;
    /**
     *
     * @return {string}
     */
    _handleGetCert(): string;
    /**
     *
     * @return {string}
     */
    _handleGetKey(): string;
    /**
     *
     * @return {string}
     */
    _handleGetRegistry(): string;
    /**
     * @param {IncomingMessage} request
     * @param {ServerResponse} response
     */
    _handleRequest(request: IncomingMessage, response: ServerResponse): void;
    /**
     *
     * @returns {Server}
     */
    start(): Server;
}
import { AppConfiguration } from "../../config/src/index";
import { Server } from "https";
import { IncomingMessage } from "http";
import { ServerResponse } from "http";
