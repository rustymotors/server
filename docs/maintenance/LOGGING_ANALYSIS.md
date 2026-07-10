# Logging Analysis & Improvement Recommendations

## Current State

### Centralized Logger ✅

- **Location**: `packages/shared/getServerLogger.ts`
- **Implementation**: Winston-based logger with singleton pattern
- **Interface**: `ServerLogger` type exported from `packages/shared/src/types.ts`
- **Usage Pattern**: `getServerLogger(name?: string): ServerLogger`

### Current Features

1. **Log Levels**: `error`, `warn`, `info`, `verbose` (with deprecated `debug`/`trace`)
2. **Transports**:
   - Console (colorized, simple format)
   - DailyRotateFile (hourly rotation, 14-day retention, 20MB max size)
3. **Configuration**: Environment variables `MCO_LOG_LEVEL` or `LOG_LEVEL`
4. **Child Loggers**: Supports named child loggers via `logger.child({ defaultMeta: { name } })`

### Current Issues

#### 1. Inconsistent Usage ⚠️

**Problem**: Mix of patterns across codebase

- Some functions accept `log?: ServerLogger` parameter (dependency injection)
- Some functions call `getServerLogger()` directly (tight coupling)
- Some places still use `console.log/error/warn` (bypasses logging system)

**Examples of console.* usage** (from QUICK_WINS.md):

- `packages/gateway/src/HotkeyManager.ts` (lines 25, 47, 54-57, 61, 65)
- `packages/gateway/src/mcotsPortRouter.ts:209`
- `packages/gateway/src/GatewayServer.ts:185, 268`
- `packages/gateway/src/portRouters.ts:38`
- `packages/nps/gameMessageProcessors/processGameLogin.ts:202`

**Impact**:

- Logs bypass rotation, formatting, and centralized configuration
- Inconsistent log format
- Harder to filter/search logs
- Missing structured metadata

#### 2. Singleton Pattern Limitations ⚠️

**Problem**: Global logger instance created on first call

```typescript
let loggerInstance: winston.Logger | undefined = undefined;
```

**Issues**:

- Hard to test (global state)
- Configuration can't be changed after initialization
- No way to replace logger for testing
- Child logger creation has bug (line 13 returns same logger regardless of name)

**Bug in getServerLogger.ts:13**:

```typescript
return wrapLogger(loggerInstance.child({ defaultMeta: { name } }));
// Should be: return wrapLogger(loggerInstance.child({ defaultMeta: { name: name || 'core' } }));
```

#### 3. Limited Structured Logging ⚠️

**Problem**: Using `winston.format.simple()` which doesn't support structured data well

**Current**:

```typescript
format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
),
```

**Impact**:

- Can't easily parse logs programmatically
- Hard to search/filter by metadata
- No JSON output option for log aggregation tools
- Missing correlation IDs for request tracing

#### 4. Type Inconsistency ⚠️

**Problem**: `Configuration.ts` imports `Logger` from `pino` but actual logger is Winston

```typescript
import type { Logger } from "pino";
```

**Impact**: Type confusion, potential runtime issues

#### 5. No Request/Correlation IDs ⚠️

**Problem**: No way to trace requests across services/components

**Impact**:

- Can't correlate logs from same request/connection
- Hard to debug distributed operations
- No request tracing

#### 6. No Log Context/Scoping ⚠️

**Problem**: No way to add contextual metadata that persists across function calls

**Impact**:

- Have to pass connectionId, userId, etc. to every log call
- Easy to forget context
- Verbose logging code

## Improvement Recommendations

### Priority 1: Quick Wins (Low Effort, High Value)

#### 1.1 Replace console.* with Logger

**Effort**: Low  
**Value**: High  
**Action**: Replace all `console.log/error/warn` with appropriate logger methods

**Files to fix** (from QUICK_WINS.md):

- `packages/gateway/src/HotkeyManager.ts`
- `packages/gateway/src/mcotsPortRouter.ts`
- `packages/gateway/src/GatewayServer.ts`
- `packages/gateway/src/portRouters.ts`
- `packages/nps/gameMessageProcessors/processGameLogin.ts`

#### 1.2 Fix getServerLogger Bug

**Effort**: Low  
**Value**: Medium  
**Action**: Fix line 13 to properly use the name parameter

```typescript
// Current (buggy):
return wrapLogger(loggerInstance.child({ defaultMeta: { name } }));

// Fixed:
return wrapLogger(loggerInstance.child({ defaultMeta: { name: name || 'core' } }));
```

#### 1.3 Add JSON Format Option

**Effort**: Low  
**Value**: High  
**Action**: Add JSON format transport for production environments

```typescript
const format = process.env['LOG_FORMAT'] === 'json'
    ? winston.format.json()
    : winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
      );
```

### Priority 2: Medium-Term Improvements

#### 2.1 Structured Logging with Metadata

**Effort**: Medium  
**Value**: High  
**Action**: Use Winston's structured logging capabilities

**Example**:

```typescript
log.info('Connection established', {
    connectionId: 'abc123',
    port: 8228,
    remoteAddress: '192.168.1.1',
});
```

**Benefits**:

- Easy to search/filter logs
- Better log aggregation tool support
- Programmatic log analysis

#### 2.2 Request Correlation IDs

**Effort**: Medium  
**Value**: High  
**Action**: Add correlation ID to log context

**Implementation Options**:

1. **AsyncLocalStorage** (Node.js 12.17+): Automatic context propagation
2. **Explicit parameter**: Pass correlationId to functions
3. **Logger child with context**: Create child logger with correlation ID

**Example with AsyncLocalStorage**:

