/**
 * SSL web server for managing the state of the system
 */
export class AdminServer {
    /** @type {AdminServer} */
    static _instance: AdminServer;
    /**
     *
     * @param {import("../../core/src/index").MCServer | undefined} mcServer
     * @returns {AdminServer}
     */
    static getInstance(mcServer: import("../../core/src/index").MCServer | undefined): AdminServer;
    /**
     * @private
     * @param {import("../../core/src/index").MCServer} mcServer
     */
    private constructor();
    /** @type {import("../../config/src/index").AppConfiguration} */
    config: import("../../config/src/index").AppConfiguration;
    /** @type {import("../../core/src/index").MCServer} */
    mcServer: import("../../core/src/index").MCServer;
    /** @type {import("https").Server | undefined} */
    httpsServer: import("https").Server | undefined;
    /**
     * @private
     * @return {string}
     */
    private _handleGetConnections;
    /**
     * @private
     * @return {string}
     */
    private _handleResetAllQueueState;
    /**
     * @private
     * @param {import("http").IncomingMessage} request
     * @param {import("http").ServerResponse} response
     */
    private _httpsHandler;
    /**
     * @param {import("net").Socket} socket
     */
    _socketEventHandler(socket: import("net").Socket): void;
    /**
     * @return {import("https").Server}
     */
    start(): import("https").Server;
}
