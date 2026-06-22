# Packet Marshalling Consolidation — Incremental Plan

## Context

The MCOS codebase has 8 distinct types for representing and serializing network packets, where 2 should suffice. This causes comprehension failures: it's not clear which type to use, how they relate, or whether a given handler is using the right one. Previous consolidation attempts have broken wire compatibility. This plan establishes regression coverage first, then removes types one at a time.

**Target state:**
- `MessageNode` — canonical type for MCOTS protocol (port 43300, little-endian TOMC framing)
- `BytableMessage` — canonical type for NPS protocol (all other ports, big-endian NPS framing)

**Types to eliminate (in order):**
1. `NPSMessage` — `@deprecated` wrapper over `BytableMessage`
2. `OldServerMessage` — `@deprecated` wrapper over `MessageNode`
3. `MessageNodeOld` — `@deprecated` raw object
4. `RawMessage` — active use in lobby handlers; migrate to `BytableMessage`
5. `GamePacket` — bridge type in `npsPortRouter`; remove after lobby migration
6. `ServerPacket` — `@deprecated`, maps to `MessageNode`

---

## Phase -1: Fix `check:all` (PREREQUISITE — do before anything else)

`npm run check:all` is currently failing with ~20 TypeScript errors. These must be fixed before any consolidation work, because a broken type-check baseline makes it impossible to know if a migration introduced new errors.

### Error categories (as of 2026-06-22):

**1. Buffer type mismatch** (`ArrayBufferLike` vs `ArrayBuffer`)
- `libs/@rustymotors/binary/src/lib/Bytable.ts:14` — `Buffer<ArrayBufferLike>` not assignable to `DataView`
- `libs/@rustymotors/binary/src/lib/NpsRiffInfo.ts:64` — serialize return type mismatch
- Likely caused by a Node.js version bump changing `Buffer`'s generic parameter

**2. Missing/wrong `override` modifiers**
- `packages/shared/src/LegacyMessage.ts` — 3 members missing `override`
- `packages/shared/src/OldServerMessage.ts` — 3 errors (wrong signature + missing override)
- `packages/shared/src/MessageBufferOld.ts` — 2 members have `override` but base doesn't define them
- `packages/shared/src/MessageHeader.ts`, `TimeStamp.ts` — same spurious `override`
- `packages/shared/src/handlers/HandlerTypes.ts` — 2 errors on Error subclass

**3. Missing types in `packages/shared/src/types.ts`**
- `UserInfo`, `getUser`, `updateConnection`, `findUserByConnectionId`, `fetchSessionKeyByCustomerId`, `updateSessionKey`, `fetchSessionKeyByConnectionId` — all undefined
- Likely a deleted or moved import

**4. Interface mismatches in `packages/shared/src/handlers/ContextFactory.ts`**
- `addUser` not in `ISessionStore`
- `verifyCredentials` not in `IAuthStore`
- `Promise<undefined>` not assignable to `Promise<Player>`

**5. Miscellaneous**
- `packages/shared/src/Lobby.ts:219` — `boolean` assigned to `number` (2 occurrences)
- `packages/shared/src/MessageQueue.ts:4` — unused `_name`
- `libs/@rustymotors/binary/src/lib/BytableMessage.ts:18` — unused `SerializableMessage` import

Fix each category, run `npm run check:all` after each, confirm zero errors before moving to Phase 0.

---

## Phase 0: Regression Test Harness (DO THIS FIRST, TOUCH NOTHING ELSE)

**Goal:** Lock in current wire behavior so any serialization change that breaks the format is caught immediately.

### 0a. Round-trip unit tests for each active type

Write tests that:
1. Construct an instance with known field values
2. Call `serialize()` → Buffer
3. Deserialize that Buffer into a fresh instance
4. Assert all fields match

Cover every type still in use (not just the two canonical ones):
- `MessageNode` + each `MessageNodeBody` subclass (13 subclasses)
- `BytableMessage` (v0 and v257)
- `RawMessage`
- `GamePacket` (v0 and v257)

File location: `packages/shared/src/__tests__/serialization.test.ts` and per-package equivalents.

### 0b. Wire snapshot tests

For each major message flow, capture the exact hex output of `serialize()` and assert it never changes:
- `MessageNode` with a known TOMC body → expected hex
- `BytableMessage` v0 (NPS 4-byte header) → expected hex
- `BytableMessage` v257 (NPS 12-byte header) → expected hex
- `RawMessage` with id=0x20e → expected hex

These are the regression gate. If a removal breaks a snapshot, stop and investigate.

