# Architecture Evaluation: Monoservices vs Volatility-Based Organization

## Current Structure Analysis

### Current Organization: Service-Oriented Monorepo

```
packages/
  gateway/        # Orchestration service
  login/          # Authentication service
  lobby/          # Lobby management service
  transactions/   # Transaction processing service
  persona/        # Persona management service
  nps/            # NPS protocol handlers
  shard/          # Shard server
  cli/            # CLI interface
  database/       # Database layer
  shared/         # Shared utilities
  protocol/       # Protocol definitions

libs/@rustymotors/
  binary/         # Binary serialization
  network/         # Network utilities
  parser/         # Protocol parser
  rooms/          # Room management
```

### Deployment Model Question

**Critical Question**: Are these deployed as:

1. **Monolith**: Single process, all services in one deployment
2. **Microservices**: Separate deployments, inter-service communication
3. **Hybrid**: Some services together, some separate

**Current Evidence**:

- All in one monorepo
- Shared types and utilities
- Direct function calls between services (`receiveLoginData`, `receiveLobbyData`, etc.)
- Single entry points (`src/nps_server.ts`, `src/mcots_server.ts`)

**Assessment**: Appears to be a **monolith** with service-like boundaries for organization.

## Volatility Analysis by Package

### High Volatility (Changes Frequently)

- `packages/nps/` - Protocol handlers, game-specific logic
- `packages/transactions/` - Business logic, game transactions
- `packages/lobby/` - Lobby business logic
- `packages/login/` - Authentication logic
- `packages/persona/` - Persona management logic
- `packages/gateway/src/npsPortRouter.ts` - Protocol routing
- `packages/gateway/src/mcotsPortRouter.ts` - Protocol routing
- `packages/gateway/src/web.ts` - HTTP route handlers

### Medium Volatility (Changes Occasionally)

- `packages/gateway/` (infrastructure parts) - Network/server management
- `packages/database/` - Database layer (schema changes)
- `packages/shared/` (some parts) - Infrastructure utilities

### Low Volatility (Rarely Changes)

- `packages/shared/src/types.ts` - Type definitions
- `packages/protocol/` - Protocol structures (once stable)
- `libs/@rustymotors/binary/` - Core binary manipulation
- `packages/gateway/src/routing/PortRouterRegistry.ts` - Abstractions
- `packages/gateway/src/configuration/` - Configuration interfaces

## Problem: Current Structure Mixes Volatility Levels

### Issue 1: Gateway Package Contains All Volatility Levels

```
packages/gateway/
  src/
    routing/PortRouterRegistry.ts        # Low volatility ✅
    configuration/GatewayConfiguration.ts # Low volatility ✅
    network/NetworkServerManager.ts      # Medium volatility ✅
    lifecycle/ServerLifecycleManager.ts  # Medium volatility ✅
    npsPortRouter.ts                     # High volatility ⚠️
    mcotsPortRouter.ts                   # High volatility ⚠️
    web.ts                               # High volatility ⚠️
```

**Problem**: High-volatility code (protocol handlers) is mixed with low-volatility infrastructure.

### Issue 2: Services Contain Mixed Concerns

```
packages/login/
  src/
    login.ts              # High volatility (business logic)
    receiveLoginData.ts   # High volatility (protocol handling)
    internal.ts           # Medium volatility (infrastructure)
```

**Problem**: Each service package mixes business logic (high volatility) with infrastructure (medium volatility).

### Issue 3: Shared Package Mixes Volatility

```
packages/shared/
  src/
    types.ts              # Low volatility ✅
    Configuration.ts      # Low volatility ✅
    MessageQueue.ts       # Medium volatility ⚠️
    SubThread.ts          # Medium volatility ⚠️
```

**Problem**: Infrastructure utilities mixed with core types.

## Volatility-Based Organization Proposal

### Option A: Pure Volatility-Based (Recommended for Monolith)

