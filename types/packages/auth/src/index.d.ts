/// <reference types="node" />
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
    /** @type {AppConfiguration} */
    config: AppConfiguration;
    /** @type {Server} */
    _server: Server;
    /**
     *
     * @return {string}
     */
    _handleGetTicket(): string;
    /**
     *
     * @param {IncomingMessage} request
     * @param {ServerResponse} response
     */
    handleRequest(request: IncomingMessage, response: ServerResponse): void;
    /**
     * @private
     * @param {Socket} socket
     */
    private _socketEventHandler;
    start(): void;
    /**
     * @private
     * @returns {SSLOptions}
     */
    private _sslOptions;
}
export type SSLOptions = {
    cert: string;
    honorCipherOrder: boolean;
    key: string;
    rejectUnauthorized: boolean;
};
import { AppConfiguration } from "../../config/src/index";
import { Server } from "https";
import { IncomingMessage } from "http";
import { ServerResponse } from "http";