```typescript
import { AsyncLocalStorage } from 'async_hooks';

const correlationContext = new AsyncLocalStorage<string>();

// In request handler:
correlationContext.run(correlationId, () => {
    // All logs in this context automatically include correlationId
});

// In logger wrapper:
const correlationId = correlationContext.getStore();
if (correlationId) {
    logger = logger.child({ correlationId });
}
```

#### 2.3 Logger Factory Pattern

**Effort**: Medium  
**Value**: Medium  
**Action**: Replace singleton with factory pattern

**Benefits**:

- Easier testing (can inject mock logger)
- Can create multiple logger instances if needed
- Better configuration management

**Example**:

```typescript
export interface LoggerFactory {
    createLogger(name?: string): ServerLogger;
    configure(options: LoggerConfig): void;
}

export function createLoggerFactory(config?: LoggerConfig): LoggerFactory {
    // Implementation
}
```

### Priority 3: Long-Term Improvements

#### 3.1 Log Context/Scoping

**Effort**: High  
**Value**: High  
**Action**: Implement context-aware logging

**Example API**:

```typescript
// Create scoped logger
const scopedLog = log.withContext({ connectionId: 'abc123', userId: 'user1' });

// All subsequent calls include context
scopedLog.info('Processing request'); // Automatically includes connectionId and userId
```

#### 3.2 Log Sampling for High-Volume Logs

**Effort**: Medium  
**Value**: Medium  
**Action**: Implement sampling for verbose/debug logs

**Use Case**: Connection events, packet processing logs

**Example**:

```typescript
if (shouldSample(logLevel, sampleRate)) {
    log.verbose('Packet received', { packetId });
}
```

#### 3.3 Performance Metrics Logging

**Effort**: High  
**Value**: Medium  
**Action**: Add timing/debugging utilities

**Example**:

```typescript
const timer = log.startTimer();
// ... operation ...
timer.done({ message: 'Operation completed', operation: 'processPacket' });
```

#### 3.4 Standardize Logger Injection Pattern

**Effort**: High  
**Value**: High  
**Action**: Establish consistent pattern for logger usage

**Recommendation**: Always accept logger as optional parameter with default

**Pattern**:

```typescript
export async function processData(
    data: Buffer,
    log: ServerLogger = getServerLogger('processData'),
): Promise<Result> {
    // Implementation
}
```

**Benefits**:

- Testable (can inject mock)
- Flexible (can use child logger)
- Consistent across codebase

## Implementation Plan

### Phase 1: Quick Wins (1-2 days)

1. ✅ Replace all `console.*` with logger
2. ✅ Fix `getServerLogger` bug
3. ✅ Add JSON format option
4. ✅ Update documentation

### Phase 2: Structured Logging (3-5 days)

1. ✅ Update logger format to support structured data
2. ✅ Add correlation ID support (AsyncLocalStorage)
3. ✅ Update high-traffic areas to use structured logging
4. ✅ Add logging guidelines to REFACTORING_GUIDELINES.md

### Phase 3: Advanced Features (1-2 weeks)

1. ✅ Logger factory pattern
2. ✅ Log context/scoping
3. ✅ Performance metrics
4. ✅ Standardize injection pattern

## 12 Factor App Compliance

### Factor 11: Logs
>
> "Treat logs as event streams"

**Current State**: ✅ Partially compliant

- Logs go to stdout (console transport)
- Logs also go to files (DailyRotateFile)
- No structured format for aggregation

**Recommendations**:

1. **Primary output to stdout**: ✅ Already doing this
2. **Structured format**: ⚠️ Add JSON format option
3. **No log file management in app**: ⚠️ Currently managing files (DailyRotateFile)
   - **Recommendation**: Let external tool (logrotate, Docker, etc.) handle rotation
   - Or: Make file logging optional/configurable
4. **Log aggregation**: ⚠️ Add correlation IDs and structured format for better aggregation

## Best Practices Recommendations

### 1. Log Levels

- **error**: System errors, exceptions, failures
- **warn**: Recoverable errors, deprecations, unusual conditions
- **info**: Important business events (login, logout, transactions)
- **verbose**: Debug information, packet details, connection events

### 2. Structured Logging

Always include relevant context:

```typescript
// ❌ Bad
log.info('User logged in');

// ✅ Good
log.info('User logged in', {
    userId: user.id,
    connectionId: connection.id,
    ipAddress: connection.remoteAddress,
});
```

### 3. Error Logging

Always include error details:

```typescript
// ❌ Bad
log.error('Failed to process request');

// ✅ Good
log.error('Failed to process request', {
    error: error.message,
    stack: error.stack,
    connectionId,
    requestId,
});
```

### 4. Performance Logging

Use timers for performance-critical operations:

```typescript
const timer = log.startTimer();
await processData();
timer.done({ message: 'Data processed', recordCount: data.length });
```

## Testing Considerations

### Mock Logger

Create a mock logger for tests:

```typescript
export const createMockLogger = (): ServerLogger => ({
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    verbose: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
});
```

### Logger Injection in Tests

Always inject logger in tests:

```typescript
const mockLogger = createMockLogger();
const result = await processData(data, mockLogger);
expect(mockLogger.error).not.toHaveBeenCalled();
```

## Conclusion

The codebase has a **good foundation** for logging with a centralized Winston-based logger. However, there are **significant opportunities for improvement**:

1. **Immediate**: Replace console.* usage, fix bugs, add JSON format
2. **Short-term**: Add structured logging, correlation IDs
3. **Long-term**: Context-aware logging, performance metrics, standardized patterns

The logging system is **functional but not optimal** for production use at scale. Implementing these improvements will make the system more maintainable, debuggable, and production-ready.
