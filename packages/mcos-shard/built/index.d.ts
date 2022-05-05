/**
 * Manages patch and update server connections
 * Also handles the shard list, and some utility endpoints
 * TODO: Document the endpoints
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
     * Return the instance of the ShardServer class
     * @param {import("mcos-shared/config").AppConfiguration} config
     * @returns {ShardServer}
     */
    static getInstance(config: import("mcos-shared/config").AppConfiguration): ShardServer;
    /**
     * Creates an instance of ShardServer.
     *
     * Please use {@link ShardServer.getInstance()} instead
     * @param {import("mcos-shared/config").AppConfiguration} config
     * @memberof ShardServer
     */
    constructor(config: import("mcos-shared/config").AppConfiguration);
    /**
     *
     *
     * @private
     * @type {import("node:http").Server}
     * @memberof ShardServer
     */
    private _server;
    /**
     *
     *
     * @type {import("mcos-shared/config").AppConfiguration}
     * @memberof ShardServer
     */
    config: import("mcos-shared/config").AppConfiguration;
    /** @type {string[]} */
    _possibleShards: string[];
    /**
     * Generate a shard list web document
     *
     * @private
     * @return {string}
     * @memberof! PatchServer
     */
    private _generateShardList;
    /**
     *
     * @private
     * @return {string}
     * @memberof! WebServer
     */
    private _handleGetCert;
    /**
     *
     * @private
     * @return {string}
     * @memberof! WebServer
     */
    private _handleGetKey;
    /**
     *
     * @private
     * @return {string}
     * @memberof! WebServer
     */
    private _handleGetRegistry;
    /**
     * Handle incoming http requests
     * @return {import("node:http").ServerResponse}
     * @param {import("http").IncomingMessage} request
     * @param {import("http").ServerResponse} response
     */
    handleRequest(request: import("http").IncomingMessage, response: import("http").ServerResponse): import("node:http").ServerResponse;
    /**
     * Start the shard server listener
     * @returns {import("node:http").Server}
     */
    start(): import("node:http").Server;
}
//# sourceMappingURL=index.d.ts.map