import { ShardEntry } from "./shard-entry.js";
import { createServer } from "node:https";
import { IncomingMessage, Server, ServerResponse } from "node:http";
import { handleGetCert, handleGetKey, handleGetRegistry } from "./index.js";
import { Logger } from "pino";
import { Configuration } from "../../shared/Configuration.js";

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

export class ShardServer {
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
    private readonly _server: Server;
    /**
     * @private
     * @type {string[]} */
    private _possibleShards: string[] = [];

    /**
     * @private
     * @type {TServerLogger}
     */
    private readonly log: Logger;

    /**
     * @private
     * @type {TConfiguration}
     */
    private readonly _config: Configuration;

    /**
     * Return the instance of the ShardServer class
     * @param {TConfiguration} config
     * @param {TServerLogger} log
     * @returns {ShardServer}
     */
    static getInstance(
        config: Configuration,
        log: Logger
    ): ShardServer {
        if (typeof ShardServer.instance === "undefined") {
            ShardServer.instance = new ShardServer(config, log);
        }
        return ShardServer.instance;
    }

    /**
     * Creates an instance of ShardServer.
     *
     * Please use {@link ShardServer.getInstance()} instead
     * @param {TConfiguration} config
     * @param {TServerLogger} log
     * @memberof ShardServer
     */
    constructor(config: Configuration, log: Logger) {
        this._config = config;
        this.log = log;
        this._server = createServer(this.handleRequest.bind(this));

        this._server.on("error", (error) => {
            const err = new Error(`Server error: ${error.message}`);
            throw err;
        });
    }

    /**
     * Generate a shard list web document
     *
     * @private
     * @return {string}
     * @memberof! PatchServer
     */
    _generateShardList(): string {
        const shardHost = this._config.host;
        const shardClockTower = new ShardEntry(
            "The Clocktower",
            "The Clocktower",
            44,
            shardHost,
            8226,
            shardHost,
            7003,
            shardHost,
            0,
            "",
            "Group-1",
            88,
            2,
            shardHost,
            80
        );

        this._possibleShards.push(shardClockTower.formatForShardList());

        const shardTwinPinesMall = new ShardEntry(
            "Twin Pines Mall",
            "Twin Pines Mall",
            88,
            shardHost,
            8226,
            shardHost,
            7003,
            shardHost,
            0,
            "",
            "Group-1",
            88,
            2,
            shardHost,
            80
        );

        this._possibleShards.push(shardTwinPinesMall.formatForShardList());

        /** @type {string[]} */
        const activeShardList: string[] = [];
        activeShardList.push(shardClockTower.formatForShardList());

        return activeShardList.join("\n");
    }

    /**
     * Handle incoming http requests
     * @return {ServerResponse}
     * @param {IncomingMessage} request
     * @param {ServerResponse} response
     */
    // deepcode ignore NoRateLimitingForExpensiveWebOperation: Very unlikely to be DDos'ed
    handleRequest(
        request: IncomingMessage,
        response: ServerResponse
    ): ServerResponse {
        if (request.url === "/cert") {
            response.setHeader(
                "Content-disposition",
                "attachment; filename=cert.pem"
            );
            return response.end(handleGetCert(this._config));
        }

        if (request.url === "/key") {
            response.setHeader(
                "Content-disposition",
                "attachment; filename=pub.key"
            );
            return response.end(handleGetKey(this._config));
        }

        if (request.url === "/registry") {
            response.setHeader(
                "Content-disposition",
                "attachment; filename=mco.reg"
            );
            return response.end(handleGetRegistry(this._config));
        }

        if (request.url === "/") {
            response.statusCode = 404;
            return response.end("Hello, world!");
        }

        if (request.url === "/ShardList/") {
            this.log.debug(
                `Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`
            );

            response.setHeader("Content-Type", "text/plain");
            return response.end(this._generateShardList());
        }

        // Is this a hacker?
        response.statusCode = 404;
        response.end("");

        // Unknown request, log it
        this.log.debug(
            `Unknown Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`
        );
        return response;
    }
}
/**
 * Get the shard server instance
 * @param {TConfiguration} config
 * @param {TServerLogger} log
 * @returns {ShardServer}
 */

export function getShardServer(
    config: Configuration,
    log: Logger
): ShardServer {
    return ShardServer.getInstance(config, log);
}