```
packages/
  # Low Volatility - Stable Abstractions
  core/
    types/                # Type definitions, interfaces
    protocol/             # Protocol structures (once stable)
    abstractions/         # Core abstractions (PortRouterRegistry, etc.)
  
  # Medium Volatility - Infrastructure
  infrastructure/
    network/             # Network management
    lifecycle/           # Lifecycle management
    database/            # Database layer
    logging/             # Logging infrastructure
    configuration/       # Configuration management
  
  # High Volatility - Business Logic
  services/
    auth/                # Login, persona (authentication domain)
    game/                # Transactions, lobby (game domain)
    protocol/            # NPS protocol handlers
    web/                  # HTTP route handlers
  
  # Libraries (Low-Medium Volatility)
  libraries/
    binary/              # Binary serialization
    network/             # Network utilities
    parser/              # Protocol parser
    rooms/               # Room management
```

**Benefits**:

- Clear separation by change frequency
- Easy to identify what needs frequent testing
- Stable components don't depend on volatile ones
- Aligns with volatility-based composition taxonomy

**Drawbacks**:

- Breaks domain boundaries (login and persona together)
- Harder to find domain-specific code
- May not align with team structure

### Option B: Hybrid - Volatility Layers Within Services

```
packages/
  # Services organized by domain
  gateway/
    core/                # Low volatility (abstractions)
    infrastructure/      # Medium volatility (managers)
    handlers/            # High volatility (protocol routers, web handlers)
  
  login/
    core/                # Low volatility (types, interfaces)
    infrastructure/      # Medium volatility (utilities)
    handlers/           # High volatility (business logic)
  
  # Shared infrastructure
  shared/
    core/                # Low volatility (types, interfaces)
    infrastructure/      # Medium volatility (utilities)
  
  # Libraries
  libraries/
    @rustymotors/
      binary/
      network/
      ...
```

**Benefits**:

- Maintains domain boundaries
- Clear volatility separation within each service
- Easier for teams to own domains
- Still enables volatility-based design

**Drawbacks**:

- More complex structure
- Some duplication of infrastructure patterns

### Option C: Service-Oriented with Volatility Awareness (Current + Improvements)

Keep current structure but:

1. Extract high-volatility code from gateway
2. Create clear volatility boundaries within packages
3. Document volatility levels

```
packages/
  gateway/              # Medium volatility (orchestration only)
  protocol-handlers/    # High volatility (npsPortRouter, mcotsPortRouter)
  web-handlers/         # High volatility (web.ts route handlers)
  login/                # High volatility (business logic)
  lobby/                 # High volatility (business logic)
  transactions/         # High volatility (business logic)
  ...
```

**Benefits**:

- Minimal restructuring
- Clear separation of high-volatility protocol handlers
- Maintains current service boundaries

**Drawbacks**:

- Still mixes volatility in some packages
- Doesn't fully achieve volatility-based taxonomy

## Recommendation: Hybrid Approach (Option B)

### Why Hybrid?

1. **Monolith Deployment**: Since this appears to be a monolith, we don't need strict service boundaries
2. **Team Structure**: If teams own domains (auth, game, gateway), hybrid maintains that
3. **Volatility Principles**: Still achieves volatility-based design within each domain
4. **Practical Migration**: Easier to migrate incrementally

### Implementation Strategy

#### Phase 1: Extract High-Volatility from Gateway

```
packages/gateway/
  src/
    core/                    # Low volatility
      routing/PortRouterRegistry.ts
      configuration/GatewayConfiguration.ts
      types.ts
    infrastructure/          # Medium volatility
      network/NetworkServerManager.ts
      web/WebServerManager.ts
      lifecycle/ServerLifecycleManager.ts
    handlers/                # High volatility (NEW)
      protocol/
        npsPortRouter.ts     # Move from src/
        mcotsPortRouter.ts   # Move from src/
      web/
        routes.ts            # Extract from web.ts
        handlers/            # Individual route handlers
```

#### Phase 2: Organize Services by Volatility