### 0c. Session replay baseline

Run `npm run test:session` and record the pass/fail baseline. This suite replays recorded client traffic. It must stay green through every phase.

---

## Phase 1: Remove `NPSMessage`

**Risk:** Low. It's `@deprecated` and is just `extends BytableMessage` with thin wrappers.

1. `grep -r "NPSMessage" packages/ libs/` — find all callsites
2. Replace each with direct `BytableMessage` usage (same API, no behavior change)
3. Delete `packages/shared/src/NPSMessage.ts`
4. Run session tests — must pass before continuing

---

## Phase 2: Remove `OldServerMessage`

**Risk:** Low. It's `@deprecated` and is `extends MessageNode` with a `_header` compatibility shim.

1. `grep -r "OldServerMessage" packages/ libs/`
2. Replace each with `MessageNode` directly
3. Delete `packages/shared/src/OldServerMessage.ts`
4. Run session tests

---

## Phase 3: Remove `MessageNodeOld`

**Risk:** Low-medium. It's `@deprecated` but older than the class-based types; check for any non-obvious usage.

1. `grep -r "MessageNodeOld" packages/ libs/ src/`
2. For each callsite, replace with `MessageNode` (same field layout, same wire format)
3. Delete `packages/shared/src/MessageNodeOld.ts`
4. Run session tests

---

## Phase 4: Migrate `RawMessage` → `BytableMessage` in lobby handlers

**Risk:** Medium. `RawMessage` is actively used in lobby response construction. Wire format must stay identical.

`RawMessage` wire format: `[id:2 BE][length:2 BE][payload]`  
`BytableMessage` v0 wire format: `[id:2 BE][length:2 BE][payload]`

These are the same. The migration is mechanical but requires care.

### Steps:
1. Pick one lobby handler at a time (start with `handleTrackingPing.ts` — simplest)
2. Replace `new RawMessage()` + manual field set with `BytableMessage` using `setSerializeOrder`
3. Add a snapshot test asserting `serialize()` output is bit-for-bit identical before and after
4. Run session tests after each handler migration
5. Once all lobby handlers migrated, delete `packages/shared/src/RawMessage.ts`

**Handlers to migrate** (in `packages/lobby/src/handlers/`):
- `handleTrackingPing.ts`
- `handleOpenCommChannel.ts` (most complex — 3 response messages)
- Remaining handlers

---

## Phase 5: Remove `GamePacket`

**Risk:** Medium. Used as a bridge in `npsPortRouter.ts` for version detection.

The only role `GamePacket` plays is auto-detecting whether an inbound NPS packet is v0 or v257 via `identifyVersion()`. Once we confirm `BytableMessage.deserialize()` handles both versions correctly (it does — it reads the version field from bytes 4-5), the bridge is redundant.

1. Read `npsPortRouter.ts` lines around the `GamePacket` conversion (line 395-396)
2. Verify `BytableMessage` already handles both versions natively
3. Remove the `GamePacket.deserialize(byteableMessage.serialize())` round-trip
4. Run session tests
5. Delete `packages/protocol/src/GamePacket.ts` and related header/payload files if unused

---

## Phase 6: Remove `ServerPacket`

**Risk:** Low-medium. Already `@deprecated`; check for any remaining callsites not caught by the deprecation sweep.

1. `grep -r "ServerPacket" packages/ libs/ src/`
2. Replace remaining callsites with `MessageNode`
3. Delete `packages/protocol/src/ServerPacket.ts`
4. Delete `packages/protocol/src/ServerMessageHeader.ts` and `ServerMessagePayload.ts` if now unused
5. Run session tests

---

## Verification (end of each phase)

- `npm run test:all` — unit + session tests green
- `npm run check:all` — no TypeScript errors
- Manual smoke test: connect a client (or replay a session) and verify login + lobby flow works

## Key Files

- `packages/shared/src/MessageNode.ts` — canonical MCOTS type
- `libs/@rustymotors/binary/src/lib/BytableMessage.ts` — canonical NPS type
- `packages/shared/src/RawMessage.ts` — active, Phase 4 target
- `packages/gateway/src/npsPortRouter.ts` — GamePacket bridge, Phase 5 target
- `packages/gateway/src/mcotsPortRouter.ts` — MessageNode deserialization entry
- `packages/lobby/src/handlers/` — lobby response builders, Phase 4 migration targets
- `packages/protocol/src/` — deprecated types, Phases 1-3 and 6

## Invariant

**Never remove a type until:**
1. All callsites are migrated
2. A snapshot test confirms wire output is identical before and after
3. Session tests pass
