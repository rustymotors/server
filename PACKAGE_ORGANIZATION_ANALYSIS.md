# Package Organization Analysis

This document analyzes the current package structure and provides recommendations for better organization aligned with volatility-based composition taxonomy and 12 Factor App principles.

## Current Structure

### Packages (`packages/`)

- **Services**: `cli`, `gateway`, `login`, `lobby`, `nps`, `persona`, `shard`, `transactions`
- **Infrastructure**: `database`, `shared`, `shared-packets`
- **Libraries**: `pklib-ts`

### Libraries (`libs/@rustymotors/`)

- `binary`, `network`, `parser`, `protocol`, `rooms`

### Root Level (`src/`)

- `chat/` (also listed as workspace)
- `nps_server.ts`, `mcots_server.ts`

## Issues Identified

### 1. **Location Inconsistency** ⚠️

- **Problem**: `src/chat` is in `src/` but listed as a workspace
- **Impact**: Inconsistent location makes it harder to find and understand structure
- **Recommendation**: Move `src/chat` → `packages/chat`

### 2. **Shared Package Split** ⚠️

- **Problem**: `shared` and `shared-packets` are separate packages
- **Questions**:
  - What's the boundary between them?
  - Why are they separate?
  - Does `shared-packets` depend on `shared`?
- **Recommendation**:
  - If they're truly different concerns (packet serialization vs shared utilities), keep separate
  - If `shared-packets` is just a subset, consider merging
  - Document the boundary clearly

### 3. **Small Service Packages** 🤔

- **Problem**: Some packages are very small:
  - `cli` (~6 files) - Console input handling
  - `shard` (~6 files) - Shard server
  - `persona` (~11 files) - Persona service
- **Consideration**:
  - Are they independent services that could be deployed separately?
  - Or are they tightly coupled to gateway?
- **Recommendation**:
  - If tightly coupled: Consider moving into `gateway` as sub-modules
  - If independent: Keep separate but document why

### 4. **Library Location Inconsistency** ⚠️

- **Problem**:
  - `libs/@rustymotors/*` - Scoped libraries
  - `packages/pklib-ts` - Library in packages
- **Recommendation**:
  - Move `pklib-ts` → `libs/@rustymotors/pklib-ts` for consistency
  - OR move all libraries to `packages/` and use scoped naming

### 5. **Root Level Server Files** ⚠️

- **Problem**: `src/nps_server.ts` and `src/mcots_server.ts` at root
- **Questions**:
  - Are these entry points?
  - Should they be in a `packages/server` or `packages/gateway`?
- **Recommendation**:
  - If entry points, consider `packages/server/` or move to `packages/gateway/src/`
  - Document their purpose

### 6. **NPS Package Structure** 🤔

- **Problem**: `packages/nps` exists but also `src/nps_server.ts`
- **Questions**:
  - What's the relationship?
  - Is `nps` a service or a library?
- **Recommendation**: Clarify and document the relationship

## Recommended Organization

### Option A: Service-Oriented (Current + Improvements)

```
packages/
  services/          # Application services
    gateway/         # Main gateway service
    login/           # Login service
    lobby/           # Lobby service
    transactions/    # Transaction service
    persona/         # Persona service
    chat/            # Chat service (moved from src/)
  
  infrastructure/    # Shared infrastructure
    database/        # Database layer
    shared/          # Shared utilities
    shared-packets/  # Packet serialization (if truly separate)
  
  libraries/         # Internal libraries
    pklib-ts/        # PK library

libs/
  @rustymotors/      # Core libraries
    binary/
    network/
    parser/
    protocol/
    rooms/
```

### Option B: Volatility-Based (Aligned with Refactoring Vision)

```
packages/
  core/              # Low volatility - stable abstractions
    shared/          # Shared types, interfaces
    shared-packets/  # Packet serialization
    database/        # Database abstractions
  
  infrastructure/    # Medium volatility - infrastructure
    gateway/         # Gateway orchestration
    network/         # Network management
    lifecycle/       # Lifecycle management
  
  services/          # High volatility - business logic
    login/
    lobby/
    transactions/
    persona/
    chat/
    nps/             # Protocol handlers
  
  libraries/         # Reusable libraries
    pklib-ts/
    @rustymotors/*   # Move from libs/

libs/                # External/third-party libs only
```

### Option C: Domain-Driven (Recommended)

```
packages/
  # Core Domain
  shared/            # Shared types, utilities
  shared-packets/    # Packet serialization
  
  # Infrastructure
  database/          # Database layer
  gateway/           # Gateway service (orchestration)
  
  # Domain Services
  auth/              # Authentication (login + persona?)
  game/              # Game services (lobby, transactions, nps)
  chat/              # Chat service
  
  # Libraries
  @rustymotors/      # Core libraries (move from libs/)
    binary/
    network/
    parser/
    protocol/
    rooms/
    pklib-ts/
```

## Specific Recommendations

### High Priority

1. **Move `src/chat` → `packages/chat`**
   - Consistent location
   - Easier to find and maintain

2. **Clarify `shared` vs `shared-packets`**
   - Document the boundary
   - Consider merging if not truly separate

3. **Consolidate library locations**
   - Choose: `libs/` or `packages/`
   - Be consistent

### Medium Priority

1. **Evaluate small packages**
   - `cli`, `shard`, `persona`
   - Decide: independent services or gateway modules?

2. **Organize entry points**
   - `src/nps_server.ts`, `src/mcots_server.ts`
   - Move to appropriate package or create `packages/server/`

### Low Priority

1. **Consider service grouping**
   - Group related services (e.g., `auth/` for login + persona)
   - Only if it improves clarity

## Questions to Answer

1. **Deployment Model**: Are services deployed independently or as a monolith?
   - If monolith: Can consolidate more
   - If microservices: Keep separate

2. **Team Structure**: How is the codebase organized by team?
   - Align packages with team ownership

3. **Volatility**: Which packages change most frequently?
   - Align with volatility-based taxonomy

4. **Dependencies**: What are the dependency relationships?
   - Avoid circular dependencies
   - Clear dependency hierarchy

## Alignment with Volatility-Based Taxonomy

Based on `VOLATILITY_ANALYSIS.md`:

- **Low Volatility** → `packages/core/` or `packages/shared/`
- **Medium Volatility** → `packages/infrastructure/`
- **High Volatility** → `packages/services/` or `packages/game/`

This aligns with the refactoring vision and makes it easier to:

- Identify what changes frequently
- Apply appropriate testing strategies
- Plan refactoring efforts

## Next Steps

1. **Document current structure** - Create a package dependency graph
2. **Decide on organization model** - Choose Option A, B, or C
3. **Create migration plan** - Phased approach to reorganize
4. **Update documentation** - Reflect new structure
5. **Update CI/CD** - Ensure build scripts work with new structure
