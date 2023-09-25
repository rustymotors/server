import { createServer as createSocketServer } from "node:net";
import { onSocketConnection } from "./index.js";
import { getServerConfiguration } from "../../shared/Configuration.js";
import { getServerLogger } from "../../shared/log.js";
import fastify from "fastify";
import {
    addOnDataHandler,
    createInitialState,
    fetchStateFromDatabase,
} from "../../shared/State.js";
import { ConsoleThread } from "../../cli/ConsoleThread.js";
import { addWebRoutes } from "./web.js";
import { ServerError } from "../../shared/errors/ServerError.js";
import { receiveLoginData } from "../../login/src/index.js";
import { receivePersonaData } from "../../persona/src/internal.js";
import { receiveLobbyData } from "../../lobby/src/internal.js";
import { receiveTransactionsData } from "../../transactions/src/internal.js";
import FastifySensible from "@fastify/sensible";

/**
 * @module gateway
 */

/**
 * @typedef {object} GatewayOptions
 * @property {module:shared/Configuration.Configuration} [config]
 * @property {module:shared/log.ServerLogger} [log]
 * @property {number} [backlogAllowedCount]
 * @property {number[]} [listeningPortList]
 * @property {module:interfaces.NetworkConnectionHandler} [socketConnectionHandler]
 */

/**
 * Gateway server
 * @impliments {SubprocessThread}
 * @see {@link getGatewayServer()} to get a singleton instance
 */
export class Gateway {
    /**
     * Creates an instance of GatewayServer.
     * @param {GatewayOptions} options
     */
    constructor({
        config = getServerConfiguration({}),
        log = getServerLogger({
            module: "GatewayServer",
        }),
        backlogAllowedCount = 0,
        listeningPortList = [],
        socketConnectionHandler = onSocketConnection,
    }) {
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
        this.listeningPortList = listeningPortList;
        /** @type {import("node:net").Server[]} */
        this.servers = [];
        this.socketconnection = socketConnectionHandler;

        Gateway._instance = this;
    }

    /**
     * @return {fastify.FastifyInstance}
     */
    getWebServer() {
        if (this.webServer === undefined) {
            throw new ServerError("webServer is undefined");
        }
        return this.webServer;
    }

    start() {
        this.log.debug("Starting GatewayServer in start()");
        this.log.info("Server starting");

        // Check if there are any listening ports specified
        if (this.listeningPortList.length === 0) {
            throw new Error("No listening ports specified");
        }

        // Mark the GatewayServer as running
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

        if (this.webServer === undefined) {
            throw new ServerError("webServer is undefined");
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
                    this.log.error(err);
                    process.exit(1);
                }
                this.log.info(`Server listening at ${address}`);
            },
        );
    }

    async restart() {
        // Stop the GatewayServer
        await this.stop();

        console.log("=== Restarting... ===");

        // Start the GatewayServer
        this.start();
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

        if (this.webServer === undefined) {
            throw new ServerError("webServer is undefined");
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
    handleReadThreadEvent(event) {
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

    init() {
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

        this.webServer = fastify({
            logger: true,
        });
        this.webServer.register(FastifySensible);

        let state = fetchStateFromDatabase();

        state = addOnDataHandler(state, 8226, receiveLoginData);
        state = addOnDataHandler(state, 8228, receivePersonaData);
        state = addOnDataHandler(state, 7003, receiveLobbyData);
        state = addOnDataHandler(state, 43300, receiveTransactionsData);

        state.save();

        this.log.debug("GatewayServer initialized");
    }

    help() {
        console.log("=== Help ===");
        console.log("x: Exit");
        console.log("r: Restart");
        console.log("?: Help");
        console.log("============");
    }
    run() {
        // Intentionally left blank
    }

    /**
     *
     * @param {GatewayOptions} options
     * @returns {Gateway}
     * @memberof Gateway
     */
    static getInstance({
        config = undefined,
        log = getServerLogger({
            module: "GatewayServer",
        }),
        backlogAllowedCount = 0,
        listeningPortList = [],
        socketConnectionHandler = onSocketConnection,
    }) {
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
 * @param {GatewayOptions} options
 * @returns {Gateway}
 */
export function getGatewayServer({
    config = undefined,
    log = getServerLogger({
        module: "GatewayServer",
    }),
    backlogAllowedCount = 0,
    listeningPortList = [],
    socketConnectionHandler = onSocketConnection,
}) {
    return Gateway.getInstance({
        config,
        log,
        backlogAllowedCount,
        listeningPortList,
        socketConnectionHandler,
    });
}
