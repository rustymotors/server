# Two-Player Race Flow

> Derived from session captures, handler implementations, and protocol analysis.
> No external source material.

## Overview

A two-player race requires clients to traverse two distinct port layers. The lobby
(port 7003) handles identity, matchmaking, and race start signalling. Race room
ports (9000–9020) carry the real-time relay traffic once both players are in the sim.

The relay handlers that make multiplayer work are different on each layer. This
document maps the exact opcode sequence and identifies where the current
implementation breaks for two players.

---

## Phase 1 — Login and Lobby (port 7003)

Both clients connect independently. Steps are identical for each.

| # | Direction | Opcode | Handler | Notes |
|---|-----------|--------|---------|-------|
| 1 | C→S | `0x100` USER_LOGIN | `handleUserLogin` | Validates session key |
| 2 | S→C | `0x230` OK_TO_LOGIN | — | Session confirmed |
| 3 | C→S | `0x106` OPEN_COMM_CHANNEL (commId=0) | `handleOpenCommChannel` | Lobby channel join |
| 4 | S→C | `0x214` CHANNEL_GRANTED | — | commId=0, port=7003 |
| 5 | S→C | `0x20C` USER_JOINED_CHANNEL | — | Self-notify |
| 6 | C→S | `0x302` SEND_RIFF_LIST | `handleSendRiffList` | Request available races |
| 7 | S→C | `0x302` SEND_RIFF_LIST | — | List of open race rooms |

Side effects at step 3 (lobby `handleOpenCommChannel`):
- `joinChannel(connectionId, 0)` — adds connection to commId=0 in ChannelMembership
- `setConnectionUserId(connectionId, userId)` — maps userId↔connectionId

---

## Phase 2 — Race Host starts the server (Client A, port 7003)

Client A creates a race and signals ready to launch.

| # | Direction | Opcode | Handler | Notes |
|---|-----------|--------|---------|-------|
| 8 | C→S | `0x1101` ENCRYPTED_COMMAND wrapping `0x10A` START_GAME_SERVER | `handleStartGameServer` | Includes commId and host IP |
| 9 | S→C | `0x20D` NPS_SERVER_INFO | — | Race server IP + port (9000) |
| 9 | S→C | `0x20C` USER_JOINED_CHANNEL | — | For the race channel |
| 9 | S→C | `0x21C` NPS_GAME_SERVER_STARTED | — | Launch signal |

`handleStartGameServer` also broadcasts all three packets to every
`getChannelMembers(commId)` entry. **This is where two-player breaks today** —
if Client B joined the lobby channel (commId=0, not commId=raceX), they are not
in `getChannelMembers(raceX)` and don't receive the start signal.

However, if Client B has already opened the race channel (joined commId=raceX on
port 7003), `getChannelMembers(raceX)` finds them and the broadcast works.

---

## Phase 3 — Race Channel on port 9000 (both clients)

After receiving `NPS_SERVER_INFO` with port=9000, both clients open a TCP
connection to port 9000 and repeat a join sequence for the race room.

| # | Direction | Opcode | Handler | Notes |
|---|-----------|--------|---------|-------|
| 10 | C→S | `0x100` USER_LOGIN | rooms `handleUserLogin` | Re-auth on race port |
| 11 | C→S | `0x106` OPEN_COMM_CHANNEL (commId=raceX) | rooms `handleOpenCommChannel` | Race room join |
| 12 | S→C | `0x20E` CHANNEL_CREATED | — | Race channel descriptor |
| 12 | S→C | `0x214` CHANNEL_GRANTED | — | commId=raceX, port=9000 |
| 12 | S→C | `0x20C` USER_JOINED_CHANNEL | — | Self-notify |
| 13 | C→S | `0x217` TRACKING_PING | rooms `handleTrackingPing` | Keepalive, periodic |
| 14 | C→S | `0x95` SEND_SINGLE_LONG | **NOT REGISTERED** | Targeted relay (position?) |
| 14 | C→S | `0x97` SEND_NOT_SINGLE_LONG | **NOT REGISTERED** | Broadcast relay |
| 14 | C→S | `0x93` SEND_BUDDY_LONG | **NOT REGISTERED** | Buddy-targeted relay |

Step 11 side effects in the **current rooms `handleOpenCommChannel`**:
- Adds user to `PrimaryRoomServer` room/user list ✓
- **Does NOT call `joinChannel(connectionId, commId)`** ✗

