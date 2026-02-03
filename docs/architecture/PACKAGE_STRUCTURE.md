# Package Structure Guide

This document explains the organization of code in the MCOS monorepo, specifically the distinction between `libs/` and `packages/`.

## Overview

MCOS uses npm workspaces to organize code into two distinct categories:

| Directory | Scope | Purpose | Volatility |
|-----------|-------|---------|------------|
| `libs/@rustymotors/` | `@rustymotors/*` | Technical infrastructure | Low |
| `packages/` | `rusty-motors-*` | Domain services | Medium-High |

## libs/@rustymotors/ - Technical Infrastructure

Low-volatility, foundational libraries that rarely change. These provide the building blocks for higher-level services.

| Package | Purpose |
|---------|---------|
| `@rustymotors/binary` | Binary serialization primitives (Bytable, Buffer operations) |
| `@rustymotors/network` | TCP/UDP socket handling, connection management |
| `@rustymotors/parser` | Low-level protocol parsing |
| `@rustymotors/protocol` | Protocol message definitions (GamePacket, etc.) |
| `@rustymotors/rooms` | Room/race management abstractions |

### When to add to libs/

- Code that is protocol-stable
- Used across many packages
- Unlikely to change with game feature updates
- No business logic, only technical primitives

### Import pattern

```typescript
import { Bytable } from '@rustymotors/binary';
import { ClientConnection } from '@rustymotors/network';
```

## packages/ - Domain Services

Higher-volatility, business-logic packages that implement game features.

| Package | Purpose | Port |
|---------|---------|------|
| `gateway` | Server orchestration, lifecycle, routing | - |
| `authentication` | User login, session management | 8226 |
| `lobby` | Game lobby, user lists | 7003 |
| `transactions` | Game transactions, race processing | 43300 |
| `persona` | Character profile management | 8228 |
| `nps` | NPS protocol handlers | - |
| `database` | Database abstraction layer | - |
| `shared` | Shared utilities, config, logging | - |
| `protocol` | High-level protocol definitions | - |
| `shard` | Shard service for distributed state | - |
| `cli` | Command-line interface utilities | - |

### When to add to packages/

- Domain-specific code
- Feature implementations
- Service handlers
- Business logic

### Import pattern

```typescript
import { config } from 'rusty-motors-shared';
import { DatabaseService } from 'rusty-motors-database';
```

## Dependency Rules

1. **Libs cannot depend on packages** - Infrastructure is foundational
2. **Packages can depend on libs** - Services use infrastructure
3. **Higher-layer packages can depend on lower-layer packages** - See [VOLATILITY_LAYERS.md](VOLATILITY_LAYERS.md)
4. **Avoid circular dependencies** - Use dependency injection if needed

### Dependency Flow

```
libs/@rustymotors/binary
    ↓
libs/@rustymotors/network, parser, rooms, protocol
    ↓
packages/shared, packages/protocol
    ↓
packages/authentication, packages/database, packages/transactions
    ↓
packages/gateway
```

## Special Cases

### src/chat/

The chat functionality is a workspace but lives in `src/` rather than `packages/`. This is a historical artifact that should eventually be moved to `packages/chat/` for consistency.

### Dual Protocol Packages

Both `libs/@rustymotors/protocol` and `packages/protocol` exist:

| Package | Location | Purpose |
|---------|----------|---------|
| `@rustymotors/protocol` | `libs/@rustymotors/protocol/` | Low-level protocol primitives |
| `rusty-motors-protocol` | `packages/protocol/` | High-level protocol definitions |

The [MASTER_DESIGN.md](MASTER_DESIGN.md) notes that `libs/@rustymotors/protocol` was marked for potential consolidation as it overlaps with other packages.

## Adding a New Package

### To libs/@rustymotors/

1. Create directory: `libs/@rustymotors/my-lib/`
2. Add `package.json` with name `@rustymotors/my-lib`
3. Add to root `package.json` workspaces array
4. Ensure it has no dependencies on `packages/`

### To packages/

1. Create directory: `packages/my-service/`
2. Add `package.json` with name `rusty-motors-my-service`
3. Add to root `package.json` workspaces array
4. Follow the volatility layer appropriate for your service

## Naming Conventions

| Scope | Package Name | Example Import |
|-------|-------------|----------------|
| libs | `@rustymotors/{name}` | `import { X } from '@rustymotors/binary'` |
| packages | `rusty-motors-{name}` | `import { X } from 'rusty-motors-shared'` |

## Related Documentation

- [MASTER_DESIGN.md](MASTER_DESIGN.md) - Overall architecture
- [VOLATILITY_LAYERS.md](VOLATILITY_LAYERS.md) - Layer dependencies and stability
- [PACKAGE_ORGANIZATION_ANALYSIS.md](PACKAGE_ORGANIZATION_ANALYSIS.md) - Detailed package analysis
