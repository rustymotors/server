import { Server, Socket as TcpSocket } from "node:net";
import { RemoteInfo, Socket as UdpSocket } from "node:dgram";
import { Configuration, getServerConfiguration, getServerLogger, ServerLogger, createInitialState } from "rusty-motors-shared";
import { onSocketConnection, onUdpMessage } from "./index.js";
import { initializeRouteHandlers, processHttpRequest } from "./web.js";
import type { GatewayOptions } from "./types.js";
import { setGlobalPortRouterRegistry } from "./portRouters.js";
import { npsPortRouter } from "./npsPortRouter.js";
import { mcotsPortRouter } from "./mcotsPortRouter.js";
import { PortRouterRegistry } from "./routing/PortRouterRegistry.js";
import { createDefaultPortConfiguration } from "./routing/DefaultPortConfiguration.js";
import http from "node:http";
import { HotkeyManager } from "./HotkeyManager.js";
import { ServerLifecycleManager, ServerStatus } from "./lifecycle/ServerLifecycleManager.js";
import { initializeSessionRecorder } from "./session/SessionRecorderIntegration.js";
import { NetworkServerManager } from "./network/NetworkServerManager.js";
import { ProcessSignalHandler, type ShutdownHandler } from "./signals/ProcessSignalHandler.js";


/**
 * Gateway server
 * @see {@link getGatewayServer()} to get a singleton instance
 */
export class Gateway implements ShutdownHandler {
    config: Configuration;
    log = getServerLogger("Gateway")
    timer: NodeJS.Timeout | null;
    loopInterval: number;
    private readonly lifecycleManager: ServerLifecycleManager;
    private readonly networkManager: NetworkServerManager;
    private readonly portRouterRegistry: PortRouterRegistry;
    private readonly signalHandler: ProcessSignalHandler;
    consoleEvents: string[];
    backlogAllowedCount: number;
    tcpListeningPortList: number[];
    udpListeningPortList: number[];
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
        this.networkManager = new NetworkServerManager(log, backlogAllowedCount);
        this.portRouterRegistry = new PortRouterRegistry();
        this.signalHandler = new ProcessSignalHandler(log);
        this.consoleEvents = ['userExit', 'userRestart', 'userHelp'];
        this.backlogAllowedCount = backlogAllowedCount;
        this.tcpListeningPortList = tcpListeningPortList;
        this.udpListeningPortList = udpListeningPortList;
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

        // Start TCP servers
        for (const port of this.tcpListeningPortList) {
            const server = this.networkManager.startTcpServer(port, this.socketconnection);
            tcpListeningServers.push(server);
        }

        // Start UDP sockets
        for (const port of this.udpListeningPortList) {
            // Store the socket promise so we can use it in the handler
            let socketRef: UdpSocket | null = null;
            const socketPromise = this.networkManager.startUdpServer(port, (message: Buffer<ArrayBufferLike>, remoteInfo: RemoteInfo) => {
                // Use the stored socket reference
                if (socketRef) {
                    onUdpMessage({
                        incomingSocket: socketRef,
                        message,
                        remoteInfo
                    });
                }
            });
            // Store the socket when it resolves
            socketPromise.then(socket => {
                socketRef = socket;
            });
            udpListeningSockets.push(socketPromise);
        }

        await Promise.all([...tcpListeningServers, ...udpListeningSockets]);

        this.log.debug(`All sockets listening`);

        // Start web server on port 3000
        if (this.webServer === undefined) {
            throw Error('webServer is undefined');
        }
        await this.networkManager.startTcpServer(3000, ({ incomingSocket }) => {
            this.webServer.emit('connection', incomingSocket);
        });

        this.lifecycleManager.setStatus(ServerStatus.RUNNING);

        new HotkeyManager(this);
    }


    /**
     * Shutdown handler implementation for SignalHandler
     * This is called when SIGINT is received
     *
     * @returns {Promise<void>} A promise that resolves when the server has stopped
     */
    async shutdown(): Promise<void> {
        await this.stop();
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
        this.log.info('Exiting GatewayServer...');
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
        await this.networkManager.shutdownAll();

        if (this.webServer === undefined) {
            throw Error('webServer is undefined');
        }
        this.webServer.emit('close');
    }

    /**
     * Initializes the GatewayServer by setting up the web server and registering routes.
     *
     * - Registers default port router configuration.
     * - Sets the global port router registry for backward compatibility.
     * - Registers signal handler for graceful shutdown on SIGINT.
     */
    private init() {
        // Register default port configuration
        createDefaultPortConfiguration(
            this.portRouterRegistry,
            npsPortRouter,
            mcotsPortRouter,
        );

        // Set global registry for backward compatibility with existing portRouters API
        setGlobalPortRouterRegistry(this.portRouterRegistry);

        // Register signal handler for graceful shutdown
        // Note: This only handles process signals (SIGINT, exit).
        // ConsoleThread handles keyboard input separately and emits events
        // that Gateway can listen to independently.
        this.signalHandler.registerShutdownHandler(this);

        // Register exit handler for message stats logging
        // (This is separate from SignalHandler's exit listener)
        process.on('exit', () => {
            console.dir(messageStats);
        });
    }
}

export const messageStats: Map<number, number> = new Map();
