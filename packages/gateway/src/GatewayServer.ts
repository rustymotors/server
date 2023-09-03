import {
    createServer as createSocketServer,
    Server as tcpServer,
} from "node:net";
import { socketConnectionHandler } from "./index.js";
import { getConnectionManager } from "./ConnectionManager.js";
import { ConsoleThread } from "../../cli/ConsoleThread.js";
import { SubprocessThread, NetworkConnectionHandler, ConnectionHandler, GatewayServer } from "../../interfaces/index.js";
import { Logger } from "pino";
import { Configuration } from "../../shared/Configuration.js";
import { ServerError } from "../../shared/errors/ServerError.js";
import { getServerLogger } from "../../shared/log.js";

/**
 * Gateway server
 * @see {@link getGatewayServer()} to get a singleton instance
 *
 */

export class Gateway implements GatewayServer, SubprocessThread {
    private readonly config: Configuration;
    log: Logger;
    private readonly backlogAllowedCount: number;
    private readonly listeningPortList: number[];
    private readonly servers: tcpServer[];
    private readonly socketconnection: NetworkConnectionHandler;
    private serversRunning = false;
    private readThread: ConsoleThread | undefined;
    private activeSubThreads: SubprocessThread[] = [];
    parentThread: GatewayServer | undefined;
    private status: "stopped" | "running" | "stopping" | "restarting" =
        "stopped";
    consoleEvents = ["userExit", "userRestart", "userHelp"];

    name = "GatewayServer";
    loopInterval = 0;
    timer: NodeJS.Timeout | null = null;
    // Singleton instance of GatewayServer
    static _instance: GatewayServer;

    constructor({
        config = undefined,
        log = getServerLogger({
            module: "GatewayServer",
        }),
        backlogAllowedCount = 0,
        listeningPortList = [],
        onSocketConnection = socketConnectionHandler,
    }: {
        config?: Configuration;
        log?: Logger;
        backlogAllowedCount?: number;
        serverListener?: ConnectionHandler;
        listeningPortList?: number[];
        onSocketConnection?: ConnectionHandler;
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
    addSubThread(subThread: SubprocessThread): void {
        // Add the subthread to the list of active subthreads
        this.activeSubThreads.push(subThread);
    }
    removeSubThread(subThread: SubprocessThread): void {
        // Remove the subthread from the list of active subthreads
        this.activeSubThreads = this.activeSubThreads.filter((activeThread) => {
            return activeThread.name !== subThread.name;
        });

        // If the subthread is the ReadInput thread, then stop the GatewayServer
        if (subThread.name === "ReadInput") {
            this.stop();
        }
    }
    getSubThreads(): SubprocessThread[] {
        // Return the list of active subthreads
        return this.activeSubThreads;
    }
    getSubThreadCount(): number {
        // Return the number of active subthreads
        return this.activeSubThreads.length;
    }
    stop(): void {
        // Mark the GatewayServer as stopping
        this.log.debug("Marking GatewayServer as stopping");
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

        // Mark the GatewayServer as stopped
        this.log.debug("Marking GatewayServer as stopped");
        this.status = "stopped";

        // Mark the list of servers as not running
        this.log.debug("Marking the list of servers as not running");
        this.serversRunning = false;

        // Mark the list of active subthreads as empty
        this.log.debug("Marking the list of active subthreads as empty");
        this.activeSubThreads = [];

        // Empty the connection list
        this.log.debug("Emptying the connection list");
        getConnectionManager().emptyConnectionList();

        // Empty the legacy connection list
        this.log.debug("Emptying the legacy connection list");
        getConnectionManager().emptyLegacyConnectionList();
    }

    handleReadThreadEvent(event: string): void {
        if (event === "userExit") {
            this.exit();
        }
        if (event === "userRestart") {
            this.restart();
        }
        if (event === "userHelp") {
            this.help();
        }
    }

    init(): void {
        // Create the read thread
        this.readThread = new ConsoleThread({
            parentThread: this,
            log: this.log,
        });

        // Register the read thread events
        if (this.readThread === undefined) {
            throw new ServerError("readThread is undefined");
        }
        this.consoleEvents.forEach((event) => {
            this.readThread?.on(event, () => {
                this.handleReadThreadEvent(event);
            });
        });
    }

    help() {
        console.log("=== Help ===");
        console.log("x: Exit");
        console.log("r: Restart");
        console.log("?: Help");
        console.log("============");
    }
    run(): void {
        // Intentionally left blank
    }

    static getInstance({
        config = undefined,
        log = getServerLogger({
            module: "GatewayServer",
        }),
        backlogAllowedCount = 0,
        listeningPortList = [],
        onSocketConnection = socketConnectionHandler,
    }: {
        config?: Configuration;
        log?: Logger;
        backlogAllowedCount?: number;
        serverListener?: ConnectionHandler;
        listeningPortList?: number[];
        onSocketConnection?: ConnectionHandler;
    }): GatewayServer {
        if (Gateway._instance === undefined) {
            Gateway._instance = new Gateway({
                config,
                log,
                backlogAllowedCount,
                listeningPortList,
                onSocketConnection,
            });
        }
        return Gateway._instance;
    }

    shutdown() {
        this.log.debug("Shutdown complete for GatewayServer");
        this.status = "stopped";
        this.log.info("Server stopped");


        // Mark the list of servers as not running
        this.log.debug("Marking the list of servers as not running");
        this.serversRunning = false;

        // Mark the list of active subthreads as empty
        this.log.debug("Marking the list of active subthreads as empty");
        this.activeSubThreads = [];

        process.exit(0);
    }

    /**
     * Callback for when a subthread is shutting down
     */
    onSubThreadShutdown(threadName: string) {
        this.log.debug(`onSubThreadShutdown(${threadName})`);
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
        this.log.debug(`Status: ${this.status}`);
        this.log.debug("Server closed");
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
        this.log.debug("Starting GatewayServer in start()");
        this.log.info("Server starting");

        // Check if there are any listening ports specified
        if (this.listeningPortList.length === 0) {
            throw new Error("No listening ports specified");
        }

        // Mark the GatewayServer as running
        this.log.debug("Marking the list of servers as running");
        this.serversRunning = true;
        this.log.debug("Marking GatewayServer as running");
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
                this.log.debug(`Listening on port ${port}`);
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
    log = getServerLogger({
        module: "GatewayServer",
    }),
    backlogAllowedCount = 0,
    listeningPortList = [],
    onSocketConnection = socketConnectionHandler,
}: {
    config?: Configuration;
    log?: Logger;
    backlogAllowedCount?: number;
    serverListener?: ConnectionHandler;
    listeningPortList?: number[];
    onSocketConnection?: ConnectionHandler;
}): GatewayServer {
    return Gateway.getInstance({
        config,
        log,
        backlogAllowedCount,
        listeningPortList,
        onSocketConnection,
    });
}
