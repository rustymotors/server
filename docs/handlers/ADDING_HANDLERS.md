# Adding Message Handlers

This guide explains how to add new message handlers to the MCOS server. The architecture follows SOLID principles, making it easy to extend without modifying existing code.

## Quick Start

1. Create a handler function in the appropriate service package
2. Define the packet structure with `setSerializeOrder()`
3. Implement handler logic and build responses
4. Register the handler in the service's registry

## Architecture Overview

```
Client sends message
         ↓
Gateway routes by port → ServiceRegistry
         ↓
Service dispatches by opCode → MessageHandlerRegistry
         ↓
Handler processes message → Returns responses
         ↓
Responses sent via MessageQueue
```

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| MessageHandlerRegistry | `packages/shared/src/handlers/` | Maps opCode → handler |
| HandlerTypes | `packages/shared/src/handlers/HandlerTypes.ts` | Type definitions |
| Service Registries | `packages/*/src/handlers/registry.ts` | Per-service handler maps |

## Step-by-Step Guide

### Step 1: Create the Handler Function

Create a new file in the appropriate service's `handlers/` directory.

**File:** `packages/lobby/src/handlers/handleMyNewMessage.ts`

```typescript
import { BytableMessage } from '@rustymotors/binary';
import {
    getServerLogger,
    ServerLogger,
    databaseProvider,
} from 'rusty-motors-shared';

/**
 * Handles the MY_NEW_MESSAGE (0xXXX) message.
 *
 * This handler processes [describe what it does].
 */
export async function handleMyNewMessage({
    connectionId,
    message,
    log = getServerLogger('lobby.handleMyNewMessage'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: BytableMessage[];
}> {
    try {
        log.debug(`[${connectionId}] Handling MY_NEW_MESSAGE`);

        // Step 2: Parse the incoming message (see below)
        // Step 3: Process and build response (see below)

        return {
            connectionId,
            messages: responseMessages,
        };
    } catch (error) {
        const err = new Error(
            `[${connectionId}] Error handling MY_NEW_MESSAGE: ${String(error)}`
        );
        err.cause = error;
        throw err;
    }
}
```

### Step 2: Parse the Incoming Message

Define the packet structure and deserialize:

```typescript
// Define the incoming message structure
const incomingRequest = new BytableMessage();
incomingRequest.setSerializeOrder([
    { name: 'userId', field: 'Dword' },      // 4 bytes
    { name: 'action', field: 'Short' },      // 2 bytes
    { name: 'payload', field: 'String' },    // 4-byte length + string
]);

// Deserialize from the received message
incomingRequest.deserialize(message.serialize());

// Extract field values (returned as Buffer)
const userIdBuffer = incomingRequest.getFieldValueByName('userId') as Buffer;
const userId = userIdBuffer.readInt32BE();

const actionBuffer = incomingRequest.getFieldValueByName('action') as Buffer;
const action = actionBuffer.readInt16BE();

const payloadBuffer = incomingRequest.getFieldValueByName('payload') as Buffer;
const payload = payloadBuffer.toString();
```

### Step 3: Process and Build Response

Implement your business logic and create response messages:

```typescript
// Access database via injected provider
const sessionStore = databaseProvider.getSessionStore();
const user = await sessionStore.getUser(userId);

if (!user) {
    throw new Error(`User ${userId} not found`);
}

// Build response message
const response = new BytableMessage(0);
response.setSerializeOrder([
    { name: 'status', field: 'Dword' },
    { name: 'result', field: 'String' },
]);

response.header.setId(0xYYY);  // Your response message ID
response.setFieldValueByName('status', 0);  // Success
response.setFieldValueByName('result', 'OK');

const responseMessages: BytableMessage[] = [response];
```

### Step 4: Register in the Service Registry

Add your handler to the appropriate registry file.

**File:** `packages/lobby/src/handlers/registry.ts`

```typescript
import { handleMyNewMessage } from './handleMyNewMessage.js';

export function createLobbyHandlerRegistry(): MessageHandlerRegistry<
    LobbyHandlerArgs,
    LobbyHandlerResult
> {
    const registry = new MessageHandlerRegistry<LobbyHandlerArgs, LobbyHandlerResult>('lobby');

    // Existing handlers...
    registry.register({
        opCode: 0x100,
        name: 'User login',
        handler: _npsRequestGameConnectServer,
    });

    // Add your new handler
    registry.register({
        opCode: 0xXXX,                    // Your message ID
        name: 'My new message',           // Human-readable name
        handler: handleMyNewMessage,
    });

    return registry;
}
```

## Complete Example

Here's a complete handler based on `handleOpenCommChannel.ts`:

```typescript
import { BytableMessage } from '@rustymotors/binary';
import {
    getServerLogger,
    RawMessage,
    Serializable,
    ServerLogger,
    databaseProvider,
} from 'rusty-motors-shared';

/**
 * Handles PT_OPEN_COMM_CHANNEL (0x106).
 * Opens a communication channel for the client.
 */
export async function handleOpenCommChannel({
    connectionId,
    message,
    log = getServerLogger('lobby.handleOpenCommChannel'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: BytableMessage[];
}> {
    try {
        log.debug(`[${connectionId}] Handling NPS_OPEN_COMM_CHANNEL`);

        // Parse incoming message
        const incomingRequest = new BytableMessage();
        incomingRequest.setSerializeOrder([
            { name: 'commId', field: 'Dword' },
            { name: 'riffName', field: 'String' },
            { name: 'slotNumber', field: 'Dword' },
            { name: 'slotFlags', field: 'Dword' },
        ]);
        incomingRequest.deserialize(message.serialize());

        // Extract values
        const commIdBuffer = incomingRequest.getFieldValueByName('commId') as Buffer;
        const commId = commIdBuffer.readInt32BE();

        const port = Number.parseInt(connectionId.split(':')[1] ?? '7003');

        // Build response
        const response = new BytableMessage(0);
        response.setSerializeOrder([
            { name: 'commId', field: 'Dword' },
            { name: 'port', field: 'Dword' },
        ]);
        response.header.setId(0x214);
        response.setFieldValueByName('commId', commId);
        response.setFieldValueByName('port', port);

        // Wrap in final packet
        const packetResult = new BytableMessage();
        packetResult.setSerializeOrder([{ name: 'data', field: 'Buffer' }]);
        packetResult.setVersion(0);
        packetResult.deserialize(response.serialize());

        return {
            connectionId,
            messages: [packetResult],
        };
    } catch (error) {
        const err = new Error(
            `[${connectionId}] Error handling NPS_OPEN_COMM_CHANNEL: ${String(error)}`
        );
        err.cause = error;
        throw err;
    }
}
```

## Handler Types Reference

### Handler Arguments

```typescript
interface LobbyHandlerArgs {
    connectionId: string;      // Format: "uuid:port"
    message: BytableMessage;   // Parsed incoming message
    log?: ServerLogger;        // Optional logger instance
}
```

### Handler Result

```typescript
interface LobbyHandlerResult {
    connectionId: string;      // Same as input
    messages: BytableBuffer[]; // Array of response messages
}
```

### Context Types (for advanced handlers)

```typescript
interface HandlerContext {
    connectionId: string;
    port: number;
    log: ServerLogger;
}

interface HandlerContextWithServices extends HandlerContext {
    services: {
        sessionStore: ISessionStore;
        gameDataStore: IGameDataStore;
        authStore: IAuthStore;
        getEncryptionState: () => State;
    };
}
```

## Accessing Database

Use the `databaseProvider` singleton for database access:

```typescript
import { databaseProvider } from 'rusty-motors-shared';

// Session store - runtime connection state
const sessionStore = databaseProvider.getSessionStore();
const user = await sessionStore.getUser(userId);
const connectionId = await sessionStore.findUserByConnectionId(connId);

// Game data store - persistent game data
const gameDataStore = databaseProvider.getGameDataStore();
const vehicles = await gameDataStore.getVehicles(playerId);

// Auth store - authentication and local cache
const authStore = databaseProvider.getAuthStore();
const credentials = await authStore.validateCredentials(username, password);
```

## Error Handling

Wrap handler logic in try/catch and re-throw with context:

```typescript
try {
    // Handler logic
} catch (error) {
    const err = new Error(
        `[${connectionId}] Error handling MESSAGE_NAME: ${String(error)}`
    );
    err.cause = error;
    throw err;
}
```

For more structured errors, use `HandlerError`:

```typescript
import { HandlerError } from 'rusty-motors-shared';

throw new HandlerError(
    'User not found',
    'VALIDATION_ERROR',
    connectionId,
    originalError
);
```

## Testing Handlers

### Unit Testing

Create tests using Vitest with mock context:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { handleMyNewMessage } from './handleMyNewMessage.js';
import { BytableMessage } from '@rustymotors/binary';

describe('handleMyNewMessage', () => {
    it('should process valid message', async () => {
        // Create test message
        const message = new BytableMessage(0);
        message.setSerializeOrder([
            { name: 'userId', field: 'Dword' },
        ]);
        message.header.setId(0xXXX);
        message.setFieldValueByName('userId', 12345);

        // Mock logger
        const log = {
            debug: vi.fn(),
            error: vi.fn(),
        };

        // Call handler
        const result = await handleMyNewMessage({
            connectionId: 'test-uuid:7003',
            message,
            log,
        });

        // Assertions
        expect(result.connectionId).toBe('test-uuid:7003');
        expect(result.messages).toHaveLength(1);
    });
});
```

### Session Replay Testing

Record live traffic for replay testing:

```bash
# Enable session recording
RECORD_SESSIONS=true npm start
```

Sessions are saved to `test/fixtures/sessions/` and can be replayed in tests.

## Service-Specific Notes

### Lobby Service (Port 7003)

- File: `packages/lobby/src/handlers/registry.ts`
- Common messages: User login, channel management, pings

### Authentication Service (Port 8226)

- File: `packages/authentication/src/handlers/registry.ts`
- Common messages: Login, persona selection, logout

### Transactions Service (Port 43300)

- File: `packages/transactions/src/handlers/registry.ts`
- Uses MCOTS protocol (different header format)
- Common messages: Player info, vehicle purchases

## Checklist for New Handlers

- [ ] Create handler file in `packages/<service>/src/handlers/`
- [ ] Define incoming message structure with `setSerializeOrder()`
- [ ] Implement business logic with proper error handling
- [ ] Build response message(s) with correct message ID
- [ ] Register handler in service registry with opCode
- [ ] Add unit tests
- [ ] Update message ID documentation if applicable

## See Also

- [Packet Serialization](../protocol/PACKET_SERIALIZATION.md) - Binary protocol details
- [CLAUDE.md](../../CLAUDE.md) - Project overview and commands
