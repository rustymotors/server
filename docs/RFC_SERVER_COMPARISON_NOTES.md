# RFC vs Server Implementation - Comparison Notes

**Generated:** 2026-01-11  
**Status:** For review when you return from break

---

## 🔴 Issues / Potential Bugs

### 0. ~~ARCHITECTURAL: Handler ID Field is Dead Code~~ ✅ FIXED

**Status:** ✅ FIXED - Now routes by `handler.id` instead of name. `_MSG_STRING` is now only used for logging.

---

### 1. ~~MC_GET_LOBBIES Handler ID Mismatch~~ ✅ FIXED

**Status:** ✅ FIXED - Handler ID corrected to 324, and routing now uses ID directly.

---

### 2. ~~MC_KEEP_RACE_ALIVE (448) WILL FAIL~~ ✅ FIXED

**Status:** ✅ FIXED - Added to `_MSG_STRING` for logging, and now routes by handler ID directly.

---

### 3. ~~EntryFeePurseMessage Serialization Bug~~ ✅ FIXED

**Status:** ✅ FIXED - Changed allocation from 563 to 8 bytes per PurseEntry.

---

### 4. ~~LobbyMessage Size Inconsistency~~ ✅ FIXED

**Status:** ✅ FIXED - `size()` now correctly returns 569 bytes per LobbyInfo.

---

### 5. ~~LobbyInfo 6-Byte Gap~~ ✅ FIXED

**Status:** ✅ FIXED - The 6-byte gap was caused by:
1. Missing `bdamagedefault` and `bdamageenabled` fields (4 bytes)
2. `teamTrialsBaseTimeUnderPar` was WORD instead of DWORD (2 bytes)

Added `_defaultDamage` and `_damageEnabled` fields, fixed `teamTrialsBaseTimeUnderPar` to 4 bytes.

---

## 🟡 Missing from Server (Documented in RFC)

### 1. ~~NPS_OK_TO_LOGIN Not in Command Enums~~ ✅ N/A

**Status:** N/A - The `NPS_LOBBY*_COMMANDS.ts` files were unused and have been deleted. Command definitions are tracked in the RFC and actual handler code instead.

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
