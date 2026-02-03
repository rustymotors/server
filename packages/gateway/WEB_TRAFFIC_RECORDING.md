# Web Traffic Recording

## Overview

Web traffic recording has been added to the session recording system. **Raw TCP traffic** on port 3000 (web server) is now automatically recorded when `RECORD_SESSIONS=true`, consistent with how other ports are recorded.

## What Gets Recorded

### Raw TCP Data (Port 3000)
- **Incoming TCP data** - Raw bytes received on the socket (includes HTTP requests)
- **Outgoing TCP data** - Raw bytes sent on the socket (includes HTTP responses)
- **Connection events** - Connect, disconnect
- **Connection metadata** - Remote address, port

**Note**: This records the raw TCP stream, not parsed HTTP data. This is cleaner and more consistent with how game protocol ports (8226, 7003, etc.) are recorded.

## Integration

Web traffic recording is integrated into `GatewayServer.start()` in `packages/gateway/src/GatewayServer.ts`:

1. **Session Start**: Each TCP connection on port 3000 gets a unique connection ID (`<uuid>:3000`)
2. **Raw TCP Recording**: Incoming/outgoing TCP data is recorded as raw bytes (same as other ports)
3. **Auto-Save**: Session is automatically saved when the connection disconnects

**Implementation**: The TCP server handler for port 3000 records raw socket data before passing the connection to the HTTP server. This is consistent with how game protocol ports are recorded.

## Usage

### Recording Web Traffic

```bash
RECORD_SESSIONS=true npm start
# Make HTTP requests to the server
# Sessions auto-save to test/fixtures/sessions/
```

### Session File Format

Web traffic sessions are saved in the same format as game protocol sessions:

```json
{
  "metadata": {
    "recordedAt": "2024-01-01T12:00:00.000Z",
    "recordedBy": "SessionRecorder",
    "description": "Auto-saved on disconnect (port 3000)",
    "ports": [3000],
    "connectionIds": ["abc12345:3000"]
  },
  "events": [
    {
      "timestamp": 1704110400000,
      "type": "connect",
      "port": 3000,
      "connectionId": "abc12345:3000",
      "remoteAddress": "127.0.0.1"
    },
    {
      "timestamp": 1704110400100,
      "type": "data_in",
      "port": 3000,
      "connectionId": "abc12345:3000",
      "data": "474554202f53686172644c6973742f20485454502f312e310d0a486f73743a206c6f63616c686f73743a333030300d0a..."
    },
    {
      "timestamp": 1704110400200,
      "type": "data_out",
      "port": 3000,
      "connectionId": "abc12345:3000",
      "data": "485454502f312e3120323030204f4b0d0a436f6e74656e742d547970653a20746578742f786d6c0d0a..."
    },
    {
      "timestamp": 1704110400300,
      "type": "disconnect",
      "port": 3000,
      "connectionId": "abc12345:3000"
    }
  ]
}
```

### Data Format

**Raw TCP Data** (hex-encoded):
- `data_in`: Raw TCP bytes received (includes HTTP request line, headers, body)
- `data_out`: Raw TCP bytes sent (includes HTTP response line, headers, body)

The data is recorded as raw bytes, just like game protocol traffic. This means:
- HTTP requests appear as raw TCP data (e.g., `GET /ShardList/ HTTP/1.1\r\nHost: ...`)
- HTTP responses appear as raw TCP data (e.g., `HTTP/1.1 200 OK\r\nContent-Type: ...`)
- No HTTP parsing needed - it's just raw TCP bytes

## Benefits

1. **Complete Coverage**: Now records both game protocol traffic AND web traffic
2. **Test Web Endpoints**: Can test web endpoints without real client
3. **Reproducible**: Same HTTP requests always produce same results
4. **CI/CD Friendly**: No external dependencies for web endpoint testing

## Recorded Endpoints

The following web endpoints are now recorded:
- `/ShardList/` - Shard list generation
- `/AuthLogin` - Authentication login
- `/cert` - Certificate retrieval
- `/key` - Key retrieval
- `/registry` - Registry information
- `/games/EA_Seattle/MotorCity/*` - Castanet endpoints
- All other routes (404 responses)

## Testing with Recorded Web Sessions

```typescript
import { SessionReplayer } from 'rusty-motors-gateway/session';

const replayer = new SessionReplayer(logger);
const session = replayer.loadSession('session_abc12345_2024-01-01T12-00-00.json');

// Replay the raw TCP connection (same as game protocol sessions)
await replayer.replaySession(session, {
    onConnect: async (port, connectionId) => {
        // Setup TCP connection
    },
    onDataIn: async (port, connectionId, data) => {
        // data contains raw TCP bytes (HTTP request)
        // Can parse as HTTP if needed, or just send raw bytes
    },
    onDataOut: async (port, connectionId, data) => {
        // data contains raw TCP bytes (HTTP response)
        // Can parse as HTTP if needed, or just validate raw bytes
    },
});
```

## Implementation Details

### Connection ID Generation
- Format: `<8-char-uuid>:3000` (same format as other ports)
- Unique per TCP connection
- Allows multiple concurrent connections to be recorded separately

### Raw TCP Recording
- Records raw TCP bytes (same as game protocol ports)
- No HTTP parsing - just raw socket data
- Consistent with how other ports are recorded

### Socket Interception
- Recording happens at the TCP socket level
- Wraps `socket.write()` to capture outgoing data
- Listens to `socket.on('data')` to capture incoming data
- Records before passing to HTTP server

## Benefits of Raw TCP Recording

1. **Consistency**: Same recording approach for all ports (game protocol and web)
2. **Simplicity**: No HTTP parsing needed - just raw bytes
3. **Completeness**: Captures everything (including HTTP framing, headers, body)
4. **Flexibility**: Can replay as raw TCP or parse as HTTP during replay
5. **Protocol Agnostic**: Works for HTTP, HTTPS, or any protocol on port 3000

## Future Enhancements

1. **HTTP Parsing Helper**: Optional helper to parse raw TCP data as HTTP during replay
2. **Streaming Support**: Better handling of chunked HTTP responses
3. **Web-Specific Replayer**: Helper for replaying HTTP requests specifically (parses raw TCP as HTTP)
4. **Response Validation**: Compare responses to ensure web endpoints haven't changed

## Related Documentation

- `SESSION_RECORDING.md` - General session recording guide
- `SESSION_SYSTEM_SUMMARY.md` - Session system overview
- `packages/gateway/src/session/README.md` - Session API documentation
