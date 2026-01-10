import { Server, Socket as TcpSocket, createServer as createSocketServer } from "node:net";
import {createSocket, RemoteInfo, Socket as UdpSocket} from "node:dgram"
import { Configuration, getServerConfiguration, getServerLogger, ServerLogger,createInitialState } from "rusty-motors-shared";
import { onSocketConnection, onUdpMessage } from "./index.js";
import { initializeRouteHandlers, processHttpRequest } from "./web.js";
import type { GatewayOptions } from "./types.js";
import { addPortRouter } from "./portRouters.js";
import { npsPortRouter } from "./npsPortRouter.js";
import { mcotsPortRouter } from "./mcotsPortRouter.js";
import http from "node:http";
import { HotkeyManager } from "./HotkeyManager.js";
import { ServerLifecycleManager, ServerStatus } from "./lifecycle/ServerLifecycleManager.js";
import { initializeSessionRecorder } from "./session/SessionRecorderIntegration.js";


/**
 * Gateway server
 * @see {@link getGatewayServer()} to get a singleton instance
 */
export class Gateway {
    config: Configuration;
    log = getServerLogger("Gateway")
    timer: NodeJS.Timeout | null;
    loopInterval: number;
    private readonly lifecycleManager: ServerLifecycleManager;
    consoleEvents: string[];
    backlogAllowedCount: number;
    tcpListeningPortList: number[];
    udpListeningPortList: number[];
    activeServers: import('node:net').Server[];
    socketconnection: ({
        incomingSocket,
        log,
    }: {
        incomingSocket: TcpSocket;
        log?: ServerLogger;
    }) => void;
    webServer: http.Server;

    /**
     * Gets the current server status as a string (for backward compatibility)
     * @returns The current status as a string
     */
    get status(): string {
        return this.lifecycleManager.getStatus();
    }

    /**
     * Creates an instance of GatewayServer.
     * @param {GatewayOptions} options
     */
    constructor({
        config = getServerConfiguration(),
        log = getServerLogger('Gateway'),
        backlogAllowedCount = 0,
        tcpListeningPortList = [],
        udpListeningPortList = [],
        socketConnectionHandler = onSocketConnection,
    }: GatewayOptions) {
        // Only log if not in test environment to avoid log output during tests
        const isTestEnv = process.env.NODE_ENV === "test" || process.env.VITEST === "true";
        if (!isTestEnv) {
            log.debug('Creating GatewayServer instance');
        }

        this.config = config;
        this.log = log;
        /** @type {NodeJS.Timeout | null} */
        this.timer = null;
        this.loopInterval = 0;
        this.lifecycleManager = new ServerLifecycleManager(log);
        this.consoleEvents = ['userExit', 'userRestart', 'userHelp'];
        this.backlogAllowedCount = backlogAllowedCount;
        this.tcpListeningPortList = tcpListeningPortList;
        this.udpListeningPortList = udpListeningPortList;
        /** @type {import("node:net").Server[]} */
        this.activeServers = [];
        this.socketconnection = socketConnectionHandler;

        initializeRouteHandlers();

        this.webServer = http.createServer(processHttpRequest);

        // Initialize session recorder (enabled via RECORD_SESSIONS env var)
        initializeSessionRecorder(log);
    }

    /**
     * Starts the GatewayServer.
     *
     * This method initializes the server, starts new servers on the specified ports,
     * and sets up the web server connection. If the web server is not defined, it throws an error.
     * Finally, it updates the server status to "running".
     *
     * @throws {Error} If the web server is undefined.
     */
    async start(): Promise<void> {
        // Initialize the GatewayServer
        this.init();

        const tcpListeningServers: Promise<Server>[] = [];
        const udpListeningSockets: Promise<UdpSocket>[] = [];

        for (const port of this.tcpListeningPortList) {
            const server = this.startTcpNewServer(port, this.socketconnection);
            tcpListeningServers.push(server);
        }

        for (const port of this.udpListeningPortList) {
            const socket = this.openUdpSocket(port, async (message: Buffer<ArrayBufferLike>, remoteInfo: RemoteInfo) => {
                onUdpMessage({
                    incomingSocket: await socket,
                    message,
                    remoteInfo
                })
            })
            udpListeningSockets.push(socket)
        }

        await Promise.all([tcpListeningServers, udpListeningSockets]);

        this.log.debug(`All sockets listening`);

        if (this.webServer === undefined) {
            throw Error('webServer is undefined');
        }
        this.startTcpNewServer(3000, ({ incomingSocket }) => {
            this.webServer.emit('connection', incomingSocket);
        });

        this.lifecycleManager.setStatus(ServerStatus.RUNNING);

        new HotkeyManager(this);
    }

