# Session Recording System

## Quick Start

### Recording a Session

1. **Enable recording via environment variable**:
   ```bash
   RECORD_SESSIONS=true npm start
   ```

2. **Connect with your client** and perform the actions you want to record

3. **Sessions auto-save** when connections disconnect to:
   ```
   test/fixtures/sessions/session_<connectionId>_<timestamp>.json
   ```

### Using Recorded Sessions in Tests

```typescript
import { SessionReplayer } from 'rusty-motors-gateway/session';
import { describe, it, expect } from 'vitest';

describe('Client Session Tests', () => {
    it('should replay login flow', async () => {
        const replayer = new SessionReplayer(logger);
        const session = replayer.loadSession('session_abc123_2024-01-01T12-00-00.json');
        
        // Replay the session
        const result = await replayer.replaySession(session, {
            onConnect: async (port, connectionId) => {
                // Setup connection
            },
            onDataIn: async (port, connectionId, data) => {
                // Process incoming data - call your handlers
            },
            onDisconnect: async (port, connectionId) => {
                // Cleanup
            },
        });
        
        expect(result.success).toBe(true);
    });
});
```

## Features

- ✅ **Automatic recording** when `RECORD_SESSIONS=true`
- ✅ **Auto-save on disconnect** - no manual save needed
- ✅ **Complete session capture** - all data in/out, timing, errors
- ✅ **Easy replay** - replay sessions in tests without the client
- ✅ **Timing support** - replay with original timing or instant
- ✅ **Response validation** - compare server responses with recorded ones

## Integration

The recorder is automatically integrated into:
- Connection handlers (`onSocketConnection`) - Game ports (8226, 7003, etc.)
- NPS port router (data in/out) - Game protocol traffic
- Web server handler (`processHttpRequest`) - HTTP traffic on port 3000
- MCOTS port router (when integrated) - Transaction server traffic
- Disconnect handlers - All connection types

No code changes needed - just set the environment variable!

**Note**: Web traffic (port 3000) is now recorded! See `WEB_TRAFFIC_RECORDING.md` for details.

## File Format

Sessions are saved as JSON with:
- Metadata (timestamp, ports, connection IDs)
- Event array (connect, data_in, data_out, disconnect, error)
- All data as hex strings for easy inspection

See `packages/gateway/src/session/README.md` for full documentation.
