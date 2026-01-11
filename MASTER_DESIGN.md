# Master Design Document

> **Purpose**: Single source of truth for architecture decisions and refactoring guidance.
>
> **Status**: Active - Follow this document for all architectural decisions.
>
> **Last Updated**: January 2026

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architectural Decisions](#architectural-decisions)
3. [Package Structure](#package-structure)
4. [Code Principles](#code-principles)
5. [Dependency Rules](#dependency-rules)
6. [Refactoring Phases](#refactoring-phases)
7. [Serialization Consolidation](#serialization-consolidation)
8. [Quick Wins Checklist](#quick-wins-checklist)
9. [Testing Strategy](#testing-strategy)
10. [Guidance for AI Agents](#guidance-for-ai-agents)
11. [Document Index](#document-index)

---

## Executive Summary

### What This Project Is

A **monolith game server** for Motor City Online (MCO) reverse engineering. Single deployment, single process, multiple protocol handlers.

### Architecture Philosophy

**"SOLID Monolith"** - Apply Clean Code and SOLID principles at the code level, not through complex directory structures. Keep things simple and flat unless complexity is justified.

### Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Deployment model | Monolith | Single process, direct function calls, simpler operations |
| Package organization | Flat (mostly) | Small packages don't need subdirectories |
| Gateway structure | Restructure internally | It's large and has SRP violations |
| Serialization | Consolidate on `@rustymotors/binary` | Remove duplication |
| Volatility enforcement | Documentation + tooling | No physical layer directories |

---

## Architectural Decisions

### Decision 1: Monolith, Not Microservices

**Choice**: Keep as a monolith with service-like packages for organization.

**Rationale**:

- Single deployment simplifies operations
- Direct function calls (no network overhead between services)
- Team size doesn't require service isolation
- Protocol handlers are tightly coupled anyway

**Implication**: Packages exist for **code organization**, not deployment isolation.

### Decision 2: Flat Package Structure (Mostly)

**Choice**: Keep packages flat. Only restructure `gateway`.

**Rationale**:

- Most packages are small (6-15 files)
- Adding `core/infrastructure/handlers` to 6-file packages is overkill
- Reduces navigation overhead
- Simpler mental model

**Exception**: `packages/gateway/` gets internal structure because:

- It's the largest package (~20+ files)
- It has documented SRP violations
- It genuinely mixes different concerns (lifecycle, network, routing, handlers)

### Decision 3: SOLID at Code Level, Not Directory Level

**Choice**: Apply SOLID principles through code patterns, not folder structures.

**Rationale**:

- Folders don't enforce anything - code does
- Smaller files and functions are more maintainable than complex hierarchies
- Easier for contributors to understand

### Decision 4: Volatility Awareness Without Physical Layers

**Choice**: Document volatility levels but don't create `layer1/`, `layer2/` directories.

**Rationale**:

- Physical reorganization is high-risk, low-reward
- Tooling (like `scripts/analyze-layers.ts`) can enforce rules without moving files
- Focus energy on consolidation and quality, not reorganization

---

## Package Structure

### Current Structure (Keep This)

```
/data/Code/server/
├── libs/@rustymotors/          # Low volatility - core libraries
│   ├── binary/                   # Binary serialization primitives
│   ├── network/                  # Network utilities
│   ├── parser/                   # Protocol parsing
│   └── rooms/                    # Room management
│
├── packages/                    # Application packages
│   ├── shared/                   # Layer 1 - Shared utilities, types
│   ├── database/                 # Layer 1 - Database abstraction
│   ├── protocol/                 # Layer 1 - Protocol definitions
│   ├── login/                    # Layer 2 - Authentication (FLAT)
│   ├── persona/                  # Layer 2 - Persona management (FLAT)
│   ├── transactions/             # Layer 2 - Game transactions (FLAT)
│   ├── lobby/                    # Layer 2 - Lobby management (FLAT)
│   ├── nps/                      # Layer 2 - NPS protocol handlers (FLAT)
│   ├── shard/                    # Layer 2 - Shard server (FLAT)
│   ├── cli/                      # Layer 2 - CLI interface (FLAT)
│   └── gateway/                  # Layer 3 - Orchestration (RESTRUCTURE)
│
├── src/
│   ├── chat/                    # Layer 3 - Chat functionality
│   ├── nps_server.ts            # Layer 4 - Entry point
│   └── mcots_server.ts          # Layer 4 - Entry point
│
└── migrations/                  # Layer 4 - Database migrations
```

### Gateway Internal Structure (Target State)

Only `gateway` gets internal restructuring:

```
packages/gateway/src/
├── core/                        # Low volatility - stable abstractions
│   ├── types.ts                   # Type definitions
│   ├── interfaces.ts              # PortRouter, LifecycleManager, etc.
│   └── index.ts
│
├── infrastructure/              # Medium volatility - server management
│   ├── lifecycle/
│   │   └── ServerLifecycleManager.ts
│   ├── network/
│   │   └── NetworkServerManager.ts
│   ├── web/
│   │   └── WebServerManager.ts
│   ├── signals/
│   │   └── SignalHandler.ts
│   ├── configuration/
│   │   └── GatewayConfiguration.ts
│   └── index.ts
│
├── handlers/                    # High volatility - protocol routing
│   ├── npsPortRouter.ts
│   ├── mcotsPortRouter.ts
│   ├── web.ts
│   └── index.ts
│
├── routing/
│   └── PortRouterRegistry.ts    # Port router management
│
├── session/                     # Session recording (already exists)
│   ├── SessionRecorder.ts
│   └── SessionReplayer.ts
│
├── GatewayServer.ts             # Orchestrator
└── index.ts                     # Public exports
```

### Flat Package Example (All Other Packages)

Keep other packages flat:

```
packages/login/src/
├── login.ts                     # Main login handler
├── receiveLoginData.ts          # Protocol handler
├── handleLoginData.ts           # Data handling
├── NPSUserStatus.ts             # Status message
├── internal.ts                  # Internal utilities
└── index.ts                     # Exports
```

**Rule**: Only add subdirectories when a package exceeds ~15-20 files.

---

## Code Principles

### Clean Code Guidelines

1. **Small Functions**: Each function does ONE thing. Target: 10-30 lines.
2. **Meaningful Names**: `processLoginRequest` not `process` or `handleData`
3. **No Magic Numbers**: Use constants with descriptive names
4. **Early Returns**: Reduce nesting with guard clauses
5. **No Deep Nesting**: Maximum 2-3 levels of indentation

### SOLID Principles (Applied at Code Level)

#### Single Responsibility (S)

**Do**: One file = one cohesive concept

```typescript
// ✅ Good - login.ts handles login logic
export async function login(data: Buffer, log: ServerLogger): Promise<LoginResult>

// ❌ Bad - mixing concerns
export async function loginAndUpdateStatsAndSendEmail(...)
```

**Guideline**: If a file exceeds ~200 lines, consider splitting.

#### Open/Closed (O)

**Do**: Design for extension without modification

```typescript
// ✅ Good - new handlers can be added without modifying router
const handlers = new Map<number, MessageHandler>();
handlers.set(0x100, handleLogin);
handlers.set(0x101, handleLogout);
// Adding new handler doesn't change existing code
handlers.set(0x102, handleNewFeature);
```

**Guideline**: Use registries and handler maps instead of switch statements when possible.

#### Liskov Substitution (L)

**Do**: Subtypes must be substitutable for their base types.

**Guideline**: The codebase uses composition over inheritance (good!). Keep it that way.

#### Interface Segregation (I)

**Do**: Prefer focused interfaces over large ones.

```typescript
// ✅ Good - focused interface
interface BytableObject {
    serialize(): Buffer;
    deserialize(buffer: Buffer): void;
    get serializeSize(): number;
}

// ❌ Bad - bloated interface
interface EverythingObject {
    serialize(): Buffer;
    deserialize(buffer: Buffer): void;
    validate(): boolean;
    transform(): void;
    log(): void;
    // ... 20 more methods
}
```

#### Dependency Inversion (D) - **Most Important for Testability**

**Do**: Accept dependencies as parameters with sensible defaults.

```typescript
// ✅ Good - injectable dependencies, easy to test
export async function login(
    data: Buffer,
    log: ServerLogger = getServerLogger("login"),
    db: DatabaseService = getDatabaseService(),
): Promise<LoginResult> {
    // Implementation
}

// Test can inject mocks:
const result = await login(testData, mockLogger, mockDatabase);
```

```typescript
// ❌ Bad - creates dependencies internally, hard to test
export async function login(data: Buffer): Promise<LoginResult> {
    const log = getServerLogger("login");  // Can't mock
    const db = new DatabaseConnection();    // Can't mock
}
```

**Pattern for all public functions**:

```typescript
export async function functionName(
    requiredInput: InputType,
    log: ServerLogger = getServerLogger("moduleName"),
    // other optional dependencies with defaults
): Promise<ResultType>
```

---

## Dependency Rules

### Cross-Package Dependencies (Layers)

```
Layer 4: Entry Points (src/nps_server.ts, src/mcots_server.ts)
    ↓ can depend on
Layer 3: Application Services (packages/gateway, src/chat)
    ↓ can depend on
Layer 2: Domain Logic (packages/login, persona, transactions, lobby, nps, shard)
    ↓ can depend on
Layer 1: Infrastructure (libs/@rustymotors/*, packages/shared, database, protocol)
    ↓ can depend on
External Libraries Only
```

### Rules

| Layer | Can Import From | Cannot Import From |
|-------|-----------------|-------------------|
| Layer 4 | Layers 1-3 | - |
| Layer 3 | Layers 1-2 | Layer 4 |
| Layer 2 | Layer 1 only | Layers 2-4 (no peer imports!) |
| Layer 1 | External only | Layers 1-4 |

### Critical Rule: Layer 2 Packages Cannot Import Each Other

```typescript
// ❌ FORBIDDEN - login importing from transactions
// packages/login/src/login.ts
import { something } from "rusty-motors-transactions"; // NO!

// ✅ OK - login importing from shared (Layer 1)
import { ServerLogger } from "rusty-motors-shared";
```

If Layer 2 packages need to communicate, go through:

1. Layer 3 (gateway orchestrates)
2. Layer 1 (shared abstractions)

### Enforcement

Run `tsx scripts/analyze-layers.ts` to check for violations.

---

## Refactoring Phases

### Phase 0: Quick Wins (Do First)

**Timeline**: Immediate  
**Risk**: Low  
**See**: [Quick Wins Checklist](#quick-wins-checklist)

Fix typos, replace console.log, strict equality, etc.

### Phase 1: Serialization Consolidation

**Timeline**: 1-2 weeks  
**Risk**: Medium  
**See**: [Serialization Consolidation](#serialization-consolidation)

Remove legacy serialization, consolidate on `@rustymotors/binary`.

### Phase 2: Gateway Restructuring

**Timeline**: 2-3 weeks  
**Risk**: Medium  

1. Create `core/`, `infrastructure/`, `handlers/` directories
2. Extract `ServerLifecycleManager` from `GatewayServer`
3. Extract `NetworkServerManager` from `GatewayServer`
4. Extract `WebServerManager` from `GatewayServer`
5. Move `npsPortRouter.ts`, `mcotsPortRouter.ts` to `handlers/`
6. Update imports
7. Test thoroughly

### Phase 3: Test Coverage

**Timeline**: Ongoing  
**Risk**: Low  
**See**: [Testing Strategy](#testing-strategy)

Add tests for critical paths identified in `CRITICAL_TEST_COVERAGE.md`.

### Phase 4: Logging Improvements

**Timeline**: 1 week  
**Risk**: Low  

1. Replace all `console.*` with logger
2. Fix `getServerLogger` bug (line 13)
3. Add JSON format option
4. Standardize dependency injection for logger

---

## Serialization Consolidation

### The Problem

Three overlapping serialization approaches:

1. `@rustymotors/binary` - Modern, generic (KEEP)
2. `BufferSerializer` in `protocol` - Duplicates `BytableBuffer` (REMOVE)
3. `SerializedBufferOld` in `shared` - Mixin-based legacy (REMOVE)

### Target State

```
libs/@rustymotors/binary/        # KEEP - Core serialization
  BytableBuffer                    # Simple buffer wrapper
  BytableMessage                   # Message with header
  BytableHeader                    # Header structure
  Bytable*                         # Primitive types

packages/protocol/               # KEEP - Uses @rustymotors/binary
  GamePacket                       # Extends/composes BytableMessage
  GameMessageHeader                # Extends/composes BytableHeader

packages/shared/                 # REMOVE serialization
  SerializedBufferOld              # DELETE - replaced by BytableBuffer
  SerializableMixin                # DELETE - no more mixins
  LegacyMessage                    # DELETE - replaced by BytableMessage
```

### Migration Map

| Old Type | New Type | Notes |
|----------|----------|-------|
| `SerializedBufferOld` | `BytableBuffer` | Simple buffer wrapper |
| `BufferSerializer` | `BytableBuffer` | Same functionality |
| `LegacyMessage` | `BytableMessage` | Has 4-byte header |
| `NPSMessage` | `BytableMessage` | Has 12-byte header |
| `MessageBufferOld` | `BytableMessage` | Migration required |

### Byte Order Warning

- **NPS Protocol**: Big Endian (BE) - `BytableBuffer` methods default to BE
- **Transaction Protocol**: Little Endian (LE) - Use `Buffer` methods directly

### Migration Steps

1. Update imports from `rusty-motors-shared` to `@rustymotors/binary`
2. Replace class extends (e.g., `extends SerializedBufferOld` → `extends BytableBuffer`)
3. Update property access (`data` → `value`, `getByteSize()` → `serializeSize`)
4. Update method calls (`setBuffer` → `setValue`)
5. Run tests
6. Delete old serialization code from `shared`

---

## Quick Wins Checklist

These are low-risk, high-value fixes. Do them first.

### Critical Fixes

- [ ] **Fix typo in package.json:14**: `npn` → `npm`
- [ ] **Fix strict equality in socketErrorHandler.ts:23**: `==` → `===`

### Replace console.* with Logger

- [ ] `packages/gateway/src/HotkeyManager.ts` (lines 25, 47, 54-57, 61, 65)
- [ ] `packages/gateway/src/mcotsPortRouter.ts:209`
- [ ] `packages/gateway/src/GatewayServer.ts:185, 268`
- [ ] `packages/gateway/src/portRouters.ts:38`
- [ ] `packages/nps/gameMessageProcessors/processGameLogin.ts:202`

### Remove @ts-ignore

- [ ] `packages/login/src/receiveLoginData.ts:55, 58` - Fix underlying types
- [ ] `packages/shared/src/SubThread.ts:35` - Fix underlying types
- [ ] `packages/nps/gameMessageProcessors/index.ts:86` - Fix underlying types

### Other Quick Wins

- [ ] Remove TODO debug log at `packages/nps/gameMessageProcessors/processGetProfileInfo.ts:38`
- [ ] Extract duplicate port lists to configuration
- [ ] Document IP whitelist purpose at `packages/gateway/src/index.ts:57`

---

## Testing Strategy

### Priority Order

**P0 - Critical (Test First)**:

1. Server initialization (`src/nps_server.ts`, `src/mcots_server.ts`)
2. Connection handling (`packages/gateway/src/index.ts`)
3. Message routing (`packages/gateway/src/npsPortRouter.ts`)
4. Authentication (`packages/login/src/login.ts`)
5. Encryption/Decryption (`packages/transactions/src/internal.ts`)

**P1 - High Priority**:

1. Gateway server lifecycle
2. MCOTS router
3. Client connect flow
4. Lobby handlers
5. State management

**P2 - Medium Priority**:

1. Persona handlers
2. Chat handlers
3. Database functions

### Testing Pattern

```typescript
import { describe, it, expect } from "vitest";
import { mockLogger } from "../../mocks.js";

describe("login", () => {
    it("should authenticate valid credentials", async () => {
        // Arrange
        const mockDb = createMockDatabase({ user: validUser });
        const loginData = createLoginBuffer(validCredentials);

        // Act
        const result = await login(loginData, mockLogger, mockDb);

        // Assert
        expect(result.success).toBe(true);
        expect(mockLogger.error).not.toHaveBeenCalled();
    });
});
```

**Note**: Use the shared `mockLogger` from `mocks.ts`.

### Session Recording for Integration Tests

Use the session recording system for integration tests:

```bash
# Record a session
RECORD_SESSIONS=true npm start
# Connect with client, perform actions, disconnect

# Use in tests
npm test -- packages/gateway/test/session
```

See `SESSION_FIXTURES.md` and `TESTING_WITH_SESSIONS.md` for details.

---

## Guidance for AI Agents

> **For Cursor Agents**: See `.cursorrules` in the project root for a simplified ruleset.
> The `.cursorrules` file contains the same rules in a format optimized for AI agents.

### When Adding New Code

1. **Determine the layer**:
   - Core utility/type? → `packages/shared/` or `libs/@rustymotors/binary/`
   - Domain logic? → Appropriate `packages/` (login, persona, etc.)
   - Orchestration/routing? → `packages/gateway/`
   - Entry point? → `src/`

2. **Keep files small**: Target 100-200 lines max

3. **Use dependency injection**:

   ```typescript
   export async function myFunction(
       input: InputType,
       log: ServerLogger = getServerLogger("myModule"),
   ): Promise<ResultType>
   ```

4. **For serialization**: Use `@rustymotors/binary` classes, not legacy types

5. **Check layer violations**: Don't import from peer packages (Layer 2 → Layer 2)

### When Refactoring

1. **Check this document first** for architectural decisions
2. **Run tests** before and after changes
3. **Small commits** - one logical change per commit
4. **Update imports** when moving files
5. **Don't create new directories** in flat packages unless they exceed ~20 files

### When Fixing Bugs

1. **Add a test** that reproduces the bug first
2. **Fix the bug** with minimal changes
3. **Don't refactor** unrelated code in the same commit
4. **Check Quick Wins** - the bug might already be documented

### Code Style

- **Logging**: Always use `ServerLogger`, never `console.*`
- **Errors**: Wrap with context: `throw new Error("login failed", { cause: originalError })`
- **Types**: Prefer interfaces over type aliases for objects
- **Exports**: Use named exports, not default exports
- **Async**: Use async/await, not .then().catch()

---

## Document Index

### Active Documents (Follow These)

| Document | Purpose | Status |
|----------|---------|--------|
| **MASTER_DESIGN.md** (this) | Single source of truth | ✅ Active |
| `.cursorrules` | Simplified rules for AI agents | ✅ Active |
| `scripts/analyze-layers.ts` | Layer violation checker | ✅ Active |
| `VOLATILITY_LAYERS.md` | Layer definitions reference | ✅ Reference |

### Reference Documents (Background Information)

| Document | Purpose | Status |
|----------|---------|--------|
| `ARCHITECTURE_EVALUATION.md` | Analysis of approaches | 📚 Reference |
| `ARCHITECTURE_GROUP_ANALYSIS.md` | Document comparison | 📚 Reference |
| `PACKAGE_ORGANIZATION_ANALYSIS.md` | Package analysis | 📚 Reference |
| `GATEWAY_REFACTORING.md` | Gateway restructuring details | 📚 Reference |
| `PROTOCOL_BINARY_OVERLAP.md` | Serialization analysis | 📚 Reference |
| `SERIALIZATION_MIGRATION_MAP.md` | Migration details | 📚 Reference |
| `SHARED_PACKAGES_ANALYSIS.md` | Shared package analysis | 📚 Reference |

### Actionable Documents

| Document | Purpose | Status |
|----------|---------|--------|
| `QUICK_WINS.md` | Low-risk fixes | 📋 Do these first |
| `CRITICAL_TEST_COVERAGE.md` | Testing gaps | 📋 Test priorities |
| `LOGGING_ANALYSIS.md` | Logging improvements | 📋 Phase 4 |

### Testing Documents

| Document | Purpose | Status |
|----------|---------|--------|
| `SESSION_FIXTURES.md` | Session recording system | ✅ Active |
| `TESTING_WITH_SESSIONS.md` | Testing guide | ✅ Active |

---

## Appendix: Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| Jan 2026 | Adopt "SOLID Monolith" approach | Simpler than full hybrid, keeps flat structure |
| Jan 2026 | Only restructure gateway | It's the only package large enough to justify it |
| Jan 2026 | Consolidate on @rustymotors/binary | Remove serialization duplication |
| Jan 2026 | Layer enforcement via tooling | No physical layer directories |
| Jan 2026 | Keep packages flat by default | Small packages don't need subdirectories |

---

## Changelog

- **2026-01-11**: Initial version - consolidated from 12+ analysis documents
