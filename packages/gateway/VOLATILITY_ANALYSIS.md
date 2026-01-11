# Volatility Analysis for Gateway Package

This document analyzes the volatility (change frequency) of components in the Gateway package to guide further refactoring toward a volatility-based composition taxonomy.

## Volatility Categories

- **High Volatility**: Changes frequently (business logic, protocol handlers, game-specific code)
- **Medium Volatility**: Changes occasionally (infrastructure, integration points, orchestration)
- **Low Volatility**: Rarely changes (interfaces, abstractions, core utilities)

## Current Component Analysis

### Low Volatility (Rarely Changes) ✅

These are stable abstractions that provide the foundation:

1. **`PortRouterRegistry`** (`src/routing/PortRouterRegistry.ts`)
   - **Volatility**: Low
   - **Reason**: Core abstraction for port routing, interface rarely changes
   - **Status**: ✅ Already extracted

2. **`GatewayConfiguration`** (`src/configuration/GatewayConfiguration.ts`)
   - **Volatility**: Low
   - **Reason**: Configuration structure is stable, only values change
   - **Status**: ✅ Already extracted

3. **`ConfigurationProvider`** (in `packages/shared/src/ConfigurationProvider.ts`)
   - **Volatility**: Low
   - **Reason**: Provider pattern is stable infrastructure
   - **Status**: ✅ Already extracted

4. **Interfaces & Types** (`src/types.ts`)
   - **Volatility**: Low
   - **Reason**: Type definitions are stable contracts
   - **Status**: ✅ Already stable

### Medium Volatility (Changes Occasionally) ✅

These are infrastructure components that change with deployment/operational needs:

1. **`NetworkServerManager`** (`src/network/NetworkServerManager.ts`)
   - **Volatility**: Medium
   - **Reason**: Changes with networking needs, but structure is stable
   - **Status**: ✅ Already extracted

2. **`WebServerManager`** (`src/web/WebServerManager.ts`)
   - **Volatility**: Medium
   - **Reason**: Changes with web server needs, but structure is stable
   - **Status**: ✅ Already extracted

3. **`ServerLifecycleManager`** (`src/lifecycle/ServerLifecycleManager.ts`)
   - **Volatility**: Medium
   - **Reason**: Lifecycle logic is stable, but may need new states
   - **Status**: ✅ Already extracted

4. **`ProcessSignalHandler`** (`src/signals/ProcessSignalHandler.ts`)
   - **Volatility**: Medium
   - **Reason**: Signal handling is stable, but may need new signals
   - **Status**: ✅ Already extracted

5. **`SessionRecorder`** (`src/session/SessionRecorder.ts`)
   - **Volatility**: Medium
   - **Reason**: Recording infrastructure is stable, but may need new features
   - **Status**: ✅ Already extracted

### High Volatility (Changes Frequently) ⚠️

These contain business logic and protocol handling that changes often:

1. **`npsPortRouter`** (`src/npsPortRouter.ts`)
   - **Volatility**: High
   - **Reason**: Contains protocol routing logic, message parsing, service calls
   - **Issues**:
     - Large file (~560 lines)
     - Mixes routing logic with protocol handling
     - Contains business logic (which service to call based on port)
     - Directly calls service handlers (`receiveLobbyData`, `receiveLoginData`, etc.)
   - **Refactoring Opportunity**: Extract protocol-specific routing logic

2. **`mcotsPortRouter`** (`src/mcotsPortRouter.ts`)
   - **Volatility**: High
   - **Reason**: Contains transaction server routing logic
   - **Issues**:
     - Similar structure to `npsPortRouter`
     - Contains protocol-specific parsing
     - Directly calls `receiveTransactionsData`
   - **Refactoring Opportunity**: Extract protocol-specific routing logic

3. **`web.ts`** (`src/web.ts`)
   - **Volatility**: High
   - **Reason**: Contains HTTP route handlers, business logic for web endpoints
   - **Issues**:
     - Very large file (~3500+ lines)
     - Mixes HTTP handling with business logic
     - Contains hardcoded data (AuthTickets, URL lists)
     - Route handlers contain business logic
   - **Refactoring Opportunity**: Extract route handlers, business logic

4. **`routeInitialMessage`** (inside `npsPortRouter.ts`)
   - **Volatility**: High
   - **Reason**: Contains business logic for routing messages to services
   - **Issues**:
     - Switch statement with port-specific logic
     - Direct service calls
     - Protocol-specific handling
   - **Refactoring Opportunity**: Extract to protocol router or message router

5. **`handlePacketRouting`** (inside `npsPortRouter.ts`)
   - **Volatility**: High
   - **Reason**: Contains packet parsing and routing logic
   - **Refactoring Opportunity**: Extract to packet router

## Dependency Analysis

### Current Dependency Flow

