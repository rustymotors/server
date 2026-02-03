# Testing Against Recorded Sessions

## Overview

You can now test the server against recorded client sessions without needing the actual client!

## Step 1: Record a Session

```bash
RECORD_SESSIONS=true npm start
# Connect with client, perform actions, disconnect
# Sessions auto-save to test/fixtures/sessions/
```

## Step 2: Write a Test

Create a test file (e.g., `packages/gateway/test/session/myTest.test.ts`):

```typescript
import { describe, it, expect } from "vitest";
import { SessionTestHelper } from "./SessionTestHelper.js";
import { getServerLogger } from "rusty-motors-shared";

describe("My Session Tests", () => {
    const helper = new SessionTestHelper(
        getServerLogger("test"),
        "test/fixtures/sessions"
    );

    it("should handle login session", async () => {
        const result = await helper.loadAndReplay(
            "session_e6f0c563_7003_2026-01-10T21-43-37.json"
        );

        expect(result).not.toBeNull();
        expect(result?.success).toBe(true);
        expect(result?.eventsProcessed).toBeGreaterThan(0);
        expect(result?.capturedResponses.length).toBeGreaterThan(0);
    });
});
```

## Step 3: Run Tests

```bash
# Run all session tests
npm test -- packages/gateway/test/session

# Run specific test file
npm test -- sessionReplay.test.ts
```

## What Gets Tested

- ✅ **All message handlers** - Login, Lobby, Persona, Chat, etc.
- ✅ **Response generation** - Server creates correct responses
- ✅ **Error handling** - Handles invalid data gracefully
- ✅ **State management** - Connection state is maintained
- ✅ **Message routing** - Messages go to correct handlers

## Response Validation

Compare server responses with recorded ones:

```typescript
const result = await helper.loadAndReplay(sessionFile, {
    validateResponses: true,
});

if (result.responseMismatches?.length > 0) {
    // Server behavior changed!
    result.responseMismatches.forEach((mismatch) => {
        console.log(`Mismatch at event ${mismatch.eventIndex}`);
        console.log(`Expected: ${mismatch.expected.substring(0, 50)}...`);
        console.log(`Actual:   ${mismatch.actual.substring(0, 50)}...`);
    });
}
```

## Available Session Files

Check what sessions you have:

```typescript
const replayer = helper["replayer"];
const sessions = replayer.listSessions();
console.log(`Available sessions: ${sessions.join(", ")}`);
```

## Example: Testing All Recorded Sessions

```typescript
describe("All Recorded Sessions", () => {
    const helper = new SessionTestHelper();
    const replayer = helper["replayer"];
    
    const sessions = replayer.listSessions();
    
    sessions.forEach((sessionFile) => {
        it(`should replay ${sessionFile}`, async () => {
            const result = await helper.loadAndReplay(sessionFile);
            expect(result?.success).toBe(true);
        });
    });
});
```

## Benefits

1. **No client needed** - Test without the old client
2. **Fast** - Instant replay vs waiting for real client
3. **Reproducible** - Same session always produces same results
4. **CI/CD friendly** - Can run in automated pipelines
5. **Regression testing** - Catch breaking changes

## Files

- `SessionTestHelper.ts` - Main helper class
- `sessionReplay.test.ts` - Example tests
- `README.md` - Detailed documentation

## Next Steps

1. Record more sessions for different scenarios
2. Add tests for specific flows
3. Use in CI/CD pipeline
4. Compare responses to catch regressions
