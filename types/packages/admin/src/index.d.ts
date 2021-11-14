/**
 * SSL web server for managing the state of the system
 */
export class AdminServer {
    /** @type {AdminServer} */
    static _instance: AdminServer;
    /**
     *
     * @returns {AdminServer}
     */
    static getInstance(): AdminServer;
    /** @type {import("../../config/src/index").AppConfiguration} */
    config: any;
    /** @type {import("https").Server | undefined} */
    httpsServer: import("https").Server | undefined;
    /**
     * @private
     * @param {import("http").IncomingMessage} request
     * @param {import("http").ServerResponse} response
     * @param {import("../../core/src/connection-mgr").ConnectionManager} connectionManager
     */
    private _httpsHandler;
    /**
     * @param {import("net").Socket} socket
     */
    _socketEventHandler(socket: import("net").Socket): void;
    /**
     * @param {import("../../core/src/connection-mgr").ConnectionManager} connectionManager
     * @return {import("https").Server}
     */
    start(connectionManager: any): import("https").Server;
}