    /**
     * Starts a new server on the specified port and sets up a socket connection handler.
     *
     * @param port - The port number on which the server will listen.
     * @param socketConnectionHandler - A callback function that handles incoming socket connections.
     * @param socketConnectionHandler.incomingSocket - The incoming socket connection.
     */
    private async startTcpNewServer(
        port: number,
        socketConnectionHandler: ({
            incomingSocket,
        }: {
            incomingSocket: TcpSocket;
        }) => void,
    ): Promise<Server> {
        const server = createSocketServer((s) => {
            socketConnectionHandler({ incomingSocket: s });
        });

        // Listen on the specified port
        const handle: Promise<Server> = new Promise((resolve, reject) => {
            try {
                server.listen(port, '0.0.0.0', this.backlogAllowedCount, () => {
                    resolve(server);
                });
            } catch (err) {
                reject(err);
            }
        });

        // Add the server to the list of servers
        this.activeServers.push(server);
        return handle;
    }

    private async openUdpSocket(
        port: number,
        socketConnectionHandler: (message: Buffer<ArrayBufferLike>, rinfo: RemoteInfo) => void,
    ): Promise<UdpSocket> {
        const server = createSocket({
            type: "udp4"
        }, socketConnectionHandler);

        // Listen on the specified port
        const handle: Promise<UdpSocket> = new Promise((resolve, reject) => {
            try {
                server.on("listening", () => {resolve(server)})
                server.bind(port);
            } catch (err) {
                reject(err);
            }
        });

        // Add the server to the list of servers
        return handle;
    }

    /**
     * Gracefully stops the GatewayServer and exits the process.
     *
     * This method first stops the GatewayServer by calling the `stop` method,
     * and then exits the Node.js process with a status code of 0.
     *
     * @returns {Promise<void>} A promise that resolves when the server has stopped and the process has exited.
     */
    async exit(): Promise<void> {
        console.log('Exiting GatewayServer...');
        // Stop the GatewayServer
        await this.stop();

        // Exit the process
        process.exit(0);
    }

    /**
     * Stops the GatewayServer.
     *
     * This method performs the following actions:
     * 1. Marks the GatewayServer as stopping.
     * 2. Stops the servers by calling `shutdownServers`.
     * 3. Stops the timer if it is running.
     * 4. Marks the GatewayServer as stopped.
     * 5. Resets the global state by creating and saving the initial state.
     *
     * @returns {Promise<void>} A promise that resolves when the server has been stopped.
     */
    async stop(): Promise<void> {
        // Mark the GatewayServer as stopping
        this.log.debug('Marking GatewayServer as stopping');
        this.lifecycleManager.setStatus(ServerStatus.STOPPING);

        // Stop the servers
        await this.shutdownServers();

        // Stop the timer
        if (this.timer !== null) {
            clearInterval(this.timer);
        }

        // Mark the GatewayServer as stopped
        this.log.debug('Marking GatewayServer as stopped');
        this.lifecycleManager.setStatus(ServerStatus.STOPPED);

        // Reset the global state
        this.log.debug('Resetting the global state');
        createInitialState({}).save();
    }

    /**
     * Shuts down all active servers and emits a close event on the web server.
     *
     * @throws {Error} If the webServer is undefined.
     * @private
     * @async
     */
    private async shutdownServers() {
        this.log.info('Shutting down servers');
        this.activeServers.forEach((server) => {
            server.close();
        });

        if (this.webServer === undefined) {
            throw Error('webServer is undefined');
        }
        this.webServer.emit('close');
    }

    /**
     * Initializes the GatewayServer by setting up the web server and registering routes.
     *
     * - Creates a Fastify web server instance.
     * - Registers the FastifySensible plugin for additional utilities.
     * - Adds port routers for various ports to handle incoming requests.
     * - Sets up a signal handler to gracefully exit on SIGINT.
     */
    private init() {
        addPortRouter(8226, npsPortRouter);
        addPortRouter(8227, npsPortRouter);
        addPortRouter(8228, npsPortRouter);
        addPortRouter(7003, npsPortRouter);
        for (let port = 9000; port < 9021; port++) {
            addPortRouter(port, npsPortRouter);
        }
        addPortRouter(10001, npsPortRouter);
        addPortRouter(43300, mcotsPortRouter);

        process.on('SIGINT', this.exit.bind(this));

        process.on('exit', () => {
            console.dir(messageStats);
        });
    }
}

export const messageStats: Map<number, number> = new Map();
