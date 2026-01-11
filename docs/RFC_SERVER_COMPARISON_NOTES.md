# RFC vs Server Implementation - Comparison Notes

**Generated:** 2026-01-11  
**Status:** For review when you return from break

---

## 🔴 Issues / Potential Bugs

### 0. ⚠️ ARCHITECTURAL: Handler ID Field is Dead Code

**Location:** `packages/transactions/src/handlers.ts` + `internal.ts`

The routing logic in `internal.ts` (lines 54-62) works like this:

```typescript
const currentMessageNo = inboundMessage.getMessageId();      // e.g., 324
const currentMessageString = _MSG_STRING(currentMessageNo);  // "MC_GET_LOBBIES"

const result = messageHandlers.find(
    (msg) => msg.name === currentMessageString,              // Match by NAME!
);
```

**The `id` field in `messageHandlers` is NEVER USED for routing.**

This is fragile because:
1. Handler IDs can be wrong (as with MC_GET_LOBBIES below) and still work
2. If a handler is registered but not in `_MSG_STRING()`, it WILL FAIL

**Options:**
- A) Remove the `id` field from handlers (it's unused)
- B) Route by `id` instead of name (more direct, less fragile)
- C) Merge the two arrays into one (single source of truth)

---

### 1. MC_GET_LOBBIES Handler ID Mismatch

**Location:** `packages/transactions/src/handlers.ts`

```typescript
// Handler registration says:
{ id: 325, name: 'MC_GET_LOBBIES', handler: getLobbies }

// But _MSG_STRING mapping says:
{ id: 324, name: "MC_GET_LOBBIES" },  // 0x144
{ id: 325, name: "MC_LOBBIES" },       // 0x145 (response)
```

**Original source confirms:**
```c
MC_GET_LOBBIES = 324,
MC_LOBBIES = 325,
```

**Analysis:** The routing uses `_MSG_STRING(msgNo)` to convert ID → name, then matches by name. So if client sends 324, it works:
- 324 → "MC_GET_LOBBIES" → finds handler with `name: 'MC_GET_LOBBIES'`

But the `id: 325` in the handler is misleading/wrong. The `id` field isn't used for routing, but it could confuse anyone reading the code.

**Question:** What ID does the client actually send? Need to verify with packet capture.

---

### 2. MC_KEEP_RACE_ALIVE (448) WILL FAIL ⚠️

**Location:** `packages/transactions/src/handlers.ts`

The handler is registered (lines 77-80) but **448 is NOT in `_MSG_STRING()`**.

**From original source (MCDefs.h):**
```c
#define MC_KEEP_RACE_ALIVE_SECONDS  (15*60)  // 15 minutes
MC_KEEP_RACE_ALIVE = 448, // Client sends as heartbeat so raceInfo does not get timed-out
```

**This is an MCOTS MessageNode packet** sent via TCP every 15 minutes during a race.

**Result:** If a race lasts 15+ minutes:
1. Client sends MC_KEEP_RACE_ALIVE (448)
2. `_MSG_STRING(448)` → `"Unknown"`
3. `messageHandlers.find(name === "Unknown")` → `undefined`
4. **💥 Error: "UNSUPPORTED_MESSAGECODE: 448 (Unknown)"**
5. Race info gets purged on server, race breaks!

**Fix:** Add to `_MSG_STRING`:
```typescript
{ id: 448, name: "MC_KEEP_RACE_ALIVE" },
```

**Status:** ✅ FIXED - Added to `_MSG_STRING` in handlers.ts

---

### 3. EntryFeePurseMessage Serialization Bug

**Location:** `packages/transactions/src/EntryFeePurseMessage.ts`

```typescript
// Line 38 - size() returns:
return 5 + this._purseEntries.length * 8;

// Line 51 - serialize() allocates:
const neededSize = 5 + this._purseEntries.length * 563;  // BUG!
```

**Issue:** The serialize() method allocates 563 bytes per entry, but PurseEntry is only 8 bytes. This wastes memory and might cause issues if the buffer is inspected/validated.

