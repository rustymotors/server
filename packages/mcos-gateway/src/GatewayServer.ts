import {
    createServer as createSocketServer,
    Server as tcpServer,
} from "node:net";
import {
    TConnectionHandler,
    TServerConfiguration,
    TServerLogger,
    TTCPConnectionHandler,
} from "mcos/shared/interfaces";
import { defaultLog, socketConnectionHandler } from "./index.js";

// TODO: Add a way to stop the server
/**
 * Gateway server
 * @see {@link getGatewayServer()} to get a singleton instance
 *
 */

export class GatewayServer {
    private readonly config: TServerConfiguration;
    private readonly log: TServerLogger;
    private readonly backlogAllowedCount: number;
    private readonly listeningPortList: number[];
    private readonly servers: tcpServer[];
    private readonly socketconnection: TTCPConnectionHandler;
    // Singleton instance of GatewayServer
    static _instance: GatewayServer;

    constructor({
        config = undefined,
        log = defaultLog,
        backlogAllowedCount = 0,
        listeningPortList = [],
        onSocketConnection = socketConnectionHandler,
    }: {
        config?: TServerConfiguration;
        log?: TServerLogger;
        backlogAllowedCount?: number;
        serverListener?: TConnectionHandler;
        listeningPortList?: number[];
        onSocketConnection?: TConnectionHandler;
    }) {
        if (config === undefined) {
            throw new Error("config is undefined");
        }

        this.config = config;
        this.log = log;
        this.backlogAllowedCount = backlogAllowedCount;
        this.listeningPortList = listeningPortList;
        this.servers = [];
        this.socketconnection = onSocketConnection;
    }

    static getInstance({
        config = undefined,
        log = defaultLog,
        backlogAllowedCount = 0,
        listeningPortList = [],
        onSocketConnection = socketConnectionHandler,
    }: {
        config?: TServerConfiguration;
        log?: TServerLogger;
        backlogAllowedCount?: number;
        serverListener?: TConnectionHandler;
        listeningPortList?: number[];
        onSocketConnection?: TConnectionHandler;
    }): GatewayServer {
        if (GatewayServer._instance === undefined) {
            GatewayServer._instance = new GatewayServer({
                config,
                log,
                backlogAllowedCount,
                listeningPortList,
                onSocketConnection,
            });
        }
        return GatewayServer._instance;
    }

    public start() {
        this.log("info", "Server starting");

        if (this.listeningPortList.length === 0) {
            throw new Error("No listening ports specified");
        }

        this.listeningPortList.forEach((port) => {
            const server = createSocketServer((s) => {
                this.socketconnection({
                    incomingSocket: s,
                    config: this.config,
                    log: this.log,
                });
            });

            server.listen(port, "0.0.0.0", this.backlogAllowedCount, () => {
                this.log("debug", `Listening on port ${port}`);
            });

            this.servers.push(server);
        });
    }
}

export function getGatewayServer({
    config = undefined,
    log = defaultLog,
    backlogAllowedCount = 0,
    listeningPortList = [],
    onSocketConnection = socketConnectionHandler,
}: {
    config?: TServerConfiguration;
    log?: TServerLogger;
    backlogAllowedCount?: number;
    serverListener?: TConnectionHandler;
    listeningPortList?: number[];
    onSocketConnection?: TConnectionHandler;
}): GatewayServer {
    return GatewayServer.getInstance({
        config,
        log,
        backlogAllowedCount,
        listeningPortList,
        onSocketConnection,
    });
}
