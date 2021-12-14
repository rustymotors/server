/// <reference types="node" />
import http from 'http';
export declare class HTTPProxyServer {
    static _instance: HTTPProxyServer;
    _server: http.Server;
    _serviceName: string;
    static getInstance(): HTTPProxyServer;
    private constructor();
    handleRequest(request: http.IncomingMessage, response: http.ServerResponse): void;
    start(): http.Server;
}
