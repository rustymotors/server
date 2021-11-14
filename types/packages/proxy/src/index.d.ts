export class HTTPProxyServer {
    /** @type {HTTPProxyServer} */
    static _instance: HTTPProxyServer;
    /**
     *
     * @returns {HTTPProxyServer}
     */
    static getInstance(): HTTPProxyServer;
    /** @type {import("http").Server} */
    _server: import("http").Server;
    /**
     *
     * @param {import("http").IncomingMessage} request
     * @param {import("http").ServerResponse} response
     * @returns
     */
    handleRequest(request: import("http").IncomingMessage, response: import("http").ServerResponse): any;
    start(): void;
}
