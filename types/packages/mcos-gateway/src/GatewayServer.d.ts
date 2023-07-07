/// <reference types="node" />
import { IGatewayServer, ISubThread, TConnectionHandler, TConfiguration, TServerLogger } from "mcos/shared/interfaces";
/**
 * Gateway server
 * @see {@link getGatewayServer()} to get a singleton instance
 *
 */
export declare class GatewayServer implements IGatewayServer, ISubThread {
    private readonly config;
    log: TServerLogger;
    private readonly backlogAllowedCount;
    private readonly listeningPortList;
    private readonly servers;
    private readonly socketconnection;
    private serversRunning;
    private readThread;
    private activeSubThreads;
    parentThread: IGatewayServer | undefined;
    private status;
    private sentryTransaction;
    consoleEvents: string[];
    name: string;
    loopInterval: number;
    timer: NodeJS.Timer | null;
    static _instance: GatewayServer;
    constructor({ config, log, backlogAllowedCount, listeningPortList, onSocketConnection, }: {
        config?: TConfiguration;
        log?: TServerLogger;
        backlogAllowedCount?: number;
        serverListener?: TConnectionHandler;
        listeningPortList?: number[];
        onSocketConnection?: TConnectionHandler;
    });
    mainShutdown(): void;
    restart(): void;
    exit(): void;
    addSubThread(subThread: ISubThread): void;
    removeSubThread(subThread: ISubThread): void;
    getSubThreads(): ISubThread[];
    getSubThreadCount(): number;
    stop(): void;
    handleReadThreadEvent(event: string): void;
    init(): void;
    help(): void;
    run(): void;
    static getInstance({ config, log, backlogAllowedCount, listeningPortList, onSocketConnection, }: {
        config?: TConfiguration;
        log?: TServerLogger;
        backlogAllowedCount?: number;
        serverListener?: TConnectionHandler;
        listeningPortList?: number[];
        onSocketConnection?: TConnectionHandler;
    }): GatewayServer;
    shutdown(): void;
    /**
     * Callback for when a subthread is shutting down
     */
    onSubThreadShutdown(threadName: string): void;
    /**
     * Callback for when a server is closed
     */
    serverCloseHandler(): void;
    /**
     * Start the GatewayServer instance
     */
    start(): void;
}
/**
 * Get a singleton instance of GatewayServer
 */
export declare function getGatewayServer({ config, log, backlogAllowedCount, listeningPortList, onSocketConnection, }: {
    config?: TConfiguration;
    log?: TServerLogger;
    backlogAllowedCount?: number;
    serverListener?: TConnectionHandler;
    listeningPortList?: number[];
    onSocketConnection?: TConnectionHandler;
}): GatewayServer;
