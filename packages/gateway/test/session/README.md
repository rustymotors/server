# Testing Against Recorded Sessions

## Quick Start

```typescript
import { SessionTestHelper } from "./SessionTestHelper.js";
import { describe, it, expect } from "vitest";

describe("Session Replay Tests", () => {
    const helper = new SessionTestHelper();

    it("should replay a recorded session", async () => {
        const result = await helper.loadAndReplay(
            "session_fd922b4f_8226_2026-01-10T21-43-16.json"
        );

        expect(result).not.toBeNull();
        expect(result?.success).toBe(true);
        expect(result?.eventsProcessed).toBeGreaterThan(0);
        expect(result?.capturedResponses.length).toBeGreaterThan(0);
    });
});
```

## Environment Variables

Tests automatically load `.env` from the project root via `vitest.setup.ts`.

If you get errors about missing environment variables:

1. **Check .env file exists** at the project root (`/data/Code/server/.env`)
2. **Required variables** typically include:
   - `DATABASE_URL` - Database connection string
   - `CERTIFICATE_FILE` - Path to certificate file
   - `PRIVATE_KEY_FILE` - Path to private key file
   - `PUBLIC_KEY_FILE` - Path to public key file

3. **Alternative**: Set environment variables directly:
   ```bash
   DATABASE_URL=... CERTIFICATE_FILE=... npm test
   ```

## How It Works

1. **Loads recorded session** - Reads the JSON file with all events
2. **Replays through handlers** - Calls actual `processSocketData()` with recorded data
3. **Captures responses** - Intercepts responses from message queues
4. **Validates** - Optionally compares with recorded responses

## Features

- ✅ Replays through actual server handlers (not mocks)
- ✅ Captures all responses automatically
- ✅ Validates responses against recorded ones
- ✅ Handles all event types (connect, data_in, disconnect)
- ✅ Works with all ports (7003, 8226, 8227, 8228, 9000-9020, etc.)

## Example Tests

See `sessionReplay.test.ts` for complete examples including:
- Login flow (port 7003)
- Persona flow (port 8226)
- Chat flow (port 8227)
- Lobby flow (port 8228)
- Room flow (port 9001)
- Response validation

## Running Tests

```bash
# Run all session replay tests
npm test -- packages/gateway/test/session

# Run specific test
npm test -- sessionReplay.test.ts

# From gateway directory
cd packages/gateway
npm test
```

## Response Validation

Enable response validation to ensure server behavior hasn't changed:

```typescript
const result = await helper.loadAndReplay(sessionFile, {
    validateResponses: true,
});

if (result.responseMismatches?.length > 0) {
    // Server responses differ from recorded session
    console.warn("Responses changed:", result.responseMismatches);
}
```

## Captured Responses

Access the captured responses:

```typescript
const result = await helper.loadAndReplay(sessionFile);

// Get as hex strings
const hexResponses = helper.getCapturedResponsesAsHex();

// Get as buffers
const bufferResponses = helper.getCapturedResponsesAsBuffers();

// Or from result
result.capturedResponses.forEach((response) => {
    console.log(`Response ${response.eventIndex}: ${response.hex}`);
});
```
