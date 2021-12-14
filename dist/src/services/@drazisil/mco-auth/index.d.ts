/// <reference types="node" />
import https from 'https';
import config from './server.config';
import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';
import { ISslOptions } from '../../../types';
/**
 * Handles web-based user logins
 * @module AuthLogin
 */
/**
 * @class
 * @property {Object} config
 * @property {Object} config.certificate
 * @property {string} config.certificate.privateKeyFilename
 * @property {string} config.certificate.publicKeyFilename
 * @property {string} config.certificate.certFilename
 * @property {Object} config.serverSettings
 * @property {string} config.serverSettings.ipServer
 * @property {Object} config.serviceConnections
 * @property {string} config.serviceConnections.databaseURL
 * @property {string} config.defaultLogLevel
 * @property {Server} httpsServer
 */
export declare class AuthLogin {
    static _instance: AuthLogin;
    config: typeof config;
    _serviceName: string;
    _server: https.Server;
    static getInstance(): AuthLogin;
    private constructor();
    /**
     *
     * @return {string}
     * @memberof! WebServer
     */
    _handleGetTicket(): string;
    /**
     * @returns {void}
     * @memberof ! WebServer
     * @param {import("http").IncomingMessage} request
     * @param {import("http").ServerResponse} response
     */
    handleRequest(request: IncomingMessage, response: ServerResponse): void;
    /**
     * @returns {void}
     * @param {import("net").Socket} socket
     */
    _socketEventHandler(socket: Socket): void;
    /**
     *
     * @returns {Promise<import("https").Server>}
     * @memberof! WebServer
     */
    start(): Promise<https.Server>;
    _sslOptions(): ISslOptions;
}
