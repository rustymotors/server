import type { Server, Socket as TcpSocket } from "node:net";
import type { RemoteInfo, Socket as UdpSocket } from "node:dgram";
import { randomUUID } from "node:crypto";
import { getServerConfiguration, getServerLogger, type ServerLogger, createInitialState } from "rusty-motors-shared";
import { onSocketConnection, onUdpMessage } from "./index.js";
import { initializeRouteHandlers, processHttpRequest } from "./web.js";
import type { GatewayOptions } from "./types.js";
import { setGlobalPortRouterRegistry } from "./portRouters.js";
import { npsPortRouter } from "./npsPortRouter.js";
import { mcotsPortRouter } from "./mcotsPortRouter.js";
import { PortRouterRegistry } from "./routing/PortRouterRegistry.js";
import { createDefaultPortConfiguration } from "./routing/DefaultPortConfiguration.js";
import { HotkeyManager } from "./HotkeyManager.js";
import { ServerLifecycleManager, ServerStatus } from "./lifecycle/ServerLifecycleManager.js";
import { initializeSessionRecorder, getSessionRecorder } from "./session/SessionRecorderIntegration.js";
import { NetworkServerManager } from "./network/NetworkServerManager.js";
import { ProcessSignalHandler, type ShutdownHandler } from "./signals/ProcessSignalHandler.js";
import { WebServerManager } from "./web/WebServerManager.js";
import { GatewayConfiguration } from "./configuration/GatewayConfiguration.js";


/**
 * Gateway server
 * @see {@link getGatewayServer()} to get a singleton instance
 */
export class Gateway implements ShutdownHandler {
    private readonly gatewayConfig: GatewayConfiguration;
    log = getServerLogger("Gateway")
    private readonly lifecycleManager: ServerLifecycleManager;
    private readonly networkManager: NetworkServerManager;
    private readonly portRouterRegistry: PortRouterRegistry;
    private readonly signalHandler: ProcessSignalHandler;
    private readonly webServerManager: WebServerManager;
    private readonly socketconnection: ({
        incomingSocket,
        log,
    }: {
        incomingSocket: TcpSocket;
        log?: ServerLogger;
    }) => void;

    /**
     * Gets the shared server configuration (for backward compatibility)
     * @returns The shared Configuration object
     */
    get config() {
        return this.gatewayConfig.getSharedConfig();
    }

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
        webPort = 3000,
        socketConnectionHandler = onSocketConnection,
    }: GatewayOptions) {
        // Only log if not in test environment to avoid log output during tests
        const isTestEnv = process.env['NODE_ENV'] === "test" || process.env['VITEST'] === "true";
        if (!isTestEnv) {
            log.debug('Creating GatewayServer instance');
        }

        // Create GatewayConfiguration that wraps shared config and Gateway-specific settings
        // Extract shard ports from TCP port list if available, otherwise use defaults
        const loginPort = tcpListeningPortList.includes(8226) ? 8226 : 8226;
        const lobbyPort = tcpListeningPortList.includes(7003) ? 7003 : 7003;
        
        this.gatewayConfig = new GatewayConfiguration({
            sharedConfig: config,
            tcpPorts: tcpListeningPortList,
            udpPorts: udpListeningPortList,
            webPort: webPort,
            backlogAllowedCount: backlogAllowedCount,
            loginServerPort: loginPort,
            lobbyServerPort: lobbyPort,
            diagnosticServerPort: 80, // Diagnostic server port (separate from web port)
        });

        this.log = log;
        this.lifecycleManager = new ServerLifecycleManager(log);
        this.networkManager = new NetworkServerManager(log, this.gatewayConfig.getBacklogAllowedCount());
        this.portRouterRegistry = new PortRouterRegistry();
        this.signalHandler = new ProcessSignalHandler(log);
        this.webServerManager = new WebServerManager(log, processHttpRequest);
        this.socketconnection = socketConnectionHandler;

        // Initialize route handlers with GatewayConfiguration
        initializeRouteHandlers(this.gatewayConfig);

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
        for (const port of this.gatewayConfig.getTcpPorts()) {
            const server = this.networkManager.startTcpServer(port, this.socketconnection);
            tcpListeningServers.push(server);
        }

        // Start UDP sockets
        for (const port of this.gatewayConfig.getUdpPorts()) {
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

        // Start web server manager (marks server as ready)
        const webPort = this.gatewayConfig.getWebPort();
        await this.webServerManager.start(webPort);

        // Start TCP server on web port and connect it to HTTP server
        // This allows both HTTP and raw packet handling on the same port
        // Record raw TCP data before passing to HTTP server (consistent with other ports)
        await this.networkManager.startTcpServer(webPort, ({ incomingSocket }) => {
            const { localPort, remoteAddress } = incomingSocket;
            
            // Record session start if recording is enabled (raw TCP level)
            // This records the raw TCP stream, not HTTP-level data
            const recorder = getSessionRecorder();
            if (recorder?.isRecordingEnabled() && localPort && remoteAddress) {
                // Define connectionId in outer scope for use in closures
                const connectionId = `${randomUUID().substring(0, 8)}:${localPort}`;
                recorder.startSession(connectionId, localPort, remoteAddress);
                
                // Record incoming data (raw TCP bytes)
                incomingSocket.on('data', (data: Buffer) => {
                    if (recorder?.isRecordingEnabled() && localPort) {
                        recorder.recordDataIn(connectionId, localPort, data);
                    }
                });
                
                // Record outgoing data (raw TCP bytes)
                const originalWrite = incomingSocket.write.bind(incomingSocket);
                incomingSocket.write = (chunk: any, encoding?: any, cb?: any) => {
                    if (recorder?.isRecordingEnabled() && localPort) {
                        const data = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
                        recorder.recordDataOut(connectionId, localPort, data);
                    }
                    return originalWrite(chunk, encoding, cb);
                };
                
                // Record disconnect
                incomingSocket.once('end', () => {
                    if (recorder?.isRecordingEnabled() && localPort) {
                        recorder.recordDisconnect(connectionId, localPort);
                        recorder.saveSession(connectionId, `Auto-saved on disconnect (port ${localPort})`);
                    }
                });
            }
            
            // Pass to HTTP server (after setting up recording)
            this.webServerManager.getServer().emit('connection', incomingSocket);
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
     * 3. Marks the GatewayServer as stopped.
     * 4. Resets the global state by creating and saving the initial state.
     *
     * @returns {Promise<void>} A promise that resolves when the server has been stopped.
     */
    async stop(): Promise<void> {
        // Mark the GatewayServer as stopping
        this.log.debug('Marking GatewayServer as stopping');
        this.lifecycleManager.setStatus(ServerStatus.STOPPING);

        // Stop the servers
        await this.shutdownServers();

        // Mark the GatewayServer as stopped
        this.log.debug('Marking GatewayServer as stopped');
        this.lifecycleManager.setStatus(ServerStatus.STOPPED);

        // Reset the global state
        this.log.debug('Resetting the global state');
        createInitialState({}).save();
    }

    /**
     * Shuts down all active servers and stops the web server.
     *
     * @private
     * @async
     */
    private async shutdownServers() {
        this.log.info('Shutting down servers');
        await this.networkManager.shutdownAll();
        await this.webServerManager.stop();
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
            // Use logger for message stats (only logs if not in test environment)
            const isTestEnv = process.env['NODE_ENV'] === "test" || process.env['VITEST'] === "true";
            if (!isTestEnv && messageStats.size > 0) {
                this.log.info('Message statistics:', Object.fromEntries(messageStats));
            }
        });
    }
}

export const messageStats: Map<number, number> = new Map();
