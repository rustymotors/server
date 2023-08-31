/// <reference types="node" resolution-mode="require"/>
import { SubprocessThread, ServerConfiguration, Logger, ConnectionHandler, GatewayServer } from "../../interfaces/index.js";
/**
 * Gateway server
 * @see {@link getGatewayServer()} to get a singleton instance
 *
 */
export declare class Gateway implements GatewayServer, SubprocessThread {
    private readonly config;
    log: Logger;
    private readonly backlogAllowedCount;
    private readonly listeningPortList;
    private readonly servers;
    private readonly socketconnection;
    private serversRunning;
    private readThread;
    private activeSubThreads;
    parentThread: GatewayServer | undefined;
    private status;
    consoleEvents: string[];
    name: string;
    loopInterval: number;
    timer: NodeJS.Timeout | null;
    static _instance: GatewayServer;
    constructor({ config, log, backlogAllowedCount, listeningPortList, onSocketConnection, }: {
        config?: ServerConfiguration;
        log?: Logger;
        backlogAllowedCount?: number;
        serverListener?: ConnectionHandler;
        listeningPortList?: number[];
        onSocketConnection?: ConnectionHandler;
    });
    mainShutdown(): void;
    restart(): void;
    exit(): void;
    addSubThread(subThread: SubprocessThread): void;
    removeSubThread(subThread: SubprocessThread): void;
    getSubThreads(): SubprocessThread[];
    getSubThreadCount(): number;
    stop(): void;
    handleReadThreadEvent(event: string): void;
    init(): void;
    help(): void;
    run(): void;
    static getInstance({ config, log, backlogAllowedCount, listeningPortList, onSocketConnection, }: {
        config?: ServerConfiguration;
        log?: Logger;
        backlogAllowedCount?: number;
        serverListener?: ConnectionHandler;
        listeningPortList?: number[];
        onSocketConnection?: ConnectionHandler;
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
    config?: ServerConfiguration;
    log?: Logger;
    backlogAllowedCount?: number;
    serverListener?: ConnectionHandler;
    listeningPortList?: number[];
    onSocketConnection?: ConnectionHandler;
}): GatewayServer;
//# sourceMappingURL=GatewayServer.d.ts.map