# Gateway Class Refactoring Recommendations

This document provides recommendations for refactoring the `Gateway` class to follow clean code principles, SOLID design patterns, and game server best practices.

## Current Issues Analysis

### 1. Single Responsibility Principle (SRP) Violations

The `Gateway` class currently handles:
- Server lifecycle management (start/stop/exit)
- TCP/UDP server creation and management
- Web server management
- Port router registration
- Signal handling (SIGINT, exit)
- Configuration management
- State management
- Hotkey management initialization

**Problem**: Too many responsibilities make the class hard to understand, test, and maintain.

### 2. Code Smells

- **Unused fields**: `timer`, `loopInterval`, `consoleEvents` are defined but never used
- **Magic numbers**: Hardcoded port `3000` for web server, port ranges in `init()`
- **String-based status**: `status` is a string instead of an enum, prone to typos
- **Mixed concerns**: Initialization, lifecycle, and configuration all mixed together
- **Direct dependencies**: Hard dependencies on concrete implementations
- **Console.log usage**: Using `console.log`/`console.dir` instead of logger
- **Hardcoded IP whitelist**: IP addresses hardcoded in `init()` method

### 3. SOLID Principle Violations

- **SRP**: Multiple responsibilities (see above)
- **OCP**: Hard to extend without modifying the class
- **DIP**: Depends on concrete implementations rather than abstractions
- **ISP**: Large interface with many responsibilities

### 4. Game Server Best Practices Violations

- No clear separation between server management and business logic
- Resource cleanup not explicit
- Error handling inconsistent
- Configuration not externalized
- Lifecycle not clearly defined
- Hard to test due to tight coupling

---

## Recommended Refactoring

### Architecture Overview

```
Gateway (Orchestrator)
├── ServerLifecycleManager (start/stop/status)
├── NetworkServerManager (TCP/UDP server management)
├── WebServerManager (HTTP server management)
├── PortRouterRegistry (Port router configuration)
├── SignalHandler (Process signal handling)
└── GatewayConfiguration (Configuration management)
```

### Architecture Vision: Volatility-Based Composition Taxonomy