```
packages/login/
  src/
    core/                    # Low volatility
      types.ts
      interfaces.ts
    infrastructure/          # Medium volatility
      internal.ts
      utilities.ts
    handlers/                # High volatility
      login.ts
      receiveLoginData.ts
```

#### Phase 3: Consolidate Shared Infrastructure

```
packages/shared/
  core/                     # Low volatility
    types.ts
    interfaces.ts
  infrastructure/           # Medium volatility
    MessageQueue.ts
    SubThread.ts
    Configuration.ts
```

## Comparison: Monoservices vs Volatility-Based

### Monoservices (Current)

**Pros**:

- Clear service boundaries
- Easy to understand "what service does what"
- Aligns with domain-driven design
- Good for microservices migration path

**Cons**:

- Mixes volatility levels within services
- Hard to identify what changes frequently
- Stable code depends on volatile code
- Doesn't align with volatility-based composition taxonomy

### Volatility-Based (Pure)

**Pros**:

- Clear separation by change frequency
- Stable components don't depend on volatile ones
- Easy to identify testing priorities
- Aligns with volatility-based composition taxonomy
- Better for monolith architecture

**Cons**:

- Breaks domain boundaries
- Harder to find domain-specific code
- May not align with team structure
- Harder migration path

### Hybrid (Recommended)

**Pros**:

- Maintains domain boundaries
- Achieves volatility-based design within domains
- Flexible for monolith or microservices
- Easier incremental migration
- Aligns with both DDD and volatility principles

**Cons**:

- More complex structure
- Requires discipline to maintain boundaries

## Decision Framework

### Choose Monoservices If

- Planning to split into microservices
- Team structure is service-based
- Services are truly independent
- Deployment model is microservices

### Choose Volatility-Based If

- Monolith deployment
- Want to minimize change impact
- Focus on maintainability over service boundaries
- Team structure is feature-based

### Choose Hybrid If

- Monolith deployment (current)
- Want both domain boundaries and volatility separation
- Team structure is domain-based
- Want flexibility for future microservices migration

## Recommendation for This Codebase

**Based on evidence**:

- ✅ Monolith deployment (single entry points, direct function calls)
- ✅ Service-like boundaries for organization
- ✅ Goal of volatility-based composition taxonomy
- ✅ Team likely owns domains (auth, game, gateway)

**Recommendation**: **Hybrid Approach (Option B)**

### Immediate Actions

1. **Extract high-volatility handlers from gateway**

   ```
   packages/gateway/src/handlers/
     protocol/  # npsPortRouter, mcotsPortRouter
     web/       # Route handlers from web.ts
   ```

2. **Organize gateway by volatility**

   ```
   packages/gateway/src/
     core/           # Low volatility
     infrastructure/ # Medium volatility
     handlers/       # High volatility
   ```

3. **Document volatility levels** in each package
   - Add `VOLATILITY.md` to each package
   - Document what changes frequently vs rarely

4. **Apply same pattern to other services** (incremental)
   - Start with one service (e.g., login)
   - Organize by volatility within that service
   - Repeat for others

### Long-Term Vision

```
packages/
  # Each service organized by volatility
  gateway/
    core/              # Low volatility
    infrastructure/    # Medium volatility
    handlers/          # High volatility
  
  login/
    core/              # Low volatility
    infrastructure/    # Medium volatility
    handlers/          # High volatility
  
  # Shared organized by volatility
  shared/
    core/              # Low volatility
    infrastructure/    # Medium volatility
```

This achieves:

- ✅ Domain boundaries (services)
- ✅ Volatility-based design (within services)
- ✅ Clear separation of concerns
- ✅ Maintainable structure
- ✅ Aligns with volatility-based composition taxonomy

## Conclusion

The current **monoservices structure makes sense for organization**, but **doesn't fully align with volatility-based principles**. The **hybrid approach** gives you:

1. **Service boundaries** for domain organization
2. **Volatility layers** within each service
3. **Clear separation** of stable vs volatile code
4. **Flexibility** for future microservices migration

This is the best of both worlds: maintainable domain boundaries with volatility-based design principles.