**Fix:** Change line 51 to `* 8` to match `size()`.

---

### 4. LobbyMessage Size Inconsistency

**Location:** `packages/transactions/src/LobbyMessage.ts`

```typescript
// Line 38 - size() returns:
return 5 + this._lobbyList.length * 567;

// Line 51 - serialize() allocates:
const neededSize = 5 + this._lobbyList.length * 569;

// LobbyInfo.size() returns:
return 569;
```

**Issue:** `size()` uses 567, but `serialize()` and `LobbyInfo.size()` use 569. This is a 2-byte discrepancy per lobby.

---

### 5. LobbyInfo 6-Byte Gap

**Location:** `packages/transactions/src/LobbyMessage.ts`, lines 550-552, 375

In both `serialize()` and `deserialize()`:
```typescript
offset += 6; // What are these 6 bytes?
```

**Question:** What's in this 6-byte gap after `_driverAIEnabled`? Is this padding, unknown fields, or a bug?

---

## 🟡 Missing from Server (Documented in RFC)

### 1. NPS_OK_TO_LOGIN Not in Command Enums

**Location:** `packages/lobby/src/NPS_LOBBYSERVER_COMMANDS.ts`

The `NPS_OK_TO_LOGIN` (0x230 = 560) is sent by `npsPortRouter.ts` but isn't defined in the command enums. It should be added for completeness:

```typescript
{ name: "NPS_OK_TO_LOGIN", value: 560, module: "Lobby" },
{ name: "NPS_Q_POSITION", value: 561, module: "Lobby" },
```

---

### 2. NPS_Q_POSITION Not Implemented

The RFC documents `NPS_Q_POSITION` (0x231) for queue position updates, but this isn't implemented in the server. Low priority since single-server probably doesn't need queuing.

---

### 3. MC_TTB_INFO Not Sent with Lobbies

**Location:** `packages/transactions/src/getLobbies.ts`

The RFC documents that `MC_GET_LOBBIES` returns a bundle:
1. MC_LOBBIES (325) ✅ Implemented
2. MC_ENTRYFEE_PURSE_INFO (408) ✅ Implemented
3. MC_TTB_INFO (Team Trial Bonus) ❓ Not implemented

**Question:** Is TTB info needed? The original server sends it.

---

## 🟢 RFC Matches Implementation Correctly

### 1. MCOTS Framing Header ✅
- MessageNode uses 11-byte header: length(2) + signature(4) + sequence(4) + flags(1)
- Signature is "TOMC" ✅
- Flags match: 0x02=compressed, 0x08=encrypted ✅

### 2. Encryption ✅
- NPS: DES-CBC, 8-byte key from hex string, zero IV, no auto-padding ✅
- MCOTS: RC4, 16-byte key ✅

### 3. Compression ✅
- Uses `pklib-ts` for PKWARE DCL `explode` ✅

### 4. NPS_OK_TO_LOGIN Handshake ✅
- Sent on port 7003 connection ✅
- Packet format: `[0x02, 0x30, 0x00, 0x04]` = msgid 0x230, length 4 ✅

### 5. EntryFeePurse Bundle ✅
- `getLobbies.ts` returns both `lobbiesResponsePacket` and `perseEntriesResponsePacket` ✅

---

## 🔵 Naming/Style Notes

### 1. Typo: "perseEntriesResponsePacket"
**Location:** `packages/transactions/src/getLobbies.ts`, line 71

```typescript
const perseEntryResponse = new EntryFeePurseMessage();
```

Should be `purseEntryResponse`.

---

### 2. Inconsistent Handler Routing (Confusing Design)

The handler routing in `internal.ts` works like this:
1. Get message ID from packet
2. Convert to name via `_MSG_STRING()` ← **sounds like a logging function!**
3. Find handler by matching `handler.name`

This is fragile AND confusing because:
- The `id` field in handlers isn't used for routing
- `_MSG_STRING` sounds like it's for display/logging, but it's **critical for routing**
- If `_MSG_STRING` is missing an entry, the handler won't be found even if registered
- Two parallel data structures must stay in sync

