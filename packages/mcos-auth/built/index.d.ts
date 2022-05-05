/**
 * Handles web-based user logins
 * Please use {@link AuthLogin.getInstance()}
 * @classdesc
 */
export class AuthLogin {
    /**
     *
     *
     * @private
     * @static
     * @type {AuthLogin}
     * @memberof AuthLogin
     */
    private static _instance;
    /**
     * Get the single instance of the class
     *
     * @static
     * @return {AuthLogin}
     * @memberof AuthLogin
     */
    static getInstance(): AuthLogin;
    /**
     *
     * @private
     * @return {string}
     * @memberof! WebServer
     */
    private _handleGetTicket;
    /**
     * Handle incoming http requests
     *
     * @returns {import("node:http").ServerResponse}
     * @param {import("node:http").IncomingMessage} request
     * @param {import("node:http").ServerResponse} response
     */
    handleRequest(request: import("node:http").IncomingMessage, response: import("node:http").ServerResponse): import("node:http").ServerResponse;
    /**
     * @private
     * @returns {void}
     * @param {import("net").Socket} socket
     */
    private _socketEventHandler;
}
//# sourceMappingURL=index.d.ts.map