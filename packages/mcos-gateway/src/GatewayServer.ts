import {
    createServer as createSocketServer,
    Server as tcpServer,
} from "node:net";
import {
    IGatewayServer,
    TConnectionHandler,
    TServerConfiguration,
    TServerLogger,
    TTCPConnectionHandler,
} from "mcos/shared/interfaces";
import { defaultLog, socketConnectionHandler } from "./index.js";
import { ReadInput } from "../../../src/rebirth/threads/ReadInput.js";
import { SubThread } from "../../../src/rebirth/threads/SubThread.js";

/**
 * Gateway server
 * @see {@link getGatewayServer()} to get a singleton instance
 *
 */

export class GatewayServer implements IGatewayServer {
    private readonly config: TServerConfiguration;
    private readonly log: TServerLogger;
    private readonly backlogAllowedCount: number;
    private readonly listeningPortList: number[];
    private readonly servers: tcpServer[];
    private readonly socketconnection: TTCPConnectionHandler;
    private serversRunning: boolean = false;
    // Singleton instance of GatewayServer
    static _instance: GatewayServer;
    private readThread: ReadInput | undefined;
    private activeSubThreads: Array<SubThread> = [];

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

    /**
     * Callback for when the main thread is shutting down
     */
    mainShutdown() {
        console.log("Main thread finished.");
        console.log(`Active subthreads: ${this.activeSubThreads.length}`);
    }

    /**
     * Callback for when a subthread is shutting down
     */
    onSubThreadShutdown(subThread: SubThread) {
        // Remove the subthread from the list of active subthreads
        this.activeSubThreads = this.activeSubThreads.filter((activeThread) => {
            return activeThread !== subThread;
        });

        if (this.activeSubThreads.length === 0) {
            this.mainShutdown();
        }
    }

    /**
     * Callback for when a server is closed
     */
    serverCloseHandler(self: GatewayServer) {
        // Check if there are any servers running
        if (self.servers.length === 0) {
            self.log("info", "All servers stopped");
            self.serversRunning = false;
            // Call the main shutdown handler
            return this.mainShutdown();
        }
        // Log the number of servers still running
        self.log(
            "debug",
            `There are still ${this.servers.length} servers running`
        );
    }

    /**
     * Start the GatewayServer instance
     */
    public start() {
        this.log("info", "Server starting");

        // Check if there are any listening ports specified
        if (this.listeningPortList.length === 0) {
            throw new Error("No listening ports specified");
        }

        // Mark the GatewayServer as running
        this.serversRunning = true;
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

            // Add the server to the list of servers
            this.servers.push(server);
        });

        this.log("info", "GatewayServer started");
        this.log("info", "Press x to shutdown");

        // Listen for the x key to be pressed
        process.stdin.on("data", (key) => {
            if (key.toString("utf8") === "x") {
                // Log that the server is shutting down
                console.log("Shutting down...");

                // Set the shutdown flag
                this.serversRunning = false;

                // Stop the server
                this.stop();

                // Shutdown the read thread
                if (this.readThread !== undefined) {
                    this.readThread.emit("shutdown");
                }
            }
        });

        // Create the read thread
        this.readThread = new ReadInput();
        this.readThread.on("shutdownComplete", () => {
            if (this.readThread !== undefined) {
                this.onSubThreadShutdown(this.readThread);
            }
        });
    }

    /**
     * Stop the GatewayServer instance
     */
    public stop() {
        this.log("info", "Server stopping");

        const thisServer = this;

        // Get the number of servers
        const serverCount = this.servers.length;

        // Loop through the servers and close them
        for (let i = 0; i < serverCount; i++) {
            this.servers[0].close();

            // Remove the server from the list
            thisServer.servers.splice(0, 1);

            // Call the server close handler
            thisServer.serverCloseHandler(thisServer);
        }
    }
}

/**
 * Get a singleton instance of GatewayServer
 */
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
