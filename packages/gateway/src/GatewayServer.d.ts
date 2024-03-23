/// <reference types="node" />
/// <reference types="node" />
import { Socket } from "node:net";
import { Configuration, type TServerLogger } from "../../shared";
import { ConsoleThread } from "../../cli/ConsoleThread.js";
/**
 * @module gateway
 */
export type TGatewayOptions = {
    config?: Configuration;
    log: TServerLogger;
    backlogAllowedCount?: number;
    listeningPortList?: number[];
    socketConnectionHandler?: ({
        incomingSocket,
        log,
    }: {
        incomingSocket: Socket;
        log: TServerLogger;
    }) => void;
};
/**
 * Gateway server
 * @see {@link getGatewayServer()} to get a singleton instance
 */
export declare class Gateway {
    config: Configuration;
    log: TServerLogger;
    timer: NodeJS.Timeout | null;
    loopInterval: number;
    status: string;
    consoleEvents: string[];
    backlogAllowedCount: number;
    listeningPortList: number[];
    servers: import("node:net").Server[];
    socketconnection: ({
        incomingSocket,
        log,
    }: {
        incomingSocket: Socket;
        log: TServerLogger;
    }) => void;
    static _instance: Gateway | undefined;
    webServer: import("fastify").FastifyInstance | undefined;
    readThread: ConsoleThread | undefined;
    /**
     * Creates an instance of GatewayServer.
     * @param {TGatewayOptions} options
     */
    constructor({
        config,
        log,
        backlogAllowedCount,
        listeningPortList,
        socketConnectionHandler,
    }: TGatewayOptions);
    /**
     * Delete the GatewayServer instance
     */
    static deleteInstance(): void;
    /**
     * Assert that the listeningPortList is not empty
     * @param {number[]} listeningPortList
     * @throws {Error} If the listeningPortList is empty
     */
    private verifyPortListIsNotEmpty;
    /**
     * @return {import("fastify").FastifyInstance}
     */
    getWebServer(): import("fastify").FastifyInstance;
    start(): Promise<void>;
    restart(): Promise<void>;
    exit(): Promise<void>;
    stop(): Promise<void>;
    /**
     * @param {string} event
     */
    handleReadThreadEvent(event: string): void;
    init(): Promise<void>;
    help(): void;
    run(): void;
    /**
     *
     * @param {TGatewayOptions} options
     * @returns {Gateway}
     * @memberof Gateway
     */
    static getInstance({
        config,
        log,
        backlogAllowedCount,
        listeningPortList,
        socketConnectionHandler,
    }: TGatewayOptions): Gateway;
    shutdown(): void;
}
/**
 * Get a singleton instance of GatewayServer
 *
 * @param {TGatewayOptions} options
 * @returns {Gateway}
 */
export declare function getGatewayServer({
    config,
    log,
    backlogAllowedCount,
    listeningPortList,
    socketConnectionHandler,
}: {
    config?: Configuration;
    log: TServerLogger;
    backlogAllowedCount?: number;
    listeningPortList?: number[];
    socketConnectionHandler?: ({
        incomingSocket,
        log,
    }: {
        incomingSocket: Socket;
        log: TServerLogger;
    }) => void;
}): Gateway;