Because `joinChannel` is never called on race ports, `getChannelMembers(commId)`
returns `[]` for race channels. The relay handlers (when registered) would
silently deliver to nobody.

---

## Root Causes — Two Players Never See Each Other

### Bug 1: ChannelMembership not populated on race ports

`libs/@rustymotors/rooms/src/handlers/handleOpenCommChannel.ts` tracks users
in `PrimaryRoomServer` only. The relay handlers query `ChannelMembership`
(via `getChannelMembers`, `getConnectionIdByUserId`). These two systems never
share data.

**Fix**: Add `joinChannel(connectionId, commId)` and
`setConnectionUserId(connectionId, userId)` calls to rooms `handleOpenCommChannel`.
Mirror the same side effects as lobby `handleOpenCommChannel`.

### Bug 2: Relay opcodes not registered in rooms registry

`libs/@rustymotors/rooms/src/handlers/registry.ts` registers 5 handlers.
The relay opcodes `0x93 / 0x95 / 0x97` are completely absent. The handler
files exist (`handleSendSingleLong.ts` etc.) but are stubs and unregistered.

**Fix**: Replace stubs with the working implementations from
`packages/lobby/src/handlers/` (or port the logic in), then register all
relay opcodes in the rooms registry.

### Also missing from rooms registry

These handlers have files in the rooms lib but are also not registered:

| Opcode | Name | File exists | Registered |
|--------|------|-------------|------------|
| `0x101` | GET_USER_LIST | ✓ | ✗ |
| `0x103` | SET_MY_USER_DATA | ✓ | ✗ |
| `0x105` | CLOSE_COMM_CHANNEL | ✓ | ✗ |
| `0x10C` | GET_SERVER_INFO | ✓ | ✗ |
| `0x10D` | SET_COMM_FLAGS | — | ✗ |
| `0x10E` | GET_READY_LIST | ✓ | ✗ |
| `0x113` | SET_CHANNEL_DATA | ✓ | ✗ |
| `0x128` | GET_MINI_USER_LIST | ✓ | ✗ |
| `0x302` | SEND_RIFF_LIST | ✓ | ✗ |
| `0x30C` | SEND_MINI_RIFF_LIST | ✓ | ✗ |
| `0x309` | SEND_GAME_SERVERS_LIST | ✓ | ✗ |
| `0x93`  | SEND_BUDDY_LONG | ✓ (stub) | ✗ |
| `0x95`  | SEND_SINGLE_LONG | ✓ (stub) | ✗ |
| `0x97`  | SEND_NOT_SINGLE_LONG | ✓ (stub) | ✗ |
| `0x10A` | START_GAME_SERVER | ✓ | ✗ |

---

## Implementation Plan

### Pre-step (this document) ✓

### Phase 1 — Fix ChannelMembership population in rooms

File: `libs/@rustymotors/rooms/src/handlers/handleOpenCommChannel.ts`

Add after extracting `commId` and `userId`:
```ts
import { joinChannel, setConnectionUserId } from 'rusty-motors-shared';

// After userId and commId extracted:
joinChannel(connectionId, commId);
setConnectionUserId(connectionId, userId);
```

Add matching cleanup in a `handleCloseCommChannel` or on disconnect
(`leaveAllChannels` is already called in the gateway's disconnect handler, so
cleanup is already covered).

### Phase 2 — Replace relay stubs and register in rooms registry

For `SEND_SINGLE_LONG`, `SEND_NOT_SINGLE_LONG`, `SEND_BUDDY_LONG`,
`START_GAME_SERVER`: the lobby implementations are port-agnostic (they only
use `rusty-motors-shared` APIs). Two options:

**Option A (preferred)**: Import lobby handlers directly into rooms registry.
No code duplication, single implementation.

**Option B**: Copy logic into rooms stubs. More isolated but creates drift risk.

Use Option A.

### Phase 3 — Register remaining rooms handlers

All the existing rooms handler files (GET_USER_LIST, GET_READY_LIST, etc.) need
to be registered in `registry.ts`. They have implementations; they just aren't
wired up.

### Phase 4 — Multi-client tests on race port

Extend `packages/gateway/test/session/multiClient.test.ts` to verify:
- Two clients joining the same commId on port 9000 both appear in `getChannelMembers`
- Relay from Client A on port 9000 reaches Client B on port 9000

### Phase 5 — Session capture verification (Friday, when Windows PC arrives)

Generate captures from two real clients racing. Add session replay tests.
Confirm Phase 1-3 fixes actually produce two-player race parity with NovaServ.
