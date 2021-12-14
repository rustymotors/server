/// <reference types="node" />
import http from 'http';
import config from './server.config';
/**
 * Manages patch and update server connections
 * Also handles the shard list, and some utility endpoints
 * TODO: Document the endpoints
 * @module PatchServer
 */
/**
 * @class
 * @property {config.config} config
 * @property {string[]} banList
 * @property {string[]} possibleShards
 * @property {Server} serverPatch
 */
export declare class ShardServer {
    static _instance: ShardServer;
    _config: typeof config;
    _possibleShards: string[];
    _server: http.Server;
    _serviceName: string;
    static getInstance(): ShardServer;
    private constructor();
    /**
     * Generate a shard list web document
     *
     * @return {string}
     * @memberof! PatchServer
     */
    _generateShardList(): string;
    /**
     *
     * @return {string}
     * @memberof! WebServer
     */
    _handleGetCert(): string;
    /**
     *
     * @return {string}
     * @memberof! WebServer
     */
    _handleGetKey(): string;
    /**
     *
     * @return {string}
     * @memberof! WebServer
     */
    _handleGetRegistry(): string;
    /**
     * @return {void}
     * @memberof ! PatchServer
     * @param {import("http").IncomingMessage} request
     * @param {import("http").ServerResponse} response
     */
    _handleRequest(request: http.IncomingMessage, response: http.ServerResponse): void;
    start(): http.Server;
}
