# Volatility-Based Layer Architecture

This document outlines how to organize the mcos project into volatility-based layers. The principle is to separate code based on how frequently it changes, with stable code at the bottom and frequently-changing code at the top.

> **Analysis Tool**: Run `tsx scripts/analyze-layers.ts` to check for layer violations.

## Layer Structure

```
┌─────────────────────────────────────────────────────────┐
│  Layer 4: Entry Points & Configuration (Highest Volatility) │
│  - Application entry points                              │
│  - Server startup scripts                               │
│  - Deployment configurations                            │
└─────────────────────────────────────────────────────────┘
                          ↓ depends on
┌─────────────────────────────────────────────────────────┐
│  Layer 3: Application Services (High Volatility)        │
│  - Gateway orchestration                                │
│  - Request handlers                                     │
│  - Feature-specific modules                             │
└─────────────────────────────────────────────────────────┘
                          ↓ depends on
┌─────────────────────────────────────────────────────────┐
│  Layer 2: Domain/Business Logic (Medium Volatility)    │
│  - Login, Persona, Transactions                         │
│  - Lobby, NPS, Shard management                         │
│  - Game-specific business rules                         │
└─────────────────────────────────────────────────────────┘
                          ↓ depends on
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Infrastructure & Core (Low Volatility)        │
│  - Binary serialization                                 │
│  - Network protocols                                    │
│  - Database abstractions                                │
│  - Shared utilities                                     │
└─────────────────────────────────────────────────────────┘
```

## Detailed Layer Breakdown

### Layer 1: Infrastructure & Core (Low Volatility)
**Change Frequency**: Rarely changes, only when fundamental infrastructure needs updating

**Location**: `libs/@rustymotors/` and core `packages/`

#### Components:
- **`libs/@rustymotors/binary/`** - Binary serialization/deserialization
  - Core data structures (Bytable, Serializer)
  - Message encoding/decoding primitives
  - **Why Low Volatility**: Binary format is stable, changes only for protocol updates

- **`libs/@rustymotors/network/`** - Network abstractions
  - TCP/UDP connection handling
  - Socket management
  - **Why Low Volatility**: Network primitives rarely change

- **`libs/@rustymotors/parser/`** - Protocol parsing
  - Low-level protocol parsing
  - **Why Low Volatility**: Protocol structure is stable

- **`packages/protocol/`** - Protocol layer (formerly shared-packets)
  - Protocol message definitions
  - Protocol handlers
  - **Why Low Volatility**: Protocol spec is relatively stable
  - **Note**: `libs/@rustymotors/protocol` was deleted (unused)

- **`libs/@rustymotors/rooms/`** - Room management infrastructure
  - Room server abstractions
  - User management primitives
  - **Why Low Volatility**: Core room mechanics don't change often

- **`packages/shared/`** - Shared utilities and types
  - Configuration management
  - Logging infrastructure
  - Message types
  - Serialization helpers
  - Error types
  - **Why Low Volatility**: Cross-cutting concerns that should be stable

- **`packages/database/`** - Database abstraction layer
  - Database connection management
  - Query builders
  - Schema definitions
  - **Why Low Volatility**: Database structure changes infrequently

- **`packages/protocol/`** - Protocol layer (already listed above)

**Dependencies**: None (or only external libraries)

---

### Layer 2: Domain/Business Logic (Medium Volatility)
**Change Frequency**: Changes with business requirements and game features

**Location**: `packages/` (domain-specific packages)

#### Components:
- **`packages/login/`** - Authentication and login logic
  - Login handlers
  - User authentication
  - Session management
  - **Why Medium Volatility**: Login flows may change with security requirements

- **`packages/persona/`** - Player persona management
  - Persona creation/selection
  - Persona validation
  - **Why Medium Volatility**: Persona features may evolve

- **`packages/transactions/`** - Game transaction logic
  - Car purchases
  - Part purchases
  - Race creation/joining
  - Player info retrieval
  - Racing history
  - **Why Medium Volatility**: Game economy and features change frequently

- **`packages/lobby/`** - Lobby management
  - Lobby creation/management
  - Player matching
  - **Why Medium Volatility**: Lobby features may be enhanced

- **`packages/nps/`** - NPS (Network Protocol Server) logic
  - NPS-specific handlers
  - **Why Medium Volatility**: Protocol-specific business logic

- **`packages/shard/`** - Shard management
  - Shard allocation
  - Load balancing logic
  - **Why Medium Volatility**: Scaling strategies may evolve

**Dependencies**: 
- Layer 1 (Infrastructure & Core) only
- **Note**: Layer 2 packages should NOT depend on each other. If transactions needs login functionality, it should go through Layer 3 (Application Services) or share abstractions in Layer 1.

---

### Layer 3: Application Services (High Volatility)
**Change Frequency**: Changes frequently with new features, integrations, and user-facing changes

**Location**: `packages/gateway/` and `src/chat/`

#### Components:
- **`packages/gateway/`** - Gateway orchestration
  - Server lifecycle management
  - Request routing
  - Service coordination
  - Port management
  - **Why High Volatility**: Gateway needs to adapt to new services and routing requirements

