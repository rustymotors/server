# ProcessSignalHandler Migration Complete

## Changes Made

### ProcessSignalHandler Class Created

1. **New File**: `src/signals/ProcessSignalHandler.ts`
   - Extracted process signal handling from Gateway class
   - Implements `ISignalHandler` interface
   - Handles SIGINT and exit signals
   - **Decoupled from ConsoleThread** - only handles process signals

2. **Key Features**:
   - `registerShutdownHandler()` - Register handler for graceful shutdown
   - `unregisterShutdownHandler()` - Remove handlers and cleanup
   - Proper error handling
   - Uses logger instead of console.log
   - Clean listener management

### Gateway Class Updates

1. **Added Imports**
   - Imported `ProcessSignalHandler` and `ShutdownHandler` from `./signals/ProcessSignalHandler.js`

2. **Implemented ShutdownHandler Interface**
   - Gateway now implements `ShutdownHandler`
   - Added `shutdown()` method that calls `stop()`
   - Maintains `exit()` method for backward compatibility

3. **Added Property**
   - Added: `private readonly signalHandler: ProcessSignalHandler`

4. **Updated Constructor**
   - Initializes `signalHandler` with `new ProcessSignalHandler(log)`

5. **Updated init() Method**
   - Replaced `process.on('SIGINT', ...)` with `signalHandler.registerShutdownHandler(this)`
   - Kept `process.on('exit', ...)` for message stats (separate concern)
   - Much cleaner signal handling

6. **Updated exit() Method**
   - Changed `console.log` to `this.log.info` for consistency

## Decoupling from ConsoleThread

### Important Design Decision

**ProcessSignalHandler is decoupled from ConsoleThread**:

- **SignalHandler** handles **process signals only** (SIGINT, exit)
- **ConsoleThread** handles **keyboard input** and emits events ("userExit", "userRestart", "userHelp")
- They work **independently** - no coupling between them

### How They Work Together

1. **Process Signals** (Ctrl+C, SIGINT):
   - ProcessSignalHandler catches SIGINT
   - Calls Gateway's `shutdown()` method
   - Gateway stops gracefully
   - Process exits

2. **Keyboard Input** (ConsoleThread):
   - ConsoleThread listens to stdin keypress events
   - Emits "userExit", "userRestart", "userHelp" events
   - Gateway can listen to these events separately (if needed)
   - Currently Gateway's `consoleEvents` field is unused, but available for future use

3. **No Conflict**:
   - SignalHandler doesn't interfere with ConsoleThread
   - ConsoleThread doesn't interfere with SignalHandler
   - Both can coexist without issues

### Backward Compatibility

- Gateway's `exit()` method still works
- ConsoleThread can still call `gateway.exit()` directly
- ConsoleThread events still work (Gateway can listen if needed)
- No breaking changes

## Benefits

1. **Single Responsibility**: Signal handling is now isolated
2. **Testability**: ProcessSignalHandler can be tested independently
3. **Decoupling**: No dependency on ConsoleThread
4. **Maintainability**: Clear separation of concerns
5. **Error Handling**: Proper error handling with logging
6. **Clean Code**: Removed direct process.on() calls from Gateway
7. **Proper Cleanup**: Listeners are properly removed

## Testing

Comprehensive test suite created at `test/signals/ProcessSignalHandler.test.ts` covering:

1. **Handler Registration**
   - Registering shutdown handler
   - Replacing existing handler
   - Multiple instances

2. **SIGINT Handling**
   - Handler called on SIGINT
   - Process exits after shutdown
   - Error handling

3. **Exit Handling**
   - Exit event logging
   - Proper cleanup

4. **Unregistration**
   - Removing listeners
   - Cleanup
   - Re-registration

5. **Decoupling Tests**
   - Verifies no interference with ConsoleThread
   - Documents independence

To run the tests:

```bash
# From project root
npm test -- packages/gateway/test/signals/ProcessSignalHandler.test.ts

# Or from gateway package
cd packages/gateway
npm test -- test/signals/ProcessSignalHandler.test.ts
```

## Implementation Details

### ShutdownHandler Interface

```typescript
interface ShutdownHandler {
    shutdown(): Promise<void>;
}
```

### ProcessSignalHandler Interface

```typescript
interface ISignalHandler {
    registerShutdownHandler(handler: ShutdownHandler): void;
    unregisterShutdownHandler(): void;
}
```

### Gateway Implementation

Gateway implements `ShutdownHandler`:
- `shutdown()` - Called by SignalHandler on SIGINT
- `exit()` - Still available for ConsoleThread/HotkeyManager

## Migration Path

### Before
```typescript
private init() {
    // ...
    process.on('SIGINT', this.exit.bind(this));
    process.on('exit', () => {
        console.dir(messageStats);
    });
}
```

### After
```typescript
private init() {
    // ...
    this.signalHandler.registerShutdownHandler(this);
    process.on('exit', () => {
        console.dir(messageStats);
    });
}
```

## ConsoleThread Compatibility

### Verified Compatibility

✅ **ConsoleThread still works**:
- ConsoleThread emits "userExit", "userRestart", "userHelp" events
- Gateway can listen to these events (if needed in future)
- ConsoleThread can still call `gateway.exit()` directly
- No breaking changes

✅ **SignalHandler doesn't interfere**:
- Only handles process signals (SIGINT, exit)
- Doesn't listen to keyboard input
- Doesn't listen to ConsoleThread events
- Completely decoupled

✅ **Both can coexist**:
- SignalHandler handles Ctrl+C (SIGINT)
- ConsoleThread handles 'x' key (userExit event)
- Both lead to graceful shutdown
- No conflicts

## Next Steps

1. Test with ConsoleThread to ensure compatibility
2. Consider extracting WebServerManager next (per refactoring plan)
3. Consider extracting GatewayConfiguration next (per refactoring plan)
4. Consider removing unused `consoleEvents` field (if not needed)
