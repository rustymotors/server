# ServerLifecycleManager Implementation

## Files Created

### Implementation
- `src/lifecycle/ServerLifecycleManager.ts` - The lifecycle manager implementation

### Tests
- `test/lifecycle/ServerLifecycleManager.test.ts` - Comprehensive test suite

## Test Coverage

The test suite covers:

1. **Initialization**
   - ✅ Initializes with STOPPED status
   - ✅ Logs status changes

2. **Status Management**
   - ✅ getStatus() returns current status
   - ✅ setStatus() updates status
   - ✅ setStatus() logs transitions

3. **Status Checks**
   - ✅ isRunning() returns true only for RUNNING
   - ✅ canStart() returns true only for STOPPED
   - ✅ canStop() returns true only for RUNNING

4. **Status Transitions**
   - ✅ STOPPED → STARTING
   - ✅ STARTING → RUNNING
   - ✅ RUNNING → STOPPING
   - ✅ STOPPING → STOPPED
   - ✅ RUNNING → RESTARTING
   - ✅ RESTARTING → STOPPED

5. **Multiple Instances**
   - ✅ Independent state for multiple instances

## Running Tests

To run the tests:

```bash
# From project root
npm test -- packages/gateway/test/lifecycle/ServerLifecycleManager.test.ts

# Or from gateway package
cd packages/gateway
npm test -- test/lifecycle/ServerLifecycleManager.test.ts
```

## Implementation Details

### ServerStatus Enum
- `STOPPED` - Server is not running
- `STARTING` - Server is starting up
- `RUNNING` - Server is active
- `STOPPING` - Server is shutting down
- `RESTARTING` - Server is restarting

### LifecycleManager Interface
Provides a clean contract for lifecycle management:
- `getStatus()` - Get current status
- `setStatus()` - Set new status
- `isRunning()` - Check if running
- `canStart()` - Check if can start
- `canStop()` - Check if can stop

### ServerLifecycleManager Class
- Manages server state with type safety
- Logs all status transitions
- Provides validation methods for operations
- Thread-safe (each instance has its own state)

## Usage Example

```typescript
import { ServerLifecycleManager, ServerStatus } from './lifecycle/ServerLifecycleManager.js';
import { getServerLogger } from 'rusty-motors-shared';

const logger = getServerLogger('MyServer');
const lifecycle = new ServerLifecycleManager(logger);

// Check if we can start
if (lifecycle.canStart()) {
    lifecycle.setStatus(ServerStatus.STARTING);
    // ... start server ...
    lifecycle.setStatus(ServerStatus.RUNNING);
}

// Check if running
if (lifecycle.isRunning()) {
    // Server is active
}

// Stop server
if (lifecycle.canStop()) {
    lifecycle.setStatus(ServerStatus.STOPPING);
    // ... stop server ...
    lifecycle.setStatus(ServerStatus.STOPPED);
}
```

## Next Steps

This implementation is ready for integration into the Gateway class refactoring. The tests provide regression protection to ensure the lifecycle management continues to work correctly as the Gateway class is refactored.
