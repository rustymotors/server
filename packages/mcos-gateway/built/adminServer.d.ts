/**
 * Please use {@link AdminServer.getAdminServer()}
 * @classdesc
 * @property {config} config
 * @property {IMCServer} mcServer
 * @property {Server} httpServer
 */
export class AdminServer {
    /**
     *
     *
     * @private
     * @static
     * @type {AdminServer}
     * @memberof AdminServer
     */
    private static _instance;
    /**
     * Get the single instance of the class
     *
     * @static
     * @return {AdminServer}
     * @memberof AdminServer
     */
    static getAdminServer(): AdminServer;
    /**
     * Creates an instance of AdminServer.
     *
     * Please use {@link AdminServer.getInstance()} instead
     * @internal
     * @memberof AdminServer
     */
    /**
     * @private
     * @return {string}
     */
    private _handleGetConnections;
    /**
     * Handle incomming http requests
     *
     * @return {import("node:http").ServerResponse}
     * @param {import("http").IncomingMessage} request
     * @param {import("http").ServerResponse} response
     */
    handleRequest(request: import("http").IncomingMessage, response: import("http").ServerResponse): import("node:http").ServerResponse;
}
//# sourceMappingURL=adminServer.d.ts.map