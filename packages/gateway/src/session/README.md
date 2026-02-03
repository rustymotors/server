# Session Recording and Replay System

This system allows you to record real client connection sessions and replay them as test fixtures, minimizing the need to use the actual old client for testing.

## Overview

The session recording system captures:
- Connection events (connect, disconnect)
- Incoming data from client (data_in)
- Outgoing data to client (data_out)
- Timing information
- Error events

Recorded sessions are saved as JSON files that can be replayed in tests.

## Usage

### Recording Sessions

#### Option 1: Environment Variable

Set the `RECORD_SESSIONS` environment variable to enable recording:

```bash
RECORD_SESSIONS=true npm start
```

Sessions will be automatically saved to `test/fixtures/sessions/` when connections end.

#### Option 2: Programmatic Control

```typescript
import { 
    initializeSessionRecorder, 
    setRecordingEnabled,
    saveAllSessions 
} from 'rusty-motors-gateway/session';

// Initialize recorder (typically in Gateway constructor or startup)
const recorder = initializeSessionRecorder(logger, 'test/fixtures/sessions');

// Enable recording
setRecordingEnabled(true);

// ... run your server and connect with client ...

// Save all sessions
const savedFiles = saveAllSessions('Client login flow test');
console.log(`Saved ${savedFiles.length} sessions`);
```

### Replaying Sessions in Tests

```typescript
import { SessionReplayer } from 'rusty-motors-gateway/session';
import { describe, it, expect } from 'vitest';

describe('Login Flow', () => {
    it('should handle recorded login session', async () => {
        const replayer = new SessionReplayer(logger);
        const session = replayer.loadSession('session_test-123_2024-01-01T12-00-00.json');
        
        expect(session).toBeDefined();
        
        // Replay the session
        const result = await replayer.replaySession(session, {
            onConnect: async (port, connectionId) => {
                // Simulate connection setup
            },
            onDataIn: async (port, connectionId, data) => {
                // Process incoming data
                // This would call your actual message handlers
            },
            onDisconnect: async (port, connectionId) => {
                // Cleanup
            },
        }, {
            validateResponses: true,
            useTimings: false, // Set to true to replay with original timing
        });
        
        expect(result.success).toBe(true);
        expect(result.eventsProcessed).toBeGreaterThan(0);
    });
});
```

### Quick Data Extraction

For simple tests that just need the data packets:

```typescript
const replayer = new SessionReplayer(logger);
const session = replayer.loadSession('session_test-123.json');

// Extract just the data_in events
const dataEvents = replayer.extractDataInEvents(session);

// Use the data directly
for (const event of dataEvents) {
    await processMessage(event.port, event.connectionId, event.data);
}
```

## Session File Format

Sessions are saved as JSON with the following structure:

```json
{
  "metadata": {
    "recordedAt": "2024-01-01T12:00:00.000Z",
    "recordedBy": "SessionRecorder",
    "description": "Client login flow",
    "ports": [7003, 8226],
    "connectionIds": ["abc123:7003", "abc123:8226"]
  },
  "events": [
    {
      "timestamp": 1704110400000,
      "type": "connect",
      "port": 7003,
      "connectionId": "abc123:7003",
      "remoteAddress": "127.0.0.1"
    },
    {
      "timestamp": 1704110400100,
      "type": "data_in",
      "port": 7003,
      "connectionId": "abc123:7003",
      "data": "02030004..."
    },
    {
      "timestamp": 1704110400200,
      "type": "data_out",
      "port": 7003,
      "connectionId": "abc123:7003",
      "data": "02030005..."
    },
    {
      "timestamp": 1704110400300,
      "type": "disconnect",
      "port": 7003,
      "connectionId": "abc123:7003"
    }
  ]
}
```

## Integration Points

The recorder is automatically integrated into:
- `onSocketConnection()` - Records connection start
- `npsPortRouter()` - Records data in/out (when integrated)
- `mcotsPortRouter()` - Records data in/out (when integrated)
- Socket end/error handlers - Records disconnect

## Best Practices

1. **Record representative sessions**: Capture typical user flows (login, gameplay, etc.)
2. **Name sessions descriptively**: Use meaningful descriptions when saving
3. **Version control fixtures**: Commit session files to git for regression testing
4. **Keep sessions focused**: Record one flow per session for easier testing
5. **Validate responses**: Use `validateResponses: true` to ensure server behavior hasn't changed

## Example Workflow

1. **Record a session**:
   ```bash
   RECORD_SESSIONS=true npm start
   # Connect with client, perform actions
   # Sessions auto-save on disconnect
   ```

2. **Review recorded session**:
   ```bash
   cat test/fixtures/sessions/session_*.json | jq '.metadata'
   ```

3. **Create test**:
   ```typescript
   it('should handle login', async () => {
       const session = replayer.loadSession('session_login_flow.json');
       // ... test implementation
   });
   ```

4. **Run tests without client**:
   ```bash
   npm test
   ```

## Benefits

- ✅ Test without needing the old client
- ✅ Reproducible test scenarios
- ✅ Regression testing
- ✅ CI/CD friendly
- ✅ Faster development cycles
- ✅ Can replay with original timing or instant replay