**Cleanup suggestion:** Route directly by ID:
```typescript
const result = messageHandlers.find((h) => h.id === messageId);
```
Then `_MSG_STRING` can be purely for logging as its name suggests.

---

## 📦 Packet Capture Validation

Analyzed captured sessions from `test/fixtures/sessions/`:

### Port 7003 (Lobby) - NPS Protocol ✅

| Direction | Hex | Message ID | Name |
|-----------|-----|------------|------|
| S→C | `02300004` | 0x0230 (560) | NPS_OK_TO_LOGIN |
| C→S | `0100008f...` | 0x0100 (256) | NPS_LOGIN |
| S→C | `01200054...` | 0x0120 (288) | NPS_LOGIN_RESP |
| C→S | `1101000c...` | 0x1101 (4353) | NPS_CRYPTO_DES_CBC |

**RFC vs Captures:** Perfect match! The handshake documentation is accurate.

### Port 43300 (MCOTS) - From Server Logs ✅

| Sequence | Decrypted msgNo | Name | 
|----------|-----------------|------|
| 25 | 440 (0x01B8) | MC_TRACKING_MSG |
| 26 | 361 (0x0169) | MC_GET_PLAYER_RACING_HISTORY |
| 28 | 440 (0x01B8) | MC_TRACKING_MSG |
| 29 | 106 (0x006A) | MC_LOGOUT |

**Decrypted buffers confirm Little-endian msgNo:**
- `69011500...` → `0x0169` = 361 ✅
- `6a000000...` → `0x006a` = 106 ✅

**MCOTS Framing confirmed:**
- `TOMC` signature ✅
- Sequence numbers incrementing correctly ✅
- Encryption/decryption working ✅

### MC_GET_LOBBIES Confirmed from Full Logs ✅

From `/data/Code/server/data/application-2026-01-10-21.log`:

```
Line 889:  Processing message: 324 (MC_GET_LOBBIES), sequence: 5
Line 1058: Sending lobbyResponse: LobbyMessage: msgNo=325
Line 1059: Sending purseEntryResponse: EntryFeePurseMessage: msgNo=408
```

**Decrypted buffer:** `44010000000000000000` → `0x0144` = **324** ✅

| Direction | ID | Name |
|-----------|-----|------|
| Client → Server | **324** | MC_GET_LOBBIES (request) |
| Server → Client | **325** | MC_LOBBIES (response) |
| Server → Client | **408** | MC_ENTRYFEE_PURSE_INFO (bundled) |

**This confirms the handler bug:** The handler in `handlers.ts` says `id: 325` but client sends `324`.

---

## 📝 Questions for You

1. ~~**MC_GET_LOBBIES ID**: Does the client send 324 or 325?~~ **ANSWERED: Client sends 324** ✅

2. **LobbyInfo 6-byte gap**: What fields are in offset 387-392? Is this intentional padding?

3. **MC_TTB_INFO**: Should this be added to the lobby bundle response?

4. **NPS_LOBBYSERVER_COMMANDS range**: The enum values (513-559) map to 0x201-0x22F. But NPS_OK_TO_LOGIN (0x230 = 560) would be the next one. Is the gap intentional?

5. **Should I fix the bugs?** The EntryFeePurseMessage allocation bug and LobbyMessage size inconsistency.

---

## 📊 Summary

| Category | Count |
|----------|-------|
| 🔴 Potential Bugs | 6 (1 architectural, 1 critical, 4 minor) |
| 🟡 Missing Features | 3 |
| 🟢 Correct | 5 |
| 🔵 Style Issues | 2 |

**Priority:**
1. ~~**Critical:** MC_KEEP_RACE_ALIVE (448)~~ ✅ FIXED
2. **Architectural:** Handler routing by name (fragile + confusingly named)
3. **Minor:** The other bugs work but are confusing/wasteful

---

*Take your time. These aren't urgent - the server works. These are just notes for cleanup when you're ready.*
