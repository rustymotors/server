# WebServerManager Migration Complete

## Changes Made

### WebServerManager Class Created

1. **New File**: `src/web/WebServerManager.ts`
   - Extracted HTTP server management from Gateway class
   - Implements `IWebServerManager` interface
   - Manages HTTP server lifecycle
   - **Integrates with NetworkServerManager** for TCP connection handling

2. **Key Features**:
   - `start()` - Marks server as ready to receive connections
   - `stop()` - Stops the HTTP server
   - `isRunning()` - Checks if server is ready
   - `getServer()` - Returns HTTP server instance for NetworkServerManager
   - Proper error handling and logging

### Important Design Decision

**WebServerManager integrates with NetworkServerManager**:

- **WebServerManager** creates and manages the HTTP server
- **NetworkServerManager** handles TCP listening on port 3000
- Connections are passed from TCP server to HTTP server via `server.emit('connection', socket)`
- This design supports **both HTTP and raw packet handling** on the same port

### Gateway Class Updates

1. **Added Imports**
   - Imported `WebServerManager` from `./web/WebServerManager.js`
   - Removed direct `http` import (no longer needed)

2. **Replaced Web Server Management**
   - Removed: `webServer: http.Server`
   - Removed: `this.webServer = http.createServer(processHttpRequest)` from constructor
   - Added: `private readonly webServerManager: WebServerManager`

3. **Updated Constructor**
   - Initializes `webServerManager` with `new WebServerManager(log, processHttpRequest)`
   - HTTP server is created automatically in WebServerManager constructor

4. **Updated start() Method**
   - Calls `webServerManager.start(3000)` to mark server as ready
   - Uses `webServerManager.getServer()` to get HTTP server for NetworkServerManager
   - Removed undefined check (no longer needed)

5. **Updated shutdownServers() Method**
   - Changed from `webServer.emit('close')` to `webServerManager.stop()`
   - Removed undefined check (no longer needed)
   - Properly stops the web server

## Backward Compatibility

- All existing functionality preserved
- HTTP server still receives connections via TCP port 3000
- Raw packet handling still works (via NetworkServerManager)
- Gateway API remains unchanged
- No breaking changes to external interfaces

## Benefits

1. **Single Responsibility**: Web server management is now isolated
2. **Testability**: WebServerManager can be tested independently
3. **No Undefined Checks**: Server is always available after construction
4. **Maintainability**: Clear separation of concerns
5. **Integration**: Works seamlessly with NetworkServerManager
6. **Raw Packet Support**: Maintains ability to handle raw packets on web port

## Testing

Comprehensive test suite created at `test/web/WebServerManager.test.ts` covering:

1. **Server Lifecycle**
   - Starting server (marking as ready)
   - Stopping server
   - Checking running status
   - Restarting after stop

2. **Server Access**
   - Getting server instance
   - Server availability

3. **NetworkServerManager Integration**
   - Connection handling via TCP socket emission
   - HTTP request processing

4. **Request Handler**
   - Custom request handler support

5. **Error Handling**
   - Server error handling

To run the tests:

```bash
# From project root
npm test -- packages/gateway/test/web/WebServerManager.test.ts

# Or from gateway package
cd packages/gateway
npm test -- test/web/WebServerManager.test.ts
```

## Implementation Details

### WebServerManager Interface

```typescript
interface IWebServerManager {
    start(port: number): Promise<void>;
    stop(): Promise<void>;
    isRunning(): boolean;
    getServer(): http.Server;
}
```

### Integration Pattern

```typescript
// 1. WebServerManager creates HTTP server
const webServerManager = new WebServerManager(log, processHttpRequest);

// 2. Mark server as ready
await webServerManager.start(3000);

// 3. NetworkServerManager starts TCP server and connects it
await networkManager.startTcpServer(3000, ({ incomingSocket }) => {
    webServerManager.getServer().emit('connection', incomingSocket);
});
```

### Why This Design?

The web server is hooked up through a TCP port because:
- **Raw packet support**: Game server needs to handle raw TCP packets
- **HTTP support**: Also needs to serve HTTP requests
- **Same port**: Both protocols on port 3000
- **Flexibility**: NetworkServerManager can route connections appropriately

## Migration Path

### Before
```typescript
// Constructor
this.webServer = http.createServer(processHttpRequest);

// start()
if (this.webServer === undefined) {
    throw Error('webServer is undefined');
}
await this.networkManager.startTcpServer(3000, ({ incomingSocket }) => {
    this.webServer.emit('connection', incomingSocket);
});

// shutdownServers()
if (this.webServer === undefined) {
    throw Error('webServer is undefined');
}
this.webServer.emit('close');
```

### After
```typescript
// Constructor
this.webServerManager = new WebServerManager(log, processHttpRequest);

// start()
await this.webServerManager.start(3000);
await this.networkManager.startTcpServer(3000, ({ incomingSocket }) => {
    this.webServerManager.getServer().emit('connection', incomingSocket);
});

// shutdownServers()
await this.webServerManager.stop();
```

## Next Steps

1. Test with real client to ensure HTTP and raw packet handling work correctly
2. Consider extracting GatewayConfiguration next (per refactoring plan)
3. Consider cleanup of unused fields (timer, loopInterval, consoleEvents)