**End Goal**: Organize components using a volatility-based composition taxonomy, where:
- **Stable components** (rarely change) are separated from **volatile components** (frequently change)
- **Components that change together** are grouped together
- **Dependencies flow from volatile to stable** (stable components don't depend on volatile ones)
- **Changes are isolated** to minimize impact across the system

See `REFACTORING_GUIDELINES.md` for detailed explanation of volatility-based design principles.

### 1. Extract Server Lifecycle Management

**Create**: `ServerLifecycleManager`

```typescript
// packages/gateway/src/lifecycle/ServerLifecycleManager.ts

export enum ServerStatus {
    STOPPED = 'stopped',
    STARTING = 'starting',
    RUNNING = 'running',
    STOPPING = 'stopping',
    RESTARTING = 'restarting',
}

export interface LifecycleManager {
    getStatus(): ServerStatus;
    setStatus(status: ServerStatus): void;
    isRunning(): boolean;
    canStart(): boolean;
    canStop(): boolean;
}

export class ServerLifecycleManager implements LifecycleManager {
    private status: ServerStatus = ServerStatus.STOPPED;
    private readonly log: ServerLogger;

    constructor(log: ServerLogger) {
        this.log = log;
    }

    getStatus(): ServerStatus {
        return this.status;
    }

    setStatus(status: ServerStatus): void {
        this.log.debug(`Status changed: ${this.status} -> ${status}`);
        this.status = status;
    }

    isRunning(): boolean {
        return this.status === ServerStatus.RUNNING;
    }

    canStart(): boolean {
        return this.status === ServerStatus.STOPPED;
    }

    canStop(): boolean {
        return this.status === ServerStatus.RUNNING;
    }
}
```

**Benefits**:
- Clear status management
- Type-safe status values
- Easy to test
- Single responsibility

---

### 2. Extract Network Server Management

**Create**: `NetworkServerManager`

```typescript
// packages/gateway/src/network/NetworkServerManager.ts

export interface NetworkServer {
    port: number;
    server: Server | UdpSocket;
    type: 'tcp' | 'udp';
}

export interface NetworkServerManager {
    startTcpServer(port: number, handler: SocketConnectionHandler): Promise<Server>;
    startUdpServer(port: number, handler: UdpMessageHandler): Promise<UdpSocket>;
    shutdownAll(): Promise<void>;
    getActiveServers(): NetworkServer[];
}

export class NetworkServerManager implements NetworkServerManager {
    private readonly tcpServers: Map<number, Server> = new Map();
    private readonly udpSockets: Map<number, UdpSocket> = new Map();
    private readonly log: ServerLogger;
    private readonly backlogAllowedCount: number;

    constructor(
        log: ServerLogger,
        backlogAllowedCount: number = 0,
    ) {
        this.log = log;
        this.backlogAllowedCount = backlogAllowedCount;
    }

    async startTcpServer(
        port: number,
        handler: SocketConnectionHandler,
    ): Promise<Server> {
        if (this.tcpServers.has(port)) {
            throw new Error(`TCP server already running on port ${port}`);
        }

        const server = createSocketServer((socket) => {
            handler({ incomingSocket: socket });
        });

        return new Promise((resolve, reject) => {
            server.listen(port, '0.0.0.0', this.backlogAllowedCount, () => {
                this.tcpServers.set(port, server);
                this.log.info(`TCP server listening on port ${port}`);
                resolve(server);
            });

            server.on('error', (error) => {
                this.log.error(`TCP server error on port ${port}: ${error.message}`);
                this.tcpServers.delete(port);
                reject(error);
            });
        });
    }

    async startUdpServer(
        port: number,
        handler: UdpMessageHandler,
    ): Promise<UdpSocket> {
        if (this.udpSockets.has(port)) {
            throw new Error(`UDP socket already bound to port ${port}`);
        }

        const socket = createSocket('udp4');

        return new Promise((resolve, reject) => {
            socket.on('message', handler);
            socket.on('listening', () => {
                this.udpSockets.set(port, socket);
                this.log.info(`UDP socket bound to port ${port}`);
                resolve(socket);
            });
            socket.on('error', (error) => {
                this.log.error(`UDP socket error on port ${port}: ${error.message}`);
                this.udpSockets.delete(port);
                reject(error);
            });
            socket.bind(port);
        });
    }

    async shutdownAll(): Promise<void> {
        const shutdownPromises: Promise<void>[] = [];

        // Close all TCP servers
        for (const [port, server] of this.tcpServers.entries()) {
            shutdownPromises.push(
                new Promise<void>((resolve) => {
                    server.close(() => {
                        this.log.debug(`TCP server on port ${port} closed`);
                        resolve();
                    });
                }),
            );
        }

        // Close all UDP sockets
        for (const [port, socket] of this.udpSockets.entries()) {
            shutdownPromises.push(
                new Promise<void>((resolve) => {
                    socket.close(() => {
                        this.log.debug(`UDP socket on port ${port} closed`);
                        resolve();
                    });
                }),
            );
        }

        await Promise.all(shutdownPromises);
        this.tcpServers.clear();
        this.udpSockets.clear();
    }

    getActiveServers(): NetworkServer[] {
        const servers: NetworkServer[] = [];
        for (const [port, server] of this.tcpServers.entries()) {
            servers.push({ port, server, type: 'tcp' });
        }
        for (const [port, socket] of this.udpSockets.entries()) {
            servers.push({ port, server: socket, type: 'udp' });
        }
        return servers;
    }
}
```

**Benefits**:
- Clear resource management
- Proper error handling
- Easy to test
- Can track all active servers

---

### 3. Extract Web Server Management

**Create**: `WebServerManager`

```typescript
// packages/gateway/src/web/WebServerManager.ts

export interface WebServerManager {
    start(port: number): Promise<void>;
    stop(): Promise<void>;
    isRunning(): boolean;
    getServer(): http.Server;
}

export class WebServerManager implements WebServerManager {
    private server: http.Server | null = null;
    private readonly log: ServerLogger;
    private readonly requestHandler: http.RequestListener;

    constructor(
        log: ServerLogger,
        requestHandler: http.RequestListener,
    ) {
        this.log = log;
        this.requestHandler = requestHandler;
    }

    async start(port: number): Promise<void> {
        if (this.server !== null) {
            throw new Error('Web server already running');
        }

        this.server = http.createServer(this.requestHandler);

        return new Promise((resolve, reject) => {
            this.server!.listen(port, () => {
                this.log.info(`Web server listening on port ${port}`);
                resolve();
            });

            this.server!.on('error', (error) => {
                this.log.error(`Web server error: ${error.message}`);
                this.server = null;
                reject(error);
            });
        });
    }

    async stop(): Promise<void> {
        if (this.server === null) {
            return;
        }

        return new Promise((resolve) => {
            this.server!.close(() => {
                this.log.info('Web server stopped');
                this.server = null;
                resolve();
            });
        });
    }

    isRunning(): boolean {
        return this.server !== null;
    }

    getServer(): http.Server {
        if (this.server === null) {
            throw new Error('Web server not running');
        }
        return this.server;
    }
}
```

**Benefits**:
- Clear web server lifecycle
- Proper error handling
- Easy to test
- No undefined checks needed

---

### 4. Extract Port Router Configuration

**Create**: `PortRouterRegistry` and `PortConfiguration`

```typescript
// packages/gateway/src/routing/PortConfiguration.ts

export interface PortMapping {
    port: number;
    router: PortRouter;
}

export interface PortConfiguration {
    getMappings(): PortMapping[];
    registerPort(port: number, router: PortRouter): void;
    registerPortRange(start: number, end: number, router: PortRouter): void;
    clear(): void;
}

export class PortRouterRegistry implements PortConfiguration {
    private readonly mappings: Map<number, PortRouter> = new Map();

    registerPort(port: number, router: PortRouter): void {
        if (this.mappings.has(port)) {
            throw new Error(`Port ${port} already registered`);
        }
        this.mappings.set(port, router);
    }

    registerPortRange(start: number, end: number, router: PortRouter): void {
        for (let port = start; port <= end; port++) {
            this.registerPort(port, router);
        }
    }

    getMappings(): PortMapping[] {
        return Array.from(this.mappings.entries()).map(([port, router]) => ({
            port,
            router,
        }));
    }

    getRouter(port: number): PortRouter | undefined {
        return this.mappings.get(port);
    }

    clear(): void {
        this.mappings.clear();
    }
}

// packages/gateway/src/routing/DefaultPortConfiguration.ts

export function createDefaultPortConfiguration(
    registry: PortRouterRegistry,
    npsRouter: PortRouter,
    mcotsRouter: PortRouter,
): void {
    // NPS ports
    registry.registerPort(8226, npsRouter);
    registry.registerPort(8227, npsRouter);
    registry.registerPort(8228, npsRouter);
    registry.registerPort(7003, npsRouter);
    registry.registerPortRange(9000, 9020, npsRouter);
    registry.registerPort(10001, npsRouter);

    // MCOTS ports
    registry.registerPort(43300, mcotsRouter);
}
```

**Benefits**:
- Configuration separated from initialization
- Easy to extend with new ports
- Can be loaded from config file
- Testable in isolation

---

### 5. Extract Signal Handling

**Create**: `SignalHandler`

```typescript
// packages/gateway/src/signals/SignalHandler.ts

export interface ShutdownHandler {
    shutdown(): Promise<void>;
}

export interface SignalHandler {
    registerShutdownHandler(handler: ShutdownHandler): void;
    unregisterShutdownHandler(): void;
}

export class ProcessSignalHandler implements SignalHandler {
    private shutdownHandler: ShutdownHandler | null = null;
    private readonly log: ServerLogger;
    private sigintListener: (() => void) | null = null;
    private exitListener: (() => void) | null = null;

    constructor(log: ServerLogger) {
        this.log = log;
    }

    registerShutdownHandler(handler: ShutdownHandler): void {
        if (this.shutdownHandler !== null) {
            this.unregisterShutdownHandler();
        }

        this.shutdownHandler = handler;

        this.sigintListener = async () => {
            this.log.info('Received SIGINT, initiating graceful shutdown');
            await handler.shutdown();
            process.exit(0);
        };

        this.exitListener = () => {
            // Log stats or perform cleanup on process exit
            this.log.debug('Process exiting');
        };

        process.on('SIGINT', this.sigintListener);
        process.on('exit', this.exitListener);
    }

    unregisterShutdownHandler(): void {
        if (this.sigintListener) {
            process.removeListener('SIGINT', this.sigintListener);
            this.sigintListener = null;
        }
        if (this.exitListener) {
            process.removeListener('exit', this.exitListener);
            this.exitListener = null;
        }
        this.shutdownHandler = null;
    }
}
```

**Benefits**:
- Clean signal handling
- Easy to test
- Can be disabled for testing
- Proper cleanup

---

### 6. Extract Configuration Management

**Create**: `GatewayConfiguration`

```typescript
// packages/gateway/src/config/GatewayConfiguration.ts

export interface GatewayConfig {
    tcpPorts: number[];
    udpPorts: number[];
    webPort: number;
    backlogAllowedCount: number;
    allowedIpAddresses?: string[];
}

export interface ConfigurationProvider {
    getConfig(): GatewayConfig;
}

export class GatewayConfiguration implements ConfigurationProvider {
    private readonly config: GatewayConfig;

    constructor(config: Partial<GatewayConfig> = {}) {
        this.config = {
            tcpPorts: config.tcpPorts ?? [],
            udpPorts: config.udpPorts ?? [],
            webPort: config.webPort ?? 3000,
            backlogAllowedCount: config.backlogAllowedCount ?? 0,
            allowedIpAddresses: config.allowedIpAddresses,
        };
    }

    getConfig(): GatewayConfig {
        return { ...this.config };
    }

    getTcpPorts(): number[] {
        return [...this.config.tcpPorts];
    }

    getUdpPorts(): number[] {
        return [...this.config.udpPorts];
    }

    getWebPort(): number {
        return this.config.webPort;
    }

    getBacklogAllowedCount(): number {
        return this.config.backlogAllowedCount;
    }

    getAllowedIpAddresses(): string[] | undefined {
        return this.config.allowedIpAddresses;
    }
}
```

**Benefits**:
- Configuration externalized
- Type-safe
- Easy to test with different configs
- Can load from environment variables or config files

---

### 7. Refactored Gateway Class

```typescript
// packages/gateway/src/GatewayServer.ts

export interface GatewayDependencies {
    lifecycleManager: LifecycleManager;
    networkManager: NetworkServerManager;
    webServerManager: WebServerManager;
    portConfiguration: PortConfiguration;
    signalHandler: SignalHandler;
    config: GatewayConfiguration;
    socketConnectionHandler: SocketConnectionHandler;
    udpMessageHandler: UdpMessageHandler;
    hotkeyManagerFactory?: (gateway: Gateway) => HotkeyManager;
    log: ServerLogger;
}

export class Gateway {
    private readonly lifecycleManager: LifecycleManager;
    private readonly networkManager: NetworkServerManager;
    private readonly webServerManager: WebServerManager;
    private readonly portConfiguration: PortConfiguration;
    private readonly signalHandler: SignalHandler;
    private readonly config: GatewayConfiguration;
    private readonly socketConnectionHandler: SocketConnectionHandler;
    private readonly udpMessageHandler: UdpMessageHandler;
    private readonly log: ServerLogger;
    private hotkeyManager: HotkeyManager | null = null;

    constructor(dependencies: GatewayDependencies) {
        this.lifecycleManager = dependencies.lifecycleManager;
        this.networkManager = dependencies.networkManager;
        this.webServerManager = dependencies.webServerManager;
        this.portConfiguration = dependencies.portConfiguration;
        this.signalHandler = dependencies.signalHandler;
        this.config = dependencies.config;
        this.socketConnectionHandler = dependencies.socketConnectionHandler;
        this.udpMessageHandler = dependencies.udpMessageHandler;
        this.log = dependencies.log;

        // Register shutdown handler
        this.signalHandler.registerShutdownHandler({
            shutdown: () => this.stop(),
        });
    }

    async start(): Promise<void> {
        if (!this.lifecycleManager.canStart()) {
            throw new Error(
                `Cannot start server. Current status: ${this.lifecycleManager.getStatus()}`,
            );
        }

        this.lifecycleManager.setStatus(ServerStatus.STARTING);
        this.log.info('Starting gateway server...');

        try {
            // Start TCP servers
            await this.startTcpServers();

            // Start UDP servers
            await this.startUdpServers();

            // Start web server
            await this.webServerManager.start(this.config.getWebPort());

            // Initialize hotkey manager if factory provided
            if (this.hotkeyManagerFactory) {
                this.hotkeyManager = this.hotkeyManagerFactory(this);
            }

            this.lifecycleManager.setStatus(ServerStatus.RUNNING);
            this.log.info('Gateway server started successfully');
        } catch (error) {
            this.lifecycleManager.setStatus(ServerStatus.STOPPED);
            await this.stop(); // Cleanup on failure
            throw error;
        }
    }

    private async startTcpServers(): Promise<void> {
        const ports = this.config.getTcpPorts();
        const promises = ports.map((port) =>
            this.networkManager.startTcpServer(port, this.socketConnectionHandler),
        );
        await Promise.all(promises);
        this.log.info(`Started ${ports.length} TCP servers`);
    }

    private async startUdpServers(): Promise<void> {
        const ports = this.config.getUdpPorts();
        const promises = ports.map((port) =>
            this.networkManager.startUdpServer(port, this.udpMessageHandler),
        );
        await Promise.all(promises);
        this.log.info(`Started ${ports.length} UDP servers`);
    }

    async stop(): Promise<void> {
        if (!this.lifecycleManager.canStop()) {
            this.log.warn(
                `Cannot stop server. Current status: ${this.lifecycleManager.getStatus()}`,
            );
            return;
        }

        this.lifecycleManager.setStatus(ServerStatus.STOPPING);
        this.log.info('Stopping gateway server...');

        try {
            // Stop hotkey manager
            if (this.hotkeyManager) {
                // HotkeyManager cleanup if needed
                this.hotkeyManager = null;
            }

            // Stop web server
            await this.webServerManager.stop();

            // Stop network servers
            await this.networkManager.shutdownAll();

            this.lifecycleManager.setStatus(ServerStatus.STOPPED);
            this.log.info('Gateway server stopped');
        } catch (error) {
            this.log.error(`Error during shutdown: ${error}`);
            throw error;
        }
    }

    async exit(): Promise<void> {
        this.log.info('Exiting gateway server...');
        await this.stop();
        process.exit(0);
    }

    getStatus(): ServerStatus {
        return this.lifecycleManager.getStatus();
    }

    isRunning(): boolean {
        return this.lifecycleManager.isRunning();
    }
}
```

**Benefits**:
- Single responsibility: Orchestration only
- Dependency injection: Easy to test
- Clear lifecycle: Explicit state management
- Error handling: Proper cleanup on failure
- No unused fields
- Type-safe status

---

### 8. Factory Function for Easy Construction

```typescript
// packages/gateway/src/GatewayFactory.ts

export function createGateway(options: Partial<GatewayOptions> = {}): Gateway {
    const log = options.log ?? getServerLogger('Gateway');
    const config = new GatewayConfiguration({
        tcpPorts: options.tcpListeningPortList ?? [],
        udpPorts: options.udpListeningPortList ?? [],
        webPort: 3000,
        backlogAllowedCount: options.backlogAllowedCount ?? 0,
    });

    const lifecycleManager = new ServerLifecycleManager(log);
    const networkManager = new NetworkServerManager(
        log,
        config.getBacklogAllowedCount(),
    );
    const webServerManager = new WebServerManager(log, processHttpRequest);
    const portRegistry = new PortRouterRegistry();
    const signalHandler = new ProcessSignalHandler(log);

    // Register default port configuration
    createDefaultPortConfiguration(
        portRegistry,
        npsPortRouter,
        mcotsPortRouter,
    );

    // Register port routers
    for (const mapping of portRegistry.getMappings()) {
        addPortRouter(mapping.port, mapping.router);
    }

    return new Gateway({
        lifecycleManager,
        networkManager,
        webServerManager,
        portConfiguration: portRegistry,
        signalHandler,
        config,
        socketConnectionHandler: options.socketConnectionHandler ?? onSocketConnection,
        udpMessageHandler: onUdpMessage,
        hotkeyManagerFactory: (gateway) => new HotkeyManager(gateway),
        log,
    });
}
```

**Benefits**:
- Easy to create Gateway instances
- Backward compatible with existing code
- Can be extended with custom configurations

---

## Migration Strategy

### Phase 1: Extract Components (Non-Breaking)
1. Create new classes alongside existing Gateway
2. Add factory function
3. Test new implementation
4. Keep old Gateway for backward compatibility

### Phase 2: Update Usage (Breaking)
1. Update `src/nps_server.ts` and `src/mcots_server.ts` to use factory
2. Remove old Gateway implementation
3. Update tests

### Phase 3: Cleanup
1. Remove unused fields
2. Update documentation
3. Add integration tests

---

## Testing Improvements

### Before (Hard to Test)
```typescript
// Hard to test - tight coupling, side effects
const gateway = new Gateway({ /* ... */ });
await gateway.start(); // Creates real servers, binds to ports
```

### After (Easy to Test)
```typescript
// Easy to test - dependency injection, mocks
const mockNetworkManager = createMockNetworkManager();
const mockWebServerManager = createMockWebServerManager();
const gateway = new Gateway({
    networkManager: mockNetworkManager,
    webServerManager: mockWebServerManager,
    // ... other dependencies
});
await gateway.start(); // Uses mocks, no real servers
```

---

## Benefits Summary

1. **Single Responsibility**: Each class has one clear purpose
2. **Testability**: Easy to mock dependencies and test in isolation
3. **Maintainability**: Changes are localized to specific classes
4. **Extensibility**: Easy to add new features without modifying existing code
5. **Type Safety**: Enums instead of strings, interfaces for contracts
6. **Error Handling**: Proper error handling and cleanup
7. **Configuration**: Externalized and type-safe
8. **Resource Management**: Clear lifecycle and cleanup
9. **Code Clarity**: Each method does one thing
10. **Game Server Best Practices**: Clear separation of concerns, proper lifecycle management

---

## Additional Recommendations

### 1. Remove Unused Code
- Remove `timer`, `loopInterval`, `consoleEvents` fields
- Remove `messageStats` if not used

### 2. Replace console.log
- Use logger throughout
- Remove `console.dir(messageStats)` or use logger

### 3. Configuration Externalization
- Move port lists to configuration file
- Move IP whitelist to configuration
- Support environment variable overrides

### 4. Error Handling Strategy
- Define error types
- Consistent error handling pattern
- Proper error propagation

### 5. Documentation
- Add JSDoc comments
- Document lifecycle states
- Document dependencies

---

## Example Usage After Refactoring

```typescript
// Simple usage
const gateway = createGateway({
    tcpListeningPortList: [7003, 8226, 8227, 8228],
    udpListeningPortList: [6660],
});

await gateway.start();

// Advanced usage with custom dependencies
const customGateway = new Gateway({
    lifecycleManager: new CustomLifecycleManager(),
    networkManager: new CustomNetworkManager(),
    // ... custom dependencies
});
```

This refactoring makes the Gateway class much easier to understand, test, and maintain while following SOLID principles and game server best practices.
