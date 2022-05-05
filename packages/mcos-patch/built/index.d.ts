export namespace CastanetResponse {
    const body: Buffer;
    namespace header {
        const type: string;
        const value: string;
    }
}
/**
 * The PatchServer class handles HTTP requests from the client for patching and upgrades
 * @class
 */
export class PatchServer {
    /**
     *
     *
     * @static
     * @private
     * @type {PatchServer}
     * @memberof PatchServer
     */
    private static _instance;
    /**
     * Return the instance of the PatchServer class
     *
     * @static
     * @param {import("mcos-shared/config").AppConfiguration} config
     * @return {PatchServer}
     * @memberof PatchServer
     */
    static getInstance(config: import("mcos-shared/config").AppConfiguration): PatchServer;
    /**
     * Creates an instance of PatchServer.
     *
     * Please use {@link PatchServer.getInstance()} instead
     * @param {import("mcos-shared/config").AppConfiguration} config
     * @memberof PatchServer
     */
    constructor(config: import("mcos-shared/config").AppConfiguration);
    /**
     * Starts the HTTP listener
     */
    start(): void;
    /** @type {import("mcos-shared/config").AppConfiguration} */
    config: import("mcos-shared/config").AppConfiguration;
    /**
     * Returns the hard-coded value that tells the client there are no updates or patches
     * @param {import("node:http").IncomingMessage} request
     * @param {import("node:http").ServerResponse} response
     * @returns {import("node:http").ServerResponse}
     */
    castanetResponse(request: import("node:http").IncomingMessage, response: import("node:http").ServerResponse): import("node:http").ServerResponse;
    /**
     * Routes incomming HTTP requests
     * @param {import("node:http").IncomingMessage} request
     * @param {import("node:http").ServerResponse} response
     * @returns {import("node:http").ServerResponse}
     */
    handleRequest(request: import("node:http").IncomingMessage, response: import("node:http").ServerResponse): import("node:http").ServerResponse;
}
//# sourceMappingURL=index.d.ts.map