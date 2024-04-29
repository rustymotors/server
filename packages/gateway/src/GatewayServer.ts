import { Socket, createServer as createSocketServer } from "node:net";
import { onSocketConnection } from "./index.js";
import fastify from "fastify";
import {
    Configuration,
    getServerConfiguration,
    createInitialState,
    fetchStateFromDatabase,
    type TServerLogger,
} from "../../shared";
import { ConsoleThread } from "../../cli/ConsoleThread.js";
import { addWebRoutes } from "./web.js";

import FastifySensible from "@fastify/sensible";

import {
    populatePortToMessageTypes,
    populateGameMessageProcessors,
    portToMessageTypes,
    gameMessageProcessors,
} from "../../nps/messageProcessors/index.js";
import { populateUsers } from "../../nps/services/account.js";
import {
    gameProfiles,
    populateGameProfiles,
} from "../../nps/services/profile.js";
import { ScheduledThread } from "../../cli/ScheduledThread.js";
import { populateServerMessageProcessors } from "../../mcots/index.js";

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
export class Gateway {
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
    scheduledThread: ScheduledThread | undefined;

    /**
     * Creates an instance of GatewayServer.
     * @param {TGatewayOptions} options
     */
    constructor({
        config = getServerConfiguration({}),
        log,
        backlogAllowedCount = 0,
        listeningPortList = [],
        socketConnectionHandler = onSocketConnection,
    }: TGatewayOptions) {
        log.debug("Creating GatewayServer instance");

        this.config = config;
        this.log = log;
        /** @type {NodeJS.Timeout | null} */
        this.timer = null;
        this.loopInterval = 0;
        /** @type {"stopped" | "running" | "stopping" | "restarting"} */
        this.status = "stopped";
        this.consoleEvents = ["userExit", "userRestart", "userHelp"];
        this.backlogAllowedCount = backlogAllowedCount;

        // Check if there are any listening ports specified
        this.verifyPortListIsNotEmpty(listeningPortList);

        this.listeningPortList = listeningPortList;
        /** @type {import("node:net").Server[]} */
        this.servers = [];
        this.socketconnection = socketConnectionHandler;

        Gateway._instance = this;
    }

    /**
     * Delete the GatewayServer instance
     */
    static deleteInstance() {
        Gateway._instance = undefined;
    }

    /**
     * Assert that the listeningPortList is not empty
     * @param {number[]} listeningPortList
     * @throws {Error} If the listeningPortList is empty
     */
    private verifyPortListIsNotEmpty(listeningPortList: number[]) {
        if (listeningPortList.length === 0) {
            this.log.error(
                "No listening ports specified. Instance will not be created",
            );
            throw new Error("No listening ports specified");
        }
    }

    /**
     * @return {import("fastify").FastifyInstance}
     */
    getWebServer(): import("fastify").FastifyInstance {
        if (this.webServer === undefined) {
            throw new Error("webServer is undefined");
        }
        return this.webServer;
    }

    async start() {
        this.log.debug("Starting GatewayServer in start()");
        this.log.info("Server starting");

        // Mark the GatewayServer as running
        this.log.debug("Marking GatewayServer as running");
        this.status = "running";

        // Initialize the GatewayServer
        await this.init();

        this.listeningPortList.forEach((port) => {
            const server = createSocketServer((s) => {
                this.socketconnection({
                    incomingSocket: s,
                    log: this.log,
                });
            });

            server.listen(port, "0.0.0.0", this.backlogAllowedCount);

            // Add the server to the list of servers
            this.servers.push(server);
        });

        if (this.webServer === undefined) {
            throw new Error("webServer is undefined");
        }

        // Start the web server
        addWebRoutes(this.webServer);

        this.webServer.listen(
            {
                host: "0.0.0.0",
                port: 3000,
            },
            (err, address) => {
                if (err) {
                    this.log.error(String(err));
                    process.exit(1);
                }
                this.log.info(`Server listening at ${address}`);
            },
        );
    }

    async restart() {
        // Stop the GatewayServer
        await this.stop();

        this.log.info("=== Restarting... ===");

        // Start the GatewayServer
        await this.start();
    }

    async exit() {
        // Stop the GatewayServer
        await this.stop();

        // Exit the process
        process.exit(0);
    }

    async stop() {
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

        // Stop the scheduled thread
        if (this.scheduledThread !== undefined) {
            this.scheduledThread.stop();
        }

        if (this.webServer === undefined) {
            throw new Error("webServer is undefined");
        }
        await this.webServer.close();

        // Stop the timer
        if (this.timer !== null) {
            clearInterval(this.timer);
        }

        // Mark the GatewayServer as stopped
        this.log.debug("Marking GatewayServer as stopped");
        this.status = "stopped";

        // Reset the global state
        this.log.debug("Resetting the global state");
        createInitialState({}).save();
    }

    /**
     * @param {string} event
     */
    handleReadThreadEvent(event: string) {
        if (event === "userExit") {
            void this.exit();
        }
        if (event === "userRestart") {
            void this.restart();
        }
        if (event === "userHelp") {
            this.help();
        }
    }

    async init() {
        this.log.setName("gateway:GatewayServer:init");
        // Create the read thread
        this.readThread = new ConsoleThread({
            parentThread: this,
            log: this.log,
        });

        // Register the read thread events
        if (this.readThread === undefined) {
            throw new Error("readThread is undefined");
        }
        this.consoleEvents.forEach((event) => {
            this.readThread?.on(event, () => {
                this.handleReadThreadEvent(event);
            });
        });

        this.webServer = fastify({
            logger: false,
        });
        await this.webServer.register(FastifySensible);

        const state = fetchStateFromDatabase();

        try {
            await populateUsers();
            await populateGameProfiles(gameProfiles);
        } catch (error) {
            this.log.error(`Error in populating game data: ${error as string}`);
            throw error;
        }

        populatePortToMessageTypes(portToMessageTypes);
        populateGameMessageProcessors(gameMessageProcessors);

        populateServerMessageProcessors();

        state.save();

        // Create the scheduled thread
        this.scheduledThread = new ScheduledThread({
            parentThread: this,
            log: this.log,
        });

        this.log.debug("GatewayServer initialized");
        this.log.resetName();
    }

    help() {
        this.log.info("=== Help ===");
        this.log.info("x: Exit");
        this.log.info("r: Restart");
        this.log.info("?: Help");
        this.log.info("============");
    }
    run() {
        // Intentionally left blank
    }

    /**
     *
     * @param {TGatewayOptions} options
     * @returns {Gateway}
     * @memberof Gateway
     */
    static getInstance({
        config = undefined,
        log,
        backlogAllowedCount = 0,
        listeningPortList = [],
        socketConnectionHandler = onSocketConnection,
    }: TGatewayOptions): Gateway {
        if (Gateway._instance === undefined) {
            Gateway._instance = new Gateway({
                config,
                log,
                backlogAllowedCount,
                listeningPortList,
                socketConnectionHandler,
            });
        }
        return Gateway._instance;
    }

    shutdown() {
        this.log.debug("Shutdown complete for GatewayServer");
        this.status = "stopped";
        this.log.info("Server stopped");

        process.exit(0);
    }
}

/** @type {Gateway | undefined} */
Gateway._instance = undefined;

/**
 * Get a singleton instance of GatewayServer
 *
 * @param {TGatewayOptions} options
 * @returns {Gateway}
 */
export function getGatewayServer({
    config,
    log,
    backlogAllowedCount = 0,
    listeningPortList = [],
    socketConnectionHandler = onSocketConnection,
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
}): Gateway {
    return Gateway.getInstance({
        config,
        log,
        backlogAllowedCount,
        listeningPortList,
        socketConnectionHandler,
    });
}
