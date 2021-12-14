/// <reference types="node" />
import net from 'net';
export declare class RoutingServer {
    static _instance: RoutingServer;
    private _server;
    private _serverConnections;
    private _serviceName;
    static getInstance(): RoutingServer;
    private constructor();
    private _handleData;
    private _registerNewService;
    start(): Promise<net.Server>;
}