```
Gateway (Medium)
├── NetworkServerManager (Medium) ✅
├── WebServerManager (Medium) ✅
├── ServerLifecycleManager (Medium) ✅
├── ProcessSignalHandler (Medium) ✅
├── PortRouterRegistry (Low) ✅
├── GatewayConfiguration (Low) ✅
├── npsPortRouter (High) ⚠️
├── mcotsPortRouter (High) ⚠️
└── web.ts handlers (High) ⚠️
```

### Issues

1. **Gateway depends on High Volatility components directly**
   - Gateway imports `npsPortRouter` and `mcotsPortRouter` directly
   - Gateway calls `initializeRouteHandlers(web.ts)` directly
   - This violates volatility principles (stable should not depend on volatile)

2. **High Volatility components contain infrastructure concerns**
   - `npsPortRouter` contains session recording (medium volatility)
   - `npsPortRouter` contains message queue management (medium volatility)
   - Should be separated

## Recommended Refactoring Path

### Phase 1: Extract Protocol Routers (High Priority)

**Goal**: Separate protocol-specific routing from infrastructure

1. **Create `ProtocolRouter` interface** (Low Volatility)
   ```typescript
   interface ProtocolRouter {
       route(port: number, message: BytableMessage, connectionId: string): Promise<SerializableInterface[]>;
   }
   ```

2. **Extract `NPSProtocolRouter`** (High Volatility)
   - Move protocol-specific routing logic from `npsPortRouter`
   - Handles NPS protocol message routing
   - Calls appropriate services based on message type

3. **Extract `MCOTSProtocolRouter`** (High Volatility)
   - Move protocol-specific routing logic from `mcotsPortRouter`
   - Handles MCOTS protocol message routing

4. **Refactor `npsPortRouter` to use `NPSProtocolRouter`**
   - Keep infrastructure concerns (queues, recording, socket handling)
   - Delegate protocol routing to `NPSProtocolRouter`

### Phase 2: Extract Web Route Handlers (High Priority)

**Goal**: Separate HTTP route handlers from web infrastructure

1. **Create route handler modules** (High Volatility)
   - `src/web/handlers/ShardListHandler.ts`
   - `src/web/handlers/AuthLoginHandler.ts`
   - `src/web/handlers/CertHandler.ts`
   - etc.

2. **Extract business logic** (High Volatility)
   - Move hardcoded data to configuration or database
   - Extract complex handlers to separate modules

3. **Keep `web.ts` minimal** (Medium Volatility)
   - Just route registration and HTTP handling
   - Delegate to handler modules

### Phase 3: Create Router Abstraction (Medium Priority)

**Goal**: Abstract port routing to reduce Gateway's dependency on volatile components

1. **Create `PortRouterFactory`** (Low Volatility)
   - Factory pattern for creating port routers
   - Gateway doesn't need to know about specific routers

2. **Update Gateway to use factory**
   - Gateway creates routers via factory
   - Reduces direct dependencies on volatile components

### Phase 4: Organize by Volatility Layers

**Goal**: Create clear boundaries between volatility levels

```
Stable Layer (Low Volatility)
├── PortRouterRegistry (interface)
├── GatewayConfiguration (interface)
├── ConfigurationProvider (interface)
└── Core Types

Infrastructure Layer (Medium Volatility)
├── NetworkServerManager
├── WebServerManager
├── ServerLifecycleManager
├── ProcessSignalHandler
└── SessionRecorder

Business Logic Layer (High Volatility)
├── NPSProtocolRouter
├── MCOTSProtocolRouter
├── Web Route Handlers
└── Protocol-specific logic
```

## Benefits of Volatility-Based Organization

1. **Reduced Change Impact**: Changes to business logic don't affect infrastructure
2. **Easier Testing**: Stable components can be tested independently
3. **Better Maintainability**: Clear boundaries between change frequencies
4. **Scalability**: Easy to add new volatile components without affecting stable infrastructure
5. **Dependency Flow**: Dependencies flow from volatile → stable (correct direction)

## Next Steps

1. **Start with Phase 1**: Extract protocol routers
   - Highest impact (large files, high volatility)
   - Clear separation of concerns
   - Reduces Gateway's dependency on volatile code

2. **Then Phase 2**: Extract web route handlers
   - Large file (3500+ lines)
   - Clear separation possible
   - Makes web.ts more maintainable

3. **Finally Phase 3**: Create router abstraction
   - Completes the volatility-based organization
   - Makes Gateway truly stable

## Metrics

### Current State
- **High Volatility Files**: 3 large files (npsPortRouter, mcotsPortRouter, web.ts)
- **Gateway Dependencies**: Directly depends on 3 high-volatility components
- **File Sizes**: web.ts (~3500 lines), npsPortRouter (~560 lines)

### Target State
- **High Volatility Files**: Many small, focused files
- **Gateway Dependencies**: Only depends on stable/medium-volatility components
- **File Sizes**: All files < 300 lines, single responsibility

## References

- `REFACTORING_GUIDELINES.md` - General refactoring principles
- `GATEWAY_REFACTORING.md` - Original refactoring plan
- Volatility-Based Design principles
