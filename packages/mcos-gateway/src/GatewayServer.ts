import {
    createServer as createSocketServer,
    Server as tcpServer,
} from "node:net";
import {
    IGatewayServer,
    ISubThread,
    TConnectionHandler,
    TServerConfiguration,
    TServerLogger,
    TTCPConnectionHandler,
} from "mcos/shared/interfaces";
import { defaultLog, socketConnectionHandler } from "./index.js";
import { ReadInput } from "../../../src/rebirth/threads/ReadInput.js";
import { SubThread } from "../../../src/rebirth/threads/SubThread.js";
import { Sentry } from "mcos/shared";

/**
 * Gateway server
 * @see {@link getGatewayServer()} to get a singleton instance
 *
 */

export class GatewayServer implements IGatewayServer, ISubThread {
    private readonly config: TServerConfiguration;
    log: TServerLogger;
    private readonly backlogAllowedCount: number;
    private readonly listeningPortList: number[];
    private readonly servers: tcpServer[];
    private readonly socketconnection: TTCPConnectionHandler;
    private serversRunning: boolean = false;
    private readThread: ReadInput | undefined;
    private activeSubThreads: Array<SubThread> = [];
    parentThread: IGatewayServer | undefined;
    private status: "stopped" | "running" | "stopping" | "restarting" =
        "stopped";
    private sentryTransaction: Sentry.Transaction | undefined;

    name: string = "GatewayServer";
    loopInterval: number = 0;
    timer: NodeJS.Timer | null = null;
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
    mainShutdown(): void {
        throw new Error("Method not implemented.");
    }
    restart(): void {
        // Stop the GatewayServer
        this.stop();

        console.log("=== Restarting... ===");

        // Start the GatewayServer
        this.start();
    }
    exit(): void {
        // Stop the GatewayServer
        this.stop();

        // Exit the process
        process.exit(0);
    }
    addSubThread(subThread: ISubThread): void {
        // Add the subthread to the list of active subthreads
        this.activeSubThreads.push(subThread as SubThread);
    }
    removeSubThread(subThread: ISubThread): void {
        // Remove the subthread from the list of active subthreads
        this.activeSubThreads = this.activeSubThreads.filter((activeThread) => {
            return activeThread.name !== subThread.name;
        });

        // If the subthread is the ReadInput thread, then stop the GatewayServer
        if (subThread.name === "ReadInput") {
            this.stop();
        }
    }
    getSubThreads(): ISubThread[] {
        // Return the list of active subthreads
        return this.activeSubThreads;
    }
    getSubThreadCount(): number {
        // Return the number of active subthreads
        return this.activeSubThreads.length;
    }
    stop(): void {
        // Mark the GatewayServer as stopping
        this.log("debug", "Marking GatewayServer as stopping");
        this.status = "stopping";

        // Stop the servers
        this.servers.forEach((server) => {
            server.close();
        });

        // Stop the read thread
        if (this.readThread !== undefined) {
            this.readThread.stop();
        }

        // Stop the timer
        if (this.timer !== null) {
            clearInterval(this.timer);
        }

        // Stop the Sentry transaction
        if (this.sentryTransaction !== undefined) {
            this.sentryTransaction.finish();
        }

        // Mark the GatewayServer as stopped
        this.log("debug", "Marking GatewayServer as stopped");
        this.status = "stopped";

        // Mark the list of servers as not running
        this.log("debug", "Marking the list of servers as not running");
        this.serversRunning = false;

        // Mark the list of active subthreads as empty
        this.log("debug", "Marking the list of active subthreads as empty");
        this.activeSubThreads = [];
    }

    init(): void {
        // Create the read thread
        this.readThread = new ReadInput({ parentThread: this, log: this.log });
        this.readThread.on("shutdownComplete", () => {
            this.log(
                "debug",
                "Shutdown complete for ReadInput in GatewayServer"
            );
            this.status = "stopped";
            if (this.readThread !== undefined) {
                this.onSubThreadShutdown("ReadInput");
            }
        });
        this.readThread.on("restartComplete", () => {
            this.log(
                "debug",
                "Restart complete for ReadInput in GatewayServer"
            );
            this.status = "restarting";
            this.log("info", "Restarting...");
            if (this.readThread !== undefined) {
                this.onSubThreadShutdown("ReadInput");
            }
        });
    }
    run(): void {
        // Intentionally left blank
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

    shutdown() {
        this.log("debug", "Shutdown complete for GatewayServer");
        this.status = "stopped";
        this.log("info", "Server stopped");

        // Stop the Sentry transaction
        if (this.sentryTransaction !== undefined) {
            this.sentryTransaction.finish();
        }

        // Mark the list of servers as not running
        this.log("debug", "Marking the list of servers as not running");
        this.serversRunning = false;

        // Mark the list of active subthreads as empty
        this.log("debug", "Marking the list of active subthreads as empty");
        this.activeSubThreads = [];

        process.exit(0);
    }

    /**
     * Callback for when a subthread is shutting down
     */
    onSubThreadShutdown(threadName: string) {
        this.log("debug", `onSubThreadShutdown(${threadName})`);
        this.activeSubThreads = this.activeSubThreads.filter((thread) => {
            return thread.name !== threadName;
        });

        if (
            (this.status === "stopping" || this.status === "restarting") &&
            this.activeSubThreads.length === 0
        ) {
            this.shutdown();
        }
    }

    /**
     * Callback for when a server is closed
     */
    serverCloseHandler() {
        console.log("=== serverCloseHandler() ===");
        this.log("debug", `Status: ${this.status}`);
        this.log("debug", "Server closed");
        this.serversRunning = false;
        if (
            (this.status === "stopping" || this.status === "restarting") &&
            this.activeSubThreads.length === 0
        ) {
            this.shutdown();
        }
        console.log("=== End of serverCloseHandler() ===");
    }

    /**
     * Start the GatewayServer instance
     */
    public start() {
        this.sentryTransaction = Sentry.startTransaction({
            name: "GatewayServer",
            op: "GatewayServer",
        });
        this.log("debug", "Starting GatewayServer in start()");
        this.log("info", "Server starting");

        // Check if there are any listening ports specified
        if (this.listeningPortList.length === 0) {
            throw new Error("No listening ports specified");
        }

        // Mark the GatewayServer as running
        this.log("debug", "Marking the list of servers as running");
        this.serversRunning = true;
        this.log("debug", "Marking GatewayServer as running");
        this.status = "running";

        // Initialize the GatewayServer
        this.init();

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
