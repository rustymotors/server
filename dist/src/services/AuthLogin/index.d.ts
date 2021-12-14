/// <reference types="node" />
import { Server } from 'https';
import { IAppConfiguration } from '../../../config/index';
import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';
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
    config: IAppConfiguration;
    serviceName: string;
    httpsServer: Server | undefined;
    constructor();
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
    _httpsHandler(request: IncomingMessage, response: ServerResponse): void;
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
    start(): Promise<import('https').Server>;
}