- **`src/chat/`** - Chat functionality
  - Chat message handling
  - In-game email
  - **Why High Volatility**: Chat features change often

**Dependencies**:
- Layer 2 (Domain/Business Logic)
- Layer 1 (Infrastructure & Core)

---

### Layer 4: Entry Points & Configuration (Highest Volatility)
**Change Frequency**: Changes most frequently - deployment configs, startup scripts, environment setup

**Location**: `src/`, root configuration files

#### Components:
- **`src/nps_server.ts`** - Main server entry point
  - Server initialization
  - Configuration loading
  - Service startup
  - **Why Highest Volatility**: Entry points change with deployment needs

- **`src/mcots_server.ts`** - Alternative server entry point
  - **Why Highest Volatility**: Entry points change frequently

- **`migrations/`** - Database migrations
  - Schema changes
  - Data migrations
  - **Why Highest Volatility**: Database schema evolves with features

- **`docker-compose.yml`** - Container orchestration
  - **Why Highest Volatility**: Deployment configs change often

- **`services/`** - Service configurations
  - Nginx configs
  - SSL certificates
  - **Why Highest Volatility**: Infrastructure configs change

- **`.env` files** - Environment configuration
  - **Why Highest Volatility**: Environment-specific settings

- **`Makefile`** - Build and deployment scripts
  - **Why Highest Volatility**: Build processes evolve

**Dependencies**:
- Layer 3 (Application Services)
- Layer 2 (Domain/Business Logic)
- Layer 1 (Infrastructure & Core)

---

## Recommended Directory Structure

Based on volatility layers, consider reorganizing to:

```
/data/Code/server/
├── layer1-infrastructure/          # Low volatility
│   ├── libs/
│   │   └── @rustymotors/
│   │       ├── binary/
│   │       ├── network/
│   │       ├── parser/
│   │       ├── protocol/
│   │       └── rooms/
│   └── packages/
│       ├── shared/
│       ├── database/
│       └── protocol/
│
├── layer2-domain/                   # Medium volatility
│   └── packages/
│       ├── login/
│       ├── persona/
│       ├── transactions/
│       ├── lobby/
│       ├── nps/
│       └── shard/
│
├── layer3-application/              # High volatility
│   ├── packages/
│   │   └── gateway/
│   └── src/
│       └── chat/
│
└── layer4-entrypoints/              # Highest volatility
    ├── src/
    │   ├── nps_server.ts
    │   └── mcots_server.ts
    ├── migrations/
    ├── docker-compose.yml
    ├── services/
    └── Makefile
```

**OR** (less disruptive, maintain current structure but document layers):

Keep current structure but add clear documentation and enforce dependency rules:

```
/data/Code/server/
├── libs/@rustymotors/        # Layer 1
├── packages/
│   ├── shared/               # Layer 1
│   ├── database/             # Layer 1
│   ├── protocol/             # Layer 1
│   ├── login/                # Layer 2
│   ├── persona/              # Layer 2
│   ├── transactions/         # Layer 2
│   ├── lobby/                # Layer 2
│   ├── nps/                  # Layer 2
│   ├── shard/                # Layer 2
│   └── gateway/              # Layer 3
├── src/
│   ├── chat/                 # Layer 3
│   ├── nps_server.ts         # Layer 4
│   └── mcots_server.ts       # Layer 4
├── migrations/               # Layer 4
└── services/                 # Layer 4
```

## Dependency Rules

### Enforce These Rules:

1. **Layer 4** can depend on any layer
2. **Layer 3** can depend on Layers 1-2, but NOT Layer 4
3. **Layer 2** can depend on Layer 1 only (NOT Layers 2, 3, or 4)
4. **Layer 1** cannot depend on any other layer (only external dependencies)

### Current Violations to Address:

- Check that `packages/shared` doesn't import from `packages/gateway`
- Check that `packages/database` doesn't import from domain packages
- Check that `libs/@rustymotors/*` don't import from application packages

## Benefits of This Organization

1. **Stability**: Stable code is protected from frequent changes
2. **Testability**: Each layer can be tested independently
3. **Maintainability**: Changes are localized to appropriate layers
4. **Scalability**: Easy to add new features without affecting core infrastructure
5. **Reusability**: Lower layers can be reused across different applications

## Migration Strategy

1. **Phase 1**: Document current dependencies and identify violations
2. **Phase 2**: Refactor dependencies to respect layer boundaries
3. **Phase 3**: (Optional) Reorganize directory structure if needed
4. **Phase 4**: Add linting rules to enforce layer boundaries

## Tools to Enforce Layers

Consider adding:
- ESLint rules to prevent cross-layer imports
- TypeScript path mapping to make layer boundaries explicit
- Documentation in each package's README indicating its layer
- CI checks to validate dependency rules

## Related Documentation

- **ARCHITECTURE_EVALUATION.md** - Analysis of monoservices vs volatility-based organization
- **PACKAGE_ORGANIZATION_ANALYSIS.md** - Package structure recommendations
- **PROTOCOL_BINARY_OVERLAP.md** - Serialization consolidation strategy
- **SERIALIZATION_MIGRATION_MAP.md** - Migration guide for serialization types
- **ALL_DOCS_REVIEW.md** - Comprehensive review of all documentation
