# PortRouterRegistry Migration Complete

## Changes Made

### PortRouterRegistry Class Created

1. **New File**: `src/routing/PortRouterRegistry.ts`
   - Extracted port router configuration from Gateway class
   - Implements `IPortRouterRegistry` interface
   - Manages port-to-router mappings
   - Supports single port and port range registration

2. **Key Features**:
   - `registerPort()` - Register a single port with a router
   - `registerPortRange()` - Register a range of ports with the same router
   - `getRouter()` - Retrieve router for a port
   - `getMappings()` - Get all port mappings
   - `clear()` - Clear all registrations
   - Proper validation and error handling

### DefaultPortConfiguration Helper Created

1. **New File**: `src/routing/DefaultPortConfiguration.ts`
   - `createDefaultPortConfiguration()` function
   - Centralizes default port configuration
   - Registers all standard game server ports

### Gateway Class Updates

1. **Added Imports**
   - Imported `PortRouterRegistry` from `./routing/PortRouterRegistry.js`
   - Imported `createDefaultPortConfiguration` from `./routing/DefaultPortConfiguration.js`
   - Changed `addPortRouter` import to `setGlobalPortRouterRegistry`

2. **Added Property**
   - Added: `private readonly portRouterRegistry: PortRouterRegistry`

3. **Updated Constructor**
   - Initializes `portRouterRegistry` with `new PortRouterRegistry()`

4. **Updated init() Method**
   - Replaced hardcoded `addPortRouter()` calls with `createDefaultPortConfiguration()`
   - Calls `setGlobalPortRouterRegistry()` for backward compatibility
   - Much cleaner and more maintainable

### PortRouters Module Updates

1. **Backward Compatibility**
   - Added `setGlobalPortRouterRegistry()` function
   - `getPortRouter()` now checks global registry first
   - `addPortRouter()` syncs with registry if available
   - Maintains existing API for other code

2. **Integration**
   - Global registry syncs to existing portRouters map
   - Existing `getPortRouter()` calls continue to work
   - No breaking changes to external API

## Backward Compatibility

- All existing functionality preserved
- `getPortRouter()` API unchanged
- `addPortRouter()` still works (deprecated but functional)
- Gateway API remains unchanged
- No breaking changes to external interfaces

## Benefits

1. **Single Responsibility**: Port configuration is now isolated
2. **Testability**: PortRouterRegistry can be tested independently
3. **Maintainability**: Clear separation of concerns
4. **Configuration**: Easy to extend with new ports
5. **Type Safety**: Strong typing with interfaces
6. **Validation**: Centralized port validation
7. **Clean Code**: Removed hardcoded port registrations from Gateway

## Testing

Comprehensive test suite created at `test/routing/PortRouterRegistry.test.ts` covering:

1. **Port Registration**
   - Single port registration
   - Multiple ports with different routers
   - Duplicate port detection
   - Invalid port validation

2. **Port Range Registration**
   - Range registration
   - Single port range (start === end)
   - Conflict detection in ranges
   - Invalid range validation

3. **Router Retrieval**
   - Getting registered routers
   - Handling unregistered ports
   - Invalid port validation

4. **Mappings**
   - Getting all mappings
   - Empty registry handling
   - Range mappings

5. **Clear Functionality**
   - Clearing all registrations
   - Re-registration after clear

6. **Integration Scenarios**
   - Default port configuration
   - Mixed single and range registrations

To run the tests:

```bash
# From project root
npm test -- packages/gateway/test/routing/PortRouterRegistry.test.ts

# Or from gateway package
cd packages/gateway
npm test -- test/routing/PortRouterRegistry.test.ts
```

## Implementation Details

### PortRouterRegistry Interface

```typescript
interface IPortRouterRegistry {
    registerPort(port: number, router: PortRouter): void;
    registerPortRange(start: number, end: number, router: PortRouter): void;
    getRouter(port: number): PortRouter | undefined;
    getMappings(): PortMapping[];
    clear(): void;
}
```

### Default Port Configuration

The default configuration registers:
- **NPS Ports**: 8226, 8227, 8228, 7003, 9000-9020, 10001
- **MCOTS Port**: 43300

### Validation

- Port numbers must be integers between 0 and 65535
- Duplicate port registration throws error
- Port range start must be <= end
- All ports in range checked for conflicts before registration

## Migration Path

### Before
```typescript
private init() {
    addPortRouter(8226, npsPortRouter);
    addPortRouter(8227, npsPortRouter);
    // ... many more lines
    for (let port = 9000; port < 9021; port++) {
        addPortRouter(port, npsPortRouter);
    }
    // ...
}
```

### After
```typescript
private init() {
    createDefaultPortConfiguration(
        this.portRouterRegistry,
        npsPortRouter,
        mcotsPortRouter,
    );
    setGlobalPortRouterRegistry(this.portRouterRegistry);
    // ...
}
```

## Next Steps

1. Test with a real client to ensure functionality works correctly
2. Consider extracting SignalHandler next (per refactoring plan)
3. Consider extracting WebServerManager next (per refactoring plan)
4. Consider extracting GatewayConfiguration next (per refactoring plan)
