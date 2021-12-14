/// <reference types="node" />
import { IncomingMessage, Server, ServerResponse } from 'http';
import { IAppConfiguration } from '../../../config/index';
/**
 * Manages patch and update server connections
 * Also handles the shard list, and some utility endpoints
 * TODO: Document the endpoints
 * @module PatchServer
 */
interface ICastanetResponse {
    body: Buffer;
    header: {
        type: string;
        value: string;
    };
}
/**
 * A simulated patch server response
 * @type {ICastanetResponse}
 */
export declare const CastanetResponse: ICastanetResponse;
/**
 * @class
 * @property {config.config} config
 * @property {string[]} banList
 * @property {string[]} possibleShards
 * @property {Server} serverPatch
 */
export declare class PatchServer {
    config: IAppConfiguration;
    banList: string[];
    possibleShards: string[];
    serverPatch: Server | undefined;
    serviceName: string;
    constructor();
    /**
     * Simulate a response from a update server
     *
     * @return {ICastanetResponse}
     * @memberof! PatchServer
     */
    _patchUpdateInfo(): ICastanetResponse;
    /**
     * Simulate a response from a patch server
     *
     * @return {ICastanetResponse}
     * @memberof! PatchServer
     */
    _patchNPS(): ICastanetResponse;
    /**
     * Simulate a response from a patch server
     *
     * @return {ICastanetResponse}
     * @memberof! PatchServer
     */
    _patchMCO(): ICastanetResponse;
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
    _httpHandler(request: IncomingMessage, response: ServerResponse): void;
    /**
     *
     * @param {string} banIP
     * @return {void}
     * @memberof! PatchServer
     */
    _addBan(banIP: string): void;
    /**
     *
     * @return {string[]}
     * @memberof! PatchServer
     */
    _getBans(): string[];
    /**
     *
     * @return {void}
     * @memberof! PatchServer
     */
    _clearBans(): void;
    /**
     *
     * @memberof! PatchServer
     * @return {Promise<import("http").Server>}
     */
    start(): Promise<import('http').Server>;
}
export {};
