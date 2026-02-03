# Session Recording & Replay System

## Overview

A system to record real client connection sessions and replay them as test fixtures, eliminating the need to use the old client for most testing.

## Quick Start

### 1. Record a Session

```bash
# Enable recording
RECORD_SESSIONS=true npm start

# Connect with your client and perform actions
# Sessions automatically save to test/fixtures/sessions/ when connections end
```

### 2. Use in Tests

```typescript
import { SessionReplayer } from 'rusty-motors-gateway/session';

const replayer = new SessionReplayer(logger);
const session = replayer.loadSession('session_abc123_2024-01-01T12-00-00.json');

// Replay the session
await replayer.replaySession(session, {
    onConnect: async (port, connectionId) => { /* setup */ },
    onDataIn: async (port, connectionId, data) => { /* process */ },
    onDisconnect: async (port, connectionId) => { /* cleanup */ },
});
```

## What Gets Recorded

- **Connection events**: Port, connection ID, remote address, timestamp
- **Incoming data**: All data received from client (as hex strings)
- **Outgoing data**: All data sent to client (as hex strings)
- **Disconnect events**: When connections close
- **Error events**: Any errors during the session
- **Timing**: Timestamps for all events

## Session File Format

Sessions are saved as JSON:

```json
{
  "metadata": {
    "recordedAt": "2024-01-01T12:00:00.000Z",
    "recordedBy": "SessionRecorder",
    "description": "Auto-saved on disconnect",
    "ports": [7003],
    "connectionIds": ["abc123:7003"]
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
    }
  ]
}
```

## Integration

The recorder is automatically integrated into:
- ✅ `onSocketConnection()` - Records connection start
- ✅ `npsPortRouter()` - Records data in/out
- ✅ Socket disconnect handlers - Records disconnect and auto-saves

**No code changes needed** - just set `RECORD_SESSIONS=true`!

## Benefits

1. **Test without client**: Run tests without the old client
2. **Reproducible**: Same session always produces same results
3. **CI/CD friendly**: No external dependencies
4. **Fast**: Instant replay vs waiting for real client
5. **Regression testing**: Compare responses to ensure nothing broke
6. **Documentation**: Sessions document actual client behavior

## Example Workflow

1. **Record**:
   ```bash
   RECORD_SESSIONS=true npm start
   # Connect client, login, play, disconnect
   ```

2. **Review**:
   ```bash
   cat test/fixtures/sessions/session_*.json | jq '.metadata'
   ```

3. **Test**:
   ```typescript
   it('should handle login', async () => {
       const session = replayer.loadSession('session_login.json');
       // ... test code
   });
   ```

4. **Run tests**:
   ```bash
   npm test
   # No client needed!
   ```

## Files Created

- `packages/gateway/src/session/SessionRecorder.ts` - Recording implementation
- `packages/gateway/src/session/SessionReplayer.ts` - Replay implementation
- `packages/gateway/src/session/SessionRecorderIntegration.ts` - Integration helpers
- `packages/gateway/test/session/SessionRecorder.test.ts` - Tests
- `packages/gateway/test/session/integration.example.test.ts` - Usage examples

## Next Steps

1. Run server with `RECORD_SESSIONS=true`
2. Connect with client and record a session
3. Review the generated session file
4. Create tests using the recorded session
5. Run tests without needing the client

See `packages/gateway/src/session/README.md` for detailed API documentation.
