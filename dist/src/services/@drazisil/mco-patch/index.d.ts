/// <reference types="node" />
import http from 'http';
import config from './server.config';
export declare const CastanetResponse: {
    body: Buffer;
    header: {
        type: string;
        value: string;
    };
};
export declare class PatchServer {
    static _instance: PatchServer;
    _config: typeof config;
    _server: http.Server;
    _serviceName: string;
    static getInstance(): PatchServer;
    private constructor();
    handleRequest(request: http.IncomingMessage, response: http.ServerResponse): void;
    start(): http.Server;
}
