export type SSLOptions = {
    cert: string;
    honorCipherOrder: boolean;
    key: string;
    rejectUnauthorized: boolean;
};
/**
 * @typedef {Object} SSLOptions
 * @property {string} cert
 * @property {boolean} honorCipherOrder
 * @property {string} key
 * @property {boolean} rejectUnauthorized
 */
/**
 * @exports
 * Handles web-based user logins
 */
export class AuthLogin {
    /** @type {AuthLogin} */
    static _instance: AuthLogin;
    /**
     *
     * @returns {AuthLogin}
     */
    static getInstance(): AuthLogin;
    /** @type {import("../../config/src/index").AppConfiguration} */
    config: import("../../config/src/index").AppConfiguration;
    /** @type {import("https").Server} */
    _server: import("https").Server;
    /**
     *
     * @return {string}
     */
    _handleGetTicket(): string;
    /**
     *
     * @param {import('http').IncomingMessage} request
     * @param {import('http').ServerResponse} response
     */
    handleRequest(request: import('http').IncomingMessage, response: import('http').ServerResponse): void;
    start(): void;
    /**
     * @private
     * @returns {SSLOptions}
     */
    private _sslOptions;
}
