# Motor City Online Protocol Specification

## Cleanroom Reference Document

**Status:** Informational (Cleanroom Specification)
**Version:** 0.2.0
**Date:** 2026-01-20

### Changelog

| Version | Date | Changes |
|---------|------|---------|
| 0.2.0 | 2026-01-20 | Added section 4.6: Room/Game Server Protocol (ports 9000-9014, 9500-9508) |
| 0.1.0 | 2026-01-11 | Initial release |

---

## Abstract

This document describes the network protocol used by Motor City Online (MCO), 
an online racing game developed by Electronic Arts and operated from 2001-2003.
The protocol consists of two distinct subsystems: the NPS (Network Programming 
System) protocol for lobby/game coordination, and the MCOTS (Motor City Online 
Transaction Server) protocol for game state transactions.

This specification was developed through cleanroom reverse engineering 
methodology, based on:
- Observation of network traffic
- Analysis of client debug log output
- Study of client behavior patterns
- Protocol experimentation

No proprietary source code or confidential documentation was used in its 
creation. Message names and identifiers were derived from publicly observable 
client debug output.

The purpose of this document is to enable development of compatible server 
software for historical preservation and educational purposes.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Conventions and Terminology](#2-conventions-and-terminology)
3. [Data Types (EBNF)](#3-data-types-ebnf)
4. [NPS Protocol (Lobby/Game)](#4-nps-protocol-lobbygame)
5. [MCOTS Protocol (Transactions)](#5-mcots-protocol-transactions)
6. [Connection Flow](#6-connection-flow)
7. [Encryption](#7-encryption)
8. [Compression](#8-compression)
9. [Message Catalog](#9-message-catalog)
10. [Race Protocol](#10-race-protocol)
11. [Appendix A: Message ID Tables](#appendix-a-message-id-tables)
12. [Appendix B: Known Unknowns](#appendix-b-known-unknowns)

---

## 1. Introduction

Motor City Online uses a multi-server architecture with distinct protocol 
layers:

| Component | Purpose | Default Port(s) | Byte Order |
|-----------|---------|-----------------|------------|
| **Login Server** | Authentication, persona management | 8226 | Big-endian |
| **Lobby Server (PLS)** | Game room coordination, chat | 7003 | Big-endian |
| **Game/Room Servers** | In-race communication, game state | 9000-9014 (TCP), 9500-9508 (UDP) | Big-endian |
| **MCOTS** | Game transactions (vehicles, races, etc.) | 43300 | Little-endian |

### 1.1. Document Scope

This document covers:
- ✅ Packet framing and serialization
- ✅ Message IDs and structures  
- ✅ Login and connection handshakes
- ✅ NPS lobby protocol
- ✅ MCOTS transaction protocol

This document does NOT cover:
- ❌ Graphics, rendering, or 3D assets
- ❌ Game physics or simulation logic
- ❌ Database schema or stored procedures
- ❌ Client-side implementation details

---

## 2. Conventions and Terminology

### 2.1. Notation

This document uses:
- **EBNF** (Extended Backus-Naur Form) for grammar definitions
- **Augmented Packet Header Diagrams** per [draft-mcquistin-augmented-ascii-diagrams](https://datatracker.ietf.org/doc/html/draft-mcquistin-augmented-ascii-diagrams-10)

### 2.2. Byte Order

| Protocol | Byte Order | Notes |
|----------|------------|-------|
| NPS | Network (Big-endian) | Standard network byte order |
| MCOTS | Native (Little-endian) | x86 native, tightly packed structures |

### 2.3. Key Terms

- **NPS**: Network Programming System - lobby/matchmaking protocol layer
- **MCOTS**: Motor City Online Transaction Server - game state protocol layer
- **PLS**: Primary Lobby Server - the main lobby server on port 7003
- **Persona**: A player character/profile within a customer account
- **Customer**: The EA account holder (may have multiple personas)
- **Shard**: A game server cluster
- **Riff**: A room/channel identifier string (32 bytes max)
- **CommId**: Communication channel identifier returned when joining a room
- **Channel**: A communication room that players join for racing or chat

### 2.4. Naming Conventions

This document uses symbolic names for message IDs and constants derived from:
- **Client debug log output** - Message names appear in client debug logs 
  (e.g., `dblog.log`) when running debug builds, providing observable string 
  identifiers for message types
- Protocol behavior patterns (e.g., `NPS_` prefix for lobby messages, 
  `MC_` prefix for MCOTS messages)
- Functional purpose inferred from observed behavior
- Community conventions established during preservation efforts

These names were obtained through legitimate cleanroom observation of publicly 
accessible debug output and network traffic analysis.

---

## 3. Data Types (EBNF)

### 3.1. Primitive Types

```ebnf
(* Unsigned integers *)
uint8   = 8 * BIT ;
uint16  = 16 * BIT ;
uint32  = 32 * BIT ;

(* Signed integers *)
int8    = 8 * BIT ;
int16   = 16 * BIT ;
int32   = 32 * BIT ;

(* MCOTS protocol types (little-endian) *)
BYTE    = uint8 ;
WORD    = uint16 ;
DWORD   = uint32 ;
BOOL    = uint32 ;  (* 4-byte boolean, 0=false, non-zero=true *)

(* Floating point *)
float32 = 32 * BIT ;   (* IEEE 754 single precision *)
double64 = 64 * BIT ;  (* IEEE 754 double precision *)
```

### 3.2. String Types

NPS protocol uses Pascal-style strings (length-prefixed), while MCOTS uses 
fixed-size null-terminated fields.

```ebnf
(* NPS strings: 16-bit length prefix followed by character data *)
(* Length prefix is in network byte order (big-endian) *)
nps-string = 
    length: uint16 ,             (* number of bytes that follow *)
    data: length * uint8 ;       (* NOT null-terminated *)

(* MCOTS strings: fixed-size, null-terminated *)
mc-string-13 = 13 * uint8 ;   (* observed name field length *)
mc-string-30 = 30 * uint8 ;   (* observed extended name length *)

(* C-style null-terminated string *)
cstring = { uint8 - NULL } , NULL ;
NULL = %x00 ;
```

**NPS String Serialization:**
- The 16-bit length prefix indicates the exact byte count of the string data
- String data follows immediately after the length prefix
- Strings are NOT null-terminated in the wire format
- Empty strings are encoded as `0x0000` (length = 0, no data bytes)

### 3.3. NPS Type Aliases

```ebnf
NPS_MSGID    = uint16 ;
NPS_MSGLEN   = uint16 ;
NPS_USERID   = uint32 ;
NPS_LOGINID  = uint32 ;
NPS_CUSTOMERID = uint32 ;
NPS_GAMEID   = uint32 ;
NPS_LOBBYID  = uint32 ;
NPS_ROOMID   = uint32 ;
NPS_COMMID   = int32 ;
NPS_SERVID   = int32 ;
```

### 3.4. MCOTS Type Aliases

```ebnf
MCOTS_INSTANCEID = DWORD ;
MCOTS_INTRAID    = DWORD ;
PersonaID        = DWORD ;
CustomerID       = DWORD ;
VehicleID        = DWORD ;
PartID           = DWORD ;
BrandedPartID    = DWORD ;
RaceID           = MCOTS_INTRAID ;
TradeID          = MCOTS_INTRAID ;
```

---

## 4. NPS Protocol (Lobby/Game)

The NPS protocol handles authentication, lobby management, and game message 
routing. All multi-byte integers are transmitted in **network byte order** 
(big-endian).

### 4.1. NPS Message Header

An NPS Message Header is formatted as follows:

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|           Message ID          |         Message Length        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|        Message Version        |           Unknown             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                           Checksum                            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

where:

- **Message ID**: 2 bytes. Identifies the message type.
- **Message Length**: 2 bytes. Total length of message including header.
- **Message Version**: 2 bytes. Protocol version for this message type.
- **Unknown**: 2 bytes. Purpose unknown; always observed as 0.
- **Checksum**: 4 bytes. Observed to contain the message length value (used for validation).

```ebnf
NPS_Header = 
    message-id: NPS_MSGID ,
    message-length: NPS_MSGLEN ,
    message-version: uint16 ,
    unknown: uint16 ,            (* always observed as 0 *)
    checksum: uint32 ;

NPS_HEADER_LENGTH = 12 ;  (* bytes *)
```

**Header Versions:**

Two header versions have been observed:

| Version | Size | Format |
|---------|------|--------|
| 0 | 4 bytes | id(2) + length(2) only |
| 257 (0x101) | 12 bytes | Full header as shown above |

Version 0 appears to be used for simple/legacy messages, while version 257 
is the standard format for most NPS communication.

### 4.2. NPS Login Request (0x501)

A User Login Request is formatted as follows:

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
+                          NPS Header                           +
|                                                               |
+                                                               +
|                                                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
+                                                               +
|                                                               |
+                           Username                            +
|                             (32 bytes)                        |
+                                                               +
|                                                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
+                           User Data                           +
|                            (64 bytes)                         |
+                                                               +
:                              ...                              :
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                          Customer ID                          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
+                          Key Hash                             +
|                           (16 bytes)                          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
:                             ...                               :
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

where:

- **NPS Header**: 12 bytes. Standard NPS message header with ID = 0x501.
- **Username**: 32 bytes. Null-terminated username.
- **User Data**: 64 bytes. User-controllable blob.
- **Customer ID**: 4 bytes. EA customer account identifier.
- **Key Hash**: 16 bytes. CD key hash for validation.

### 4.3. NPS User Valid Response (0x601)

Sent by login server upon successful authentication.

```ebnf
NPS_UserValid =
    header: NPS_Header ,       (* id = 0x601 *)
    customer-id: NPS_CUSTOMERID ,
    persona-count: uint8 ,
    personas: { NPS_PersonaInfo } ;
```

### 4.4. NPS Open Comm Channel (0x106)

Request to join a lobby/game channel.

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
+                          NPS Header                           +
|                                                               |
+                                                               +
|                                                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                        Connection ID                          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                          Comm ID                              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                          Protocol                             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
+                           Riff Name                           +
|                           (32 bytes)                          |
+                                                               +
:                              ...                              :
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
+                           Password                            +
|                           (17 bytes)                          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
:                              ...                              :
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

where:

- **Connection ID**: 4 bytes. User's connection identifier (NPS_USERID).
- **Comm ID**: 4 bytes. Channel identifier (NPS_COMMID).
- **Protocol**: 4 bytes. Transport protocol (33=TCP, 44=UDP, 55=UDP preferred).
- **Riff Name**: 32 bytes. Channel/room identifier string.
- **Password**: 17 bytes. Channel password if private.

### 4.5. NPS Game Message Routing

Game messages (IDs 0x80-0x9A) are routed between players via the lobby
server. The message ID indicates the routing behavior:

| ID | Name | Description |
|--------|------|-------------|
| 0x80 | NPS_SEND_ALL | Broadcast to all channel members |
| 0x81 | NPS_SEND_PLUG_IN | Send to plug-in handler |
| 0x82 | NPS_SEND_GAME_READY_LIST | Send to ready players |
| 0x83 | NPS_SEND_LIST | Send to specified user list |
| 0x86 | NPS_SEND_SINGLE | Send to single user |
| 0x87 | NPS_SEND_NOT_SINGLE | Send to all except one user |
| 0x88 | NPS_GAME_MESSAGE | Generic game message |

### 4.6. Room/Game Server Protocol

Game/Room servers handle in-race communication and game state synchronization.
They use the same NPS protocol as the lobby server but with additional
room-specific message handling.

#### 4.6.1. Port Allocation

| Type | Port Range | Count | Purpose |
|------|------------|-------|---------|
| TCP Game Servers | 9000-9014 | 15 | Reliable in-race messages |
| UDP Game Servers | 9500-9508 | 9 | Fast position/state updates |

**Note:** Port 5050 appears to be explicitly reserved/ignored.

#### 4.6.2. Room Message Opcodes

**Client → Server Commands (0x1xx range):**

| Opcode | Name | Description |
|--------|------|-------------|
| 0x100 | NPS_LOGIN | Initial authentication to server |
| 0x103 | NPS_SET_MY_USER_DATA | Send user data (car, level, etc.) |
| 0x104 | NPS_LOG_OFF_SERVER | Disconnect from server |
| 0x105 | NPS_CLOSE_COMM_CHANNEL | Leave a room/channel |
| 0x106 | NPS_OPEN_COMM_CHANNEL | Join or create a room |
| 0x108 | NPS_START_GAME | Force start the game |
| 0x109 | NPS_READY_FOR_GAME | Set player ready state |
| 0x10A | NPS_START_GAME_SERVER | Request game server launch |
| 0x10D | NPS_SET_COMM_FLAGS | Set channel flags (ready state, etc.) |
| 0x10E | NPS_GET_READY_LIST | Request list of ready players |
| 0x113 | NPS_SET_CHANNEL_DATA | Send room/race configuration |
| 0x117 | NPS_BOOT_USER_FROM_CHANNEL | Kick user from room |
| 0x11D | NPS_TERMINATE_GAME_SERVER | End game server |

**Server → Client Commands (0x2xx range):**

| Opcode | Name | Description |
|--------|------|-------------|
| 0x201 | NPS_FORCE_LOGOFF | Server forcing disconnect |
| 0x202 | NPS_USER_LEFT | User left server |
| 0x203 | NPS_USER_JOINED | User joined server |
| 0x208 | NPS_USER_LEFT_CHANNEL | User left room |
| 0x20C | NPS_USER_JOINED_CHANNEL | User joined room |
| 0x20E | NPS_CHANNEL_CREATED | New room created |
| 0x20F | NPS_CHANNEL_DELETED | Room removed |
| 0x210 | NPS_READY_LIST | List of ready players |
| 0x211 | NPS_USER_LIST | Full user list |
| 0x213 | NPS_CHANNEL_DENIED | Wrong password / access denied |
| 0x214 | NPS_CHANNEL_GRANTED | Successfully joined room |
| 0x215 | NPS_CHANNEL_CONDITIONAL | Joined opaque channel (can't ready) |
| 0x219 | NPS_CHANNEL_UPDATE | Room info changed |
| 0x21C | NPS_GAME_SERVER_STARTED | Game server is running |
| 0x21D | NPS_GAME_SERVER_TERMINATED | Game server ended |
| 0x224 | NPS_GAME_SERVER_STATE_CHANGE | Server state transition |
| 0x227 | NPS_CHANNEL_MASTER | Channel ownership info |

#### 4.6.3. Channel Types and Flags

**Channel Types:**

| Value | Name | Description |
|-------|------|-------------|
| 0x01 | NPS_PRIVATE_CHANNEL | Password required |
| 0x02 | NPS_PUBLIC_CHANNEL | Open to all |
| 0x04 | NPS_OPAQUE_CHANNEL | Can join but not ready without password |
| 0x08 | NPS_PERMANENT_CHANNEL | Persistent room |
| 0x10 | NPS_TRANSIENT_CHANNEL | Closes when empty |

**Channel Flags:**

| Value | Name | Description |
|-------|------|-------------|
| 0x20 | NPS_SET_GAME_READY | Mark player ready |
| 0x40 | NPS_CLEAR_GAME_READY | Mark player not ready |
| 0x80 | NPS_HIDE_CHANNEL | Hidden room |
| 0x100 | NPS_EXPOSE_CHANNEL | Visible room |

#### 4.6.4. Room Channel Data Structure (256 bytes, MSVC default packing, little-endian)

```ebnf
RoomChannelData =
    raceID: int32 ,                (* +0   Database race ID *)
    raceName: char[64] ,           (* +4   Room/pit name, null-padded *)
    entryFee: int32 ,              (* +68  *)
    purseBonusPerPlayer: int32 ,   (* +72  *)
    purseBonusPerRace: int32 ,     (* +76  *)
    racerCounts: BYTE ,            (* +80  maxNPSracers:4 | minNPSracers:4<<4 *)
    roundLaps: BYTE ,              (* +81  numRounds:4    | numLaps:4<<4 *)
    flags: BYTE ,                  (* +82  See flags bitfield below *)
    _pad: BYTE ,                   (* +83  alignment padding *)
    mode: int32 ,                  (* +84  eRoomMode enum *)
    sponsorBPT: uint32 ,           (* +88  *)
    minlevel: BYTE ,               (* +92  *)
    maxlevel: BYTE ,               (* +93  *)
    requiredBodyClass: BYTE ,      (* +94  *)
    maxPowerClass: BYTE ,          (* +95  *)
    bDisallowNOS: int32 ,          (* +96  BOOL stored as 4-byte int *)
    statusFlags: BYTE ,            (* +100 raceInProgress:1 | connectedPlayers:4<<1 *)
    _pad2: BYTE[3] ,               (* +101 alignment padding *)
    hostID: uint32 ,               (* +104 NPS_USERID *)
    hostName: char[30] ,           (* +108 Persona name, null-padded *)
    _pad3: BYTE[2] ,               (* +138 alignment padding *)
    userIDs: uint32[6] ,           (* +140 Player user IDs *)
    dbCarIDs: int32[6] ,           (* +164 Car database IDs *)
    dbBptIDs: int32[6] ,           (* +188 BPT database IDs *)
    majorVersionNum: uint32 ,      (* +212 *)
    minorVersionNum: uint32 ,      (* +216 *)
    revisionVersionNum: uint32 ,   (* +220 *)
    _pad4: BYTE[32] ;              (* +224 padding to 256 bytes *)
```

**Flags Bitfield (+82):**
- bit 0: backwardRace
- bit 1: mirrored
- bit 2: nightDriving
- bit 3: weatherDriving
- bits 4-5: damageMode
- bit 6: traffic
- bit 7: handicapped

**StatusFlags Bitfield (+100):**
- bit 0: raceInProgress
- bits 1-4: connectedPlayers (0-6)

**bDisallowNOS (+96):** 4-byte int32 (C BOOL); non-zero = NOS disabled.

**Room Modes (eRoomMode):**

| Value | Name | Description |
|-------|------|-------------|
| 0 | RM_OPEN | Open race |
| 1 | RM_SPONSORED | Sponsored race |
| 2 | RM_CLUB | Club race |
| 3 | RM_PINKSLIP | Pink slip race |
| 4 | RM_TEAMTRIAL | Team trial |

#### 4.6.5. User Data Structure (64 bytes max)

```ebnf
UserData =
    carIDs: tCarIDs ,              (* 40 bytes *)
    lobbyID: DWORD ,
    clubID: DWORD ,
    flags: BYTE ,                  (* See flags bitfield below *)
    performance: uint24 ,          (* mps, acc, handling encoded *)
    points: DWORD ,
    level: WORD ;
```

**User Data Flags:**
- bit 0: IsInLobby
- bit 1: IsInTransition
- bit 2: IsRacing
- bit 3: IsDataValid (must be TRUE for valid data)

#### 4.6.6. Game Server State Machine

**States:**

| Value | Name |
|-------|------|
| 1 | NPS_SERVER_NOT_RUNNING |
| 2 | NPS_SERVER_START_PENDING |
| 4 | NPS_SERVER_RUNNING |
| 8 | NPS_CHANNEL_CLOSED_MASK |

**State Transitions:**

```
NOT_RUNNING → START_PENDING → RUNNING → NOT_RUNNING
     ↑                            │
     └────────────────────────────┘
```

#### 4.6.7. Room Join Flow

**Step 1: Client Request**

Client → Server: `NPS_OPEN_COMM_CHANNEL` (0x106)

Payload:
- ServerId (from login)
- Protocol (NPSTCP=33 or NPSUDP=44)
- Riff (room name, 32 bytes)
- Password (17 bytes max)
- ChannelData (256 bytes, race config)
- MaxReadyPlayers
- ChannelType (PUBLIC/PRIVATE based on password presence)
- ChannelFlags

**Step 2: Server Response**

Server → Client: One of:
- `NPS_CHANNEL_GRANTED` (0x214) = Success, returns CommId
- `NPS_CHANNEL_DENIED` (0x213) = Wrong password
- `NPS_CHANNEL_CONDITIONAL` (0x215) = Joined but can't ready

#### 4.6.8. Game Server Startup Sequence

```
1. Host calls NPSStartGameServer(ServerId, CommId)
   → Sends NPS_START_GAME_SERVER (0x10A)

2. Server broadcasts NPS_GAME_SERVER_STATE_CHANGE (0x224)
   State = NPS_SERVER_START_PENDING (2)

3. When server ready, broadcasts NPS_GAME_SERVER_STATE_CHANGE (0x224)
   State = NPS_SERVER_RUNNING (4)

4. Server sends NPS_GAME_SERVER_STARTED (0x21C) with:
   - Riff (room name)
   - CommId
   - IpAddress (16 bytes)
   - Port
   - UserId (game server's ID)
   - NumberOfPlayers

5. Clients connect directly to game server at IpAddress:Port

6. When race ends: NPS_GAME_SERVER_TERMINATED (0x21D)
```

**Running Server Info Structure:**

| Offset | Size | Field |
|--------|------|-------|
| 0x00 | 32 | Riff (room name) |
| 0x20 | 4 | CommId |
| 0x24 | 16 | IpAddress (string) |
| 0x34 | 4 | Port |
| 0x38 | 4 | UserId (game server NPS ID) |
| 0x3C | 4 | NumberOfPlayers |

#### 4.6.9. Complete Room Session Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. NPSConnectToServer() → Connect to PLS (port 7003)            │
│    Returns: ServerId                                             │
├─────────────────────────────────────────────────────────────────┤
│ 2. NPSAddCommChannel() → Join/Create Room                        │
│    Input: ServerId, Riff, Password, ChannelData                  │
│    Returns: CommId (or error)                                    │
├─────────────────────────────────────────────────────────────────┤
│ 3. NPSSetMyUserData() → Send car/player info                     │
├─────────────────────────────────────────────────────────────────┤
│ 4. NPSSetCommChannelFlags(NPS_SET_GAME_READY) → Mark ready       │
├─────────────────────────────────────────────────────────────────┤
│ 5. NPSGetReadyList() → Poll ready players                        │
├─────────────────────────────────────────────────────────────────┤
│ 6. When all ready: NPSStartGameServer()                          │
│    → Receive NPS_GAME_SERVER_STATE_CHANGE messages               │
├─────────────────────────────────────────────────────────────────┤
│ 7. Receive NPS_GAME_SERVER_STARTED with connection info          │
│    → Connect to game server IP:Port (ports 9000-9014)            │
├─────────────────────────────────────────────────────────────────┤
│ 8. Race occurs (game messages on TCP channel 0, UDP channel 1)   │
├─────────────────────────────────────────────────────────────────┤
│ 9. Receive NPS_GAME_SERVER_TERMINATED                            │
├─────────────────────────────────────────────────────────────────┤
│ 10. NPSCloseCommChannel() → Leave room                           │
├─────────────────────────────────────────────────────────────────┤
│ 11. NPSLogOffServer() → Disconnect from PLS                      │
└─────────────────────────────────────────────────────────────────┘
```

#### 4.6.10. NPS Error Codes

| Code | Name | Description |
|------|------|-------------|
| 0 | NPS_OK | Success |
| -4 | NPS_ERR_SERVER_FULL | Room/server full |
| -12 | NPS_GAME_NOT_FOUND | Game server not found |
| -20 | NPS_SERVER_NOT_FOUND | Server offline |
| -33 | NPS_PASSWORD_CHECK_FAILED | Authentication failure |
| -52 | NPS_NOT_ENOUGH_PLAYERS | Can't start race |
| -72 | NPS_ROOM_NOT_FOUND | Room doesn't exist |

#### 4.6.11. String Length Constants

| Constant | Value |
|----------|-------|
| NPS_HOSTNAME_LEN | 64 |
| NPS_RIFF_NAME_LEN | 32 |
| NPS_GAMENAME_LEN | 64 |
| NPS_PASSWORD_LEN | 17 |
| NPS_USERNAME_LEN | 32 |
| NPS_USERDATA_LEN | 64 |
| NPS_CHANNEL_DATA_SIZE | 256 |
| NPS_SESSION_KEY_LEN | 32 |
| NPS_IPADDR_LEN | 16 |

---

## 5. MCOTS Protocol (Transactions)

The MCOTS protocol handles all game state transactions: vehicles, parts, 
races, trading, clubs, etc. All multi-byte integers are transmitted in 
**little-endian** byte order (native Windows x86).

### 5.1. MCOTS Message Framing

All MCOTS messages are wrapped in an 11-byte framing header, followed by 
the message body. The framing header uses the signature "TOMC" (MCOT reversed).

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|         Body Length           |         Signature ...         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|       ... Signature           |                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+                               +
|                           Sequence                            |
+                               +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                               | Flags |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

where:

- **Body Length**: 2 bytes (little-endian). Length of data following this 
  field: signature(4) + sequence(4) + flags(1) + body = `9 + body.length`
- **Signature**: 4 bytes. ASCII string "TOMC" (0x54 0x4F 0x4D 0x43).
- **Sequence**: 4 bytes (little-endian, signed). Message sequence number.
  **⚠️ CRITICAL:** Messages MUST be processed in sequence order. The RC4 
  stream cipher state evolves with each byte - processing out of order will 
  cause cipher desynchronization and corrupt all subsequent messages.
- **Flags**: 1 byte. Bit flags for message properties.

```ebnf
MCOTS_FramingHeader =
    bodyLength: uint16 ,         (* 9 + message body size *)
    signature: 4 * uint8 ,       (* "TOMC" = 0x544F4D43 *)
    sequence: int32 ,
    flags: uint8 ;

MCOTS_HEADER_LENGTH = 11 ;       (* bytes *)

(* Flag bit definitions *)
MCOTS_FLAG_NONE                = 0x00 ;
MCOTS_FLAG_COMPRESS_REQUESTED  = 0x01 ;  (* request compression at send *)
MCOTS_FLAG_COMPRESSED          = 0x02 ;  (* payload IS compressed *)
MCOTS_FLAG_ASCII               = 0x04 ;  (* ASCII compression mode *)
MCOTS_FLAG_ENCRYPTED           = 0x08 ;  (* payload is encrypted *)
MCOTS_FLAG_DISCONNECT_AFTER    = 0x10 ;  (* disconnect after sending *)
MCOTS_FLAG_HEARTBEAT           = 0x80 ;  (* heartbeat message *)
```

### 5.2. MCOTS Encryption Policy

**Most MCOTS messages require encrypted payloads.** The encryption is 
established after the initial `MC_CLIENT_CONNECT_MSG` handshake.

#### 5.2.1. Unencrypted Messages (Pre-Handshake)

Only these messages may be sent before encryption is established:

| Code | Name | Purpose |
|------|------|---------|
| 438 | MC_CLIENT_CONNECT_MSG | Initial connection handshake |
| 141 | MC_STOCK_CAR_INFO | Stock car catalog query |

#### 5.2.2. Encrypted Pre-Login Messages

After encryption is established but before login completes:

| Code | Name | Purpose |
|------|------|---------|
| 105 | MC_LOGIN | Login request |
| 438 | MC_CLIENT_CONNECT_MSG | (also allowed) |
| 141 | MC_STOCK_CAR_INFO | Stock car catalog |
| - | MC_DELETE_PERSONA | Delete a persona |
| - | MC_GET_MCOTS_VERSION | Query server version |
| - | MC_TRACKING_MSG | Analytics/tracking |

#### 5.2.3. Post-Login Messages

After successful login, **all messages must be encrypted** (flag 0x08 set).

### 5.3. MCOTS Message Body

The message body immediately follows the 11-byte framing header. The first 
2 bytes of every body contain the message number (msgNo).

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|           Message Number      |                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+                               +
|                                                               |
:                     Message-Specific Data                     :
|                                                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

where:

- **Message Number (msgNo)**: 2 bytes (little-endian). Identifies the message type.
- **Message-Specific Data**: Variable. Structure depends on msgNo.

**Note:** MCOTS messages use tight packing with no padding between fields.

```ebnf
MCOTS_MessageBody = 
    msgNo: WORD ,
    data: message-specific-data ;

MCOTS_Message =
    header: MCOTS_FramingHeader ,
    body: MCOTS_MessageBody ;
```

### 5.4. Client Connect Message (438)

Initial message sent by client after TCP connection established.

**Total message size:** 51 bytes (11-byte header + 40-byte body)

The diagram below shows the **message body** (after the 11-byte framing header):

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     msgNo (438 = 0x01B6)      |                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+                               +
|                          Customer ID                          |
+                               +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                               |                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+                               +
|                          Persona ID                           |
+                               +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                               |                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+                               +
|                                                               |
+                       Customer Name                           +
|                         (13 bytes)                            |
+                               +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                               |                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+                               +
|                                                               |
+                        Persona Name                           +
|                         (13 bytes)                            |
+                               +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                               |                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+                               +
|                         MC Version                            |
+                               +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

where:

- **msgNo**: 2 bytes; msgNo == 438. Message identifier.
- **Customer ID**: 4 bytes. EA customer account ID.
- **Persona ID**: 4 bytes. Selected persona/character ID.
- **Customer Name**: 13 bytes. Customer account name (appears unused by server).
- **Persona Name**: 13 bytes. Persona display name (appears unused by server).
- **MC Version**: 4 bytes. Client version string (e.g., "1.0").

```ebnf
(* Body only - preceded by 11-byte MCOTS_FramingHeader *)
ClientConnectMsgBody =
    msgNo: WORD ,              (* 438 *)
    customerID: DWORD ,
    personaID: DWORD ,
    custName: mc-string-13 ,
    personaName: mc-string-13 ,
    mcVersion: DWORD ;
```

### 5.5. Login Message (105)

Full login request after initial connection.

```ebnf
LoginMsg =
    msgNo: WORD ,              (* 105 *)
    customerID: DWORD ,
    personaID: DWORD ,
    lotOwnerID: DWORD ,
    brandedPartID: DWORD ,
    skinID: DWORD ,
    personaName: mc-string-13 ,
    mcVersion: DWORD ;
```

### 5.6. Login Complete Message (213)

Sent by server upon successful login.

```ebnf
LoginCompleteMsg =
    msgNo: WORD ,              (* 213 *)
    serverTime: DWORD ,
    flags: BYTE ,              (* bit 0: firstTime, bit 1: paycheckWaiting, etc. *)
    secondsTillShutdown: WORD ,
    shardGNP: double64 ,
    shardCarsSold: DWORD ,
    shardAveSalary: DWORD ,
    shardAveCarsOwned: DWORD ,
    shardAvePlayerLevel: DWORD ,
    serverList: 4 * MCOTSListEntry ,
    webCookie: DWORD ,
    nextTallyDate: Timestamp ,
    nextPaycheckDate: Timestamp ;

Timestamp =
    year: int16 ,
    month: uint16 ,
    day: uint16 ,
    hour: uint16 ,
    minute: uint16 ,
    second: uint16 ,
    fraction: uint32 ;           (* nanoseconds *)

MCOTSListEntry =
    mcotsID: MCOTS_INSTANCEID ,
    port: WORD ,
    ip: 4 * DWORD ,            (* up to 4 IP addresses *)
    priorityOrder: WORD ,
    dutyStatusFlags: WORD ;
```

### 5.7. Generic Request (Variable)

Many MCOTS operations use a generic request format.

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|            msgNo              |                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+                               +
|                             data                              |
+                               +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                               |                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+                               +
|                            data2                              |
+                               +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

where:

- **msgNo**: 2 bytes. Operation code.
- **data**: 4 bytes (int32). Primary parameter.
- **data2**: 4 bytes (int32). Secondary parameter.

```ebnf
GenericRequest =
    msgNo: WORD ,
    data: int32 ,
    data2: int32 ;
```

### 5.8. Generic Reply

Standard response format for many operations.

```ebnf
GenericReply =
    msgNo: WORD ,              (* MC_SUCCESS=101, MC_FAILED=102, or specific *)
    msgReply: WORD ,           (* Original request msgNo *)
    result: DWORD ,            (* Result code or error reason *)
    data: DWORD ,              (* Operation-specific data *)
    data2: DWORD ;             (* Operation-specific data *)
```

### 5.9. Vehicle Structure

```ebnf
Vehicle =
    vehicleID: DWORD ,
    skinID: DWORD ,
    flags: DWORD ,
    delta: DWORD ,             (* increments on changes, used for caching *)
    carClass: BYTE ,
    damageLength: WORD ,
    damage: damageLength * BYTE ;  (* Max 2000 bytes *)
```

### 5.10. Part Structure

```ebnf
Part =
    partID: DWORD ,
    parentPartID: DWORD ,
    brandedPartID: DWORD ,
    repairPrice: DWORD ,
    junkPrice: DWORD ,
    wear: DWORD ,
    attachmentPoint: BYTE ,
    damage: BYTE ;
```

### 5.11. Vehicle Info Message (123)

Response containing complete vehicle data.

```ebnf
MCCarInfo =
    msgNo: WORD ,              (* 123 *)
    playerID: DWORD ,
    vehicle: Vehicle ,
    noParts: WORD ,
    parts: noParts * Part ;
```

---

## 6. Connection Flow

### 6.1. Lobby Connection Handshake

When a client connects to the Lobby Server (port 7003), the server MUST send
an unsolicited `NPS_OK_TO_LOGIN` message before the client will proceed. The
client blocks waiting for this handshake.

```
Client                    Lobby Server
  |                            |
  |---(TCP Connect 7003)------>|
  |                            |
  |   (client blocks waiting)  |
  |                            |
  |<--NPS_OK_TO_LOGIN (0x230)--|   <-- Server-push, unsolicited
  |                            |
  |---NPS_LOGIN (0x100)------->|   <-- NOW client proceeds
  |                            |
```

**NPS_OK_TO_LOGIN Packet Structure:**

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|         msgid (0x0230)        |         length (0x0004)       |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

- **msgid**: 0x0230 (560 decimal) - `NPS_OK_TO_LOGIN`
- **length**: 4 bytes (header only, no payload)

⚠️ **CRITICAL**: If this packet is not sent, the client will block indefinitely
waiting in the connection queue. This is observed in client debug logs as:

```
csQ:Waiting in connection Q
csQ:NPS_OK_TO_LOGIN           <-- Unblocks here
cs:Sending LoginInfo to server
```

### 6.2. Full Login Sequence

```
Client                    Login Server              MCOTS
  |                            |                      |
  |---(TCP Connect 8226)------>|                      |
  |                            |                      |
  |---NPS_USER_LOGIN (0x501)-->|                      |
  |                            |                      |
  |<--NPS_USER_VALID (0x601)---|                      |
  |   (personas, shard list)   |                      |
  |                            |                      |
  |---(TCP Connect 43300)------|--------------------->|
  |                            |                      |
  |---ClientConnectMsg (438)---|--------------------->|
  |                            |                      |
  |<--GenericReply (ACK)-------|----------------------|
  |   (Encryption now active)  |                      |
  |                            |                      |
  |---LoginMsg (105)-----------|--------------------->|
  |                            |                      |
  |<--LoginCompleteMsg (213)---|----------------------|
  |   (Server list, tunables)  |                      |
  |                            |                      |
```

### 6.3. MCOTS Instance Selection

The client may connect to multiple MCOTS instances for load balancing:

```ebnf
(* Extract MCOTS instance ID from race/trade ID *)
MCOTS_INTRAID_TO_INSTANCEID(intraid) =
    (intraid >> 24) & 0xFF ;

(* Embed instance ID into race/trade ID *)
MAKE_MCOTS_INTRAID(id, instanceId) =
    (id & 0x00FFFFFF) | ((instanceId & 0xFF) << 24) ;
```

### 6.4. Bundled Response Patterns

Some MCOTS requests trigger multiple response messages. The server bundles
related data together in a single response sequence. Implementors MUST send
all messages in the bundle for the client to function correctly.

#### 6.4.1. MC_GET_LOBBIES Response Bundle

When the client requests lobbies (`MC_GET_LOBBIES`), the server responds with
multiple messages:

```
Client                    MCOTS
  |                         |
  |---MC_GET_LOBBIES (136)->|
  |                         |
  |<--MC_LOBBIES (325)------|   (1) Lobby list
  |<--MC_ENTRYFEE_PURSE-----|   (2) Entry fee/purse mappings (408)
  |<--MC_TTB_INFO-----------|   (3) Team Trial Bonus brackets (optional)
  |                         |
```

| Order | Message ID | Name | Description |
|-------|------------|------|-------------|
| 1 | 325 | MC_LOBBIES | Lobby list (may have `moreToCome` flag) |
| 2 | 408 | MC_ENTRYFEE_PURSE_INFO | Entry fee to purse prize mappings |
| 3 | (varies) | MC_TTB_INFO | Team Trial Bonus bracket info (optional) |

The `moreToCome` flag in each message indicates whether additional messages
of that type follow. All bundled messages share the same response sequence.

---

## 7. Encryption

### 7.1. Overview

| Protocol | Key Exchange | Session Cipher | Notes |
|----------|--------------|----------------|-------|
| **NPS** | RSA | DES-CBC | Session key up to 32 bytes |
| **MCOTS** | Diffie-Hellman | ARC4 (RC4) | 16-byte key, stream cipher |

### 7.2. NPS Encryption (Command/Game)

NPS uses DES-CBC for encrypting lobby and game commands.

#### 7.2.1. NPS Encryption Parameters

```
Algorithm:    DES-CBC
Key Size:     8 bytes (first 8 bytes of hex-decoded session key)
IV:           8 bytes, all zeros (0x0000000000000000)
Padding:      NONE - messages MUST be pre-padded to 8-byte boundary
Block Size:   8 bytes
```

**Critical:** Auto-padding is disabled. The caller must ensure all plaintext 
is padded to a multiple of 8 bytes before encryption.

#### 7.2.2. NPS Crypto Message IDs

| ID | Name | Description |
|--------|------|-------------|
| 0x1001 | NPS_CRYPTO_PUB_KEY | RSA public key exchange |
| 0x1101 | NPS_CRYPTO_DES_CBC | DES-CBC encrypted message |
| 0x1201 | NPS_CRYPTO_DES_CBC_ID | DES-CBC, user ID NOT encrypted |

#### 7.2.3. NPS Session Key Structure

Session keys are serialized as Pascal-style (length-prefixed) with expiry:

```ebnf
NPS_SessionKey =
    key: nps-string ,            (* up to 32 bytes, length-prefixed *)
    expiryDate: uint32 ;         (* Unix timestamp, seconds since epoch *)

NPS_SESSION_KEY_LEN = 32 ;       (* maximum key length *)
```

#### 7.2.4. NPS Crypto Error Codes

| Code | Name |
|------|------|
| -133 | NPS_CRYPTO_ERR |
| -134 | NPS_CRYPTO_NOT_INITIALIZED |
| -135 | NPS_CRYPTO_INVALID_KEY |
| -136 | NPS_CRYPTO_EXPIRED_KEY |
| -140 | NPS_CRYPTO_NO_VALIDATION_SERVER |

### 7.3. MCOTS Encryption (Data/Transactions)

MCOTS uses RC4 stream cipher for encrypting transaction data.

#### 7.3.1. MCOTS Encryption Parameters

```
Algorithm:    RC4 (ARC4)
Key Size:     16 bytes (first 16 bytes of hex-decoded session key)
IV:           None (RC4 is a stream cipher)
Padding:      NONE - RC4 encrypts byte-by-byte
```

**Stream Cipher Requirement:** RC4 is a stream cipher. Bytes MUST be 
decrypted in the exact same order they were encrypted. This requires 
TCP (reliable, ordered delivery). UDP is not supported.

#### 7.3.2. MCOTS Key Derivation

The session key is shared between NPS and MCOTS encryption. From the 
hex-encoded session key string:

- **NPS (DES-CBC)**: Uses bytes 0-7 (first 16 hex chars → 8 bytes)
- **MCOTS (RC4)**: Uses bytes 0-15 (first 32 hex chars → 16 bytes)

#### 7.3.3. MCOTS Encryption Setup Flow

```
Client                                    Server
   |                                         |
   |---ClientConnectMsg (438, unencrypted)-->|
   |                                         |
   |<--GenericReply (ACK)--------------------|
   |                                         |
   |   [Key exchange via NPS login]          |
   |   [RC4 contexts initialized]            |
   |                                         |
   |===All subsequent messages encrypted=====|
   |                                         |
   |---LoginMsg (105, encrypted)------------>|
   |                                         |
```

#### 7.3.4. MCOTS Encryption State

- Separate RC4 cipher instances for encrypt and decrypt
- State is maintained per-connection
- Cipher state evolves with each byte - do NOT reset mid-stream

**⚠️ SEQUENCE NUMBER IS CRITICAL:**

RC4 is a stream cipher where the keystream position advances with every 
byte encrypted/decrypted. If messages are processed out of sequence order:

1. The cipher will decrypt with the wrong keystream position
2. Output will be garbage
3. **All subsequent messages will also fail** (cipher is permanently desynchronized)
4. The only recovery is to disconnect and re-establish the session

The `sequence` field in the MCOTS framing header exists specifically to 
ensure correct ordering. Implementations MUST:
- Track expected sequence numbers per connection
- Process messages strictly in sequence order
- Reject or queue out-of-order messages

---

## 8. Compression

### 8.1. Compression Algorithm

MCOTS uses the **PKWARE Data Compression Library (DCL)** implode/explode 
algorithm for payload compression.

```
Library:      PKWARE DCL (Data Compression Library)
Functions:    implode() / explode()
Buffer Sizes: CMP_BUFFER_SIZE = 36312 (compress)
              EXP_BUFFER_SIZE = 12596 (decompress)
```

### 8.2. Compression Modes

| Flag | Value | Mode | Description |
|------|-------|------|-------------|
| COMPRESSED | 0x02 | - | Payload IS compressed |
| ASCII | 0x04 | CMP_ASCII (1) | Optimize for ASCII text |
| (neither) | - | CMP_BINARY (0) | Binary data (default) |

**Mode Selection:**
- If `flags & 0x04` is set → ASCII mode (`CMP_ASCII = 1`)
- Otherwise → Binary mode (`CMP_BINARY = 0`)

**Note:** The ASCII flag (0x04) only has meaning when COMPRESSED (0x02) is 
also set.

### 8.3. Compression Error Codes

| Code | Name | Description |
|------|------|-------------|
| 0 | CMP_NO_ERROR | Success |
| 1 | CMP_INVALID_DICTSIZE | Invalid dictionary size |
| 2 | CMP_INVALID_MODE | Invalid compression mode |
| 3 | CMP_BAD_DATA | Corrupted compressed data |
| 4 | CMP_ABORT | Operation aborted |

### 8.4. Compression in Practice

The COMPRESSED flag (0x02) in the MCOTS framing header indicates whether 
the message body (after decryption, if encrypted) is compressed.

**Processing Order:**
1. **Receive:** Decrypt (if 0x08) → Decompress (if 0x02) → Parse
2. **Send:** Serialize → Compress (if desired) → Encrypt (if required)

**Implementation Note:** The original PKWARE DCL library is no longer 
available. Modern implementations use recreated libraries such as `pklib-ts` 
(TypeScript) or similar open-source reimplementations of the implode/explode 
algorithm.

---

## 9. Message Catalog

### 8.1. MCOTS Message Categories

#### 8.1.1. Connection & Session

| Code | Name | Direction | Description |
|------|------|-----------|-------------|
| 101 | MC_SUCCESS | S→C | Generic success response |
| 102 | MC_FAILED | S→C | Generic failure response |
| 105 | MC_LOGIN | C→S | Login request |
| 106 | MC_LOGOUT | C→S | Logout request |
| 213 | MC_LOGIN_COMPLETE | S→C | Login success with data |
| 438 | MC_CLIENT_CONNECT_MSG | C→S | Initial connection |

#### 8.1.2. Player & Persona

| Code | Name | Direction | Description |
|------|------|-----------|-------------|
| 108 | MC_GET_PLAYER_INFO | C→S | Request player details |
| 109 | MC_SET_OPTIONS | C→S | Update player options |
| 122 | MC_PLAYER_INFO | S→C | Player info response |
| 164 | MC_GET_PLAYER_NAME | C→S | Get player name by ID |
| 165 | MC_PLAYER_NAME | S→C | Player name response |

#### 8.1.3. Vehicles & Parts

| Code | Name | Direction | Description |
|------|------|-----------|-------------|
| 123 | MC_VEHICLE_INFO | S→C | Complete vehicle data |
| 141 | MC_STOCK_CAR_INFO | Both | Stock car inventory |
| 142 | MC_PURCHASE_STOCK_CAR | C→S | Purchase a stock car |
| 145 | MC_GET_COMPLETE_VEHICLE_INFO | C→S | Request vehicle details |
| 161 | MC_GET_PLAYERS_VEHICLES | C→S | Get vehicles for players |
| 163 | MC_UPDATE_CACHED_VEHICLE | C→S | Update vehicle cache |
| 172 | MC_GET_OWNED_VEHICLES | C→S | List owned vehicles |
| 173 | MC_OWNED_VEHICLES_LIST | S→C | Owned vehicles response |
| 174 | MC_GET_OWNED_PARTS | C→S | List loose parts |
| 175 | MC_OWNED_PARTS_LIST | S→C | Owned parts response |
| 176 | MC_BUY_NEW_PART | C→S | Purchase from catalog |
| 181 | MC_INSTALL_PART | C→S | Install part on vehicle |
| 182 | MC_REMOVE_PART | C→S | Remove part from vehicle |

#### 8.1.4. Races

| Code | Name | Direction | Description |
|------|------|-----------|-------------|
| 218 | MC_RACE_JOIN | C→S | Join a race |
| 223 | MC_RACE_CREATE_OK | S→C | Race created successfully |
| 224 | MC_RACE_JOIN_OK | S→C | Race join approved |
| 230 | MC_CREATE_STANDARD_RACE | C→S | Create a race |
| 232 | MC_RACE_START | C→S | Start the race (host) |
| 233 | MC_RACE_STARTED | S→C | Race has started |
| 234 | MC_RACER_COMPLETED_RACE | C→S | Racer finished |
| 237 | MC_RACE_FINAL_RESULTS | S→C | Final race results |

#### 8.1.5. Trade Window

| Code | Name | Direction | Description |
|------|------|-----------|-------------|
| 338 | MC_TW_HOST_SESSION | C→S | Create trade session |
| 339 | MC_TW_SESSION_HOSTED | S→C | Trade session created |
| 340 | MC_TW_JOIN_REQUEST | C→S | Request to join trade |
| 341 | MC_TW_JOIN_SESSION | S→C | Trade join approved |
| 350 | MC_TW_REQUEST_OFFER_CHANGE | C→S | Modify offer |
| 351 | MC_TW_OFFER_CHANGE | S→C | Offer update |

---

## 10. Race Protocol

Racing is the core gameplay loop. This section details the complete race 
lifecycle from creation through results.

### 9.1. Race Lifecycle Overview

```
Host                      MCOTS                     Joiner(s)
  |                         |                          |
  |--MC_CREATE_STANDARD_RACE (230)-->|                 |
  |                         |                          |
  |<--MC_RACE_CREATE_OK (223)--------|                 |
  |   (raceID, password, entryFee)   |                 |
  |                         |                          |
  |   [Host shares raceID via NPS lobby chat]          |
  |                         |                          |
  |                         |<--MC_RACE_JOIN (218)-----|
  |                         |                          |
  |                         |---MC_RACE_JOIN_OK (224)->|
  |                         |   (password for NPS)     |
  |                         |                          |
  |   [All players join NPS game channel]              |
  |                         |                          |
  |--MC_RACE_START (232)--->|                          |
  |   (racer list)          |                          |
  |                         |                          |
  |<--MC_RACE_STARTED (233)-|---MC_RACE_STARTED (233)->|
  |   (validation results)  |                          |
  |                         |                          |
  |   [...RACE IN PROGRESS - Game messages via NPS...] |
  |                         |                          |
  |--MC_RACER_COMPLETED_RACE (234)->|                  |
  |                         |<--MC_RACER_COMPLETED-----|
  |                         |                          |
  |<--MC_RACE_FINAL_RESULTS (237)---|----------------->|
  |   (placements, prizes, points)  |                  |
  |                         |                          |
```

### 9.2. Race Types

```ebnf
RaceTypes =
    RACES_TESTDRIVE      (* 14 - Solo test drive *)
  | RACES_SIM_STREET     (* 16 - Street racing *)
  | RACES_SIM_PRO        (* 17 - Professional circuit *)
  | RACES_SIM_DRAG       (* 18 - Drag racing *)
  | RACES_SIM_TIMETRIAL  (* 19 - Time trial *)
  | RACES_ARC_STUNT      (* 23 - Arcade stunt mode *)
  | RACES_ARC_TIMETRIAL  (* 25 - Arcade time trial *)
  | RACES_TRADEWINDOW ;  (* 26 - Trade session pseudo-race *)
```

### 9.3. Race Classes

```ebnf
CarClasses =
    CAR_CLASS_STOCK        (* 0 *)
  | CAR_CLASS_STOCK_MUSCLE (* 1 *)
  | CAR_CLASS_MOD_CLASSIC  (* 2 *)
  | CAR_CLASS_MOD_MUSCLE   (* 3 *)
  | CAR_CLASS_OUTLAW       (* 4 *)
  | CAR_CLASS_DRAG ;       (* 5 *)

DriverClasses =
    DRIVER_OPEN_CLASS  (* 0 *)
  | DRIVER_CLASS_C     (* 1 *)
  | DRIVER_CLASS_B     (* 2 *)
  | DRIVER_CLASS_A     (* 3 *)
  | DRIVER_CLASS_AA    (* 4 *)
  | DRIVER_CLASS_AAA ; (* 5 *)

(* Power class thresholds (power/weight ratio) *)
PowerClass =
    MC_POWER_CLASS_E   (* >= 0.00 *)
  | MC_POWER_CLASS_D   (* >= 0.07 *)
  | MC_POWER_CLASS_C   (* >= 0.11 *)
  | MC_POWER_CLASS_B   (* >= 0.14 *)
  | MC_POWER_CLASS_A   (* >= 0.18 *)
  | MC_POWER_CLASS_SD  (* >= 0.20 *)
  | MC_POWER_CLASS_SC  (* >= 0.22 *)
  | MC_POWER_CLASS_SB  (* >= 0.24 *)
  | MC_POWER_CLASS_SA ;(* >= 0.26 *)
```

### 9.4. Create Race Message (230)

Sent by the race host to create a new race.

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     msgNo (230 = 0x00E6)      |                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+                               +
|                           Lobby ID                            |
+                               +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                               |                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+                               +
|                          Entry Fee                            |
+                               +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                               | Club | Pink | Team |         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                          Sponsor ID                           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
+                        CreateRaceInfo                         +
:                          (variable)                           :
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

where:

- **msgNo**: 2 bytes; msgNo == 230. Message identifier.
- **Lobby ID**: 4 bytes. Identifies the track/lobby.
- **Entry Fee**: 4 bytes. Cost to enter the race.
- **Club**: 1 byte. Boolean: 1 if club race.
- **Pink**: 1 byte. Boolean: 1 if pink slip (car wagered) race.
- **Team**: 1 byte. Boolean: 1 if team trial.
- **Sponsor ID**: 4 bytes. Sponsor ID or 0 if not sponsored.
- **CreateRaceInfo**: Variable. Race configuration (see below).

```ebnf
CreateRaceMsg =
    msgNo: WORD ,                (* 230 *)
    lobbyID: DWORD ,
    entryFee: DWORD ,
    bIsClubRace: BYTE ,
    bIsPinkSlipRace: BYTE ,
    bIsTeamTrial: BYTE ,
    sponsorID: DWORD ,
    info: CreateRaceInfo ;

CreateRaceInfo =
    minLevel: DWORD ,            (* 0 for none *)
    maxLevel: DWORD ,            (* 0 for none *)
    maxHP: DWORD ,               (* 0 for none *)
    maxRacers: BYTE ,            (* Network players allowed *)
    minRacers: BYTE ,            (* Minimum players required *)
    numRounds: BYTE ,            (* 0=single race, n=series *)
    numLaps: BYTE ,              (* 2, 4, or 8 typically *)
    bBackwardRace: BYTE ,
    bMirrored: BYTE ,
    bNightDriving: BYTE ,
    bWeatherDriving: BYTE ,
    bDamage: BYTE ,              (* Damage enabled *)
    bTraffic: BYTE ,             (* Traffic enabled *)
    bAI: BYTE ,                  (* AI racers enabled *)
    bHandicapped: BYTE ,         (* Drag race handicap *)
    powerClass: DWORD ,          (* 0 or power class limit *)
    bodyClass: DWORD ,           (* 0 or body class restriction *)
    bDisallowNOS: BYTE ;         (* Nitrous not allowed *)
```

### 9.5. Race Created Response (223)

Sent to host upon successful race creation.

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     msgNo (223 = 0x00DF)      |                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+                               +
|                           Race ID                             |
+                               +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                               |                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+                               +
|                          Entry Fee                            |
+                               +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                               |                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+                               +
|                     Per-Player Purse Bonus                    |
+                               +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                               |                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+                               +
|                           Password                            |
+                                                               +
|                          (8 bytes)                            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       Race History ID                         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                      Per-Race Purse Bonus                     |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

where:

- **msgNo**: 2 bytes; msgNo == 223. Message identifier.
- **Race ID**: 4 bytes. Unique race identifier (includes MCOTS instance ID).
- **Entry Fee**: 4 bytes. Confirmed entry fee.
- **Per-Player Purse Bonus**: 4 bytes. Additional purse per player.
- **Password**: 8 bytes. BINARY password for NPS channel (not null-terminated).
- **Race History ID**: 4 bytes. ID for race history tracking.
- **Per-Race Purse Bonus**: 4 bytes. Base purse bonus.

```ebnf
RaceCreated =
    msgNo: WORD ,                (* 223 *)
    raceID: MCOTS_INTRAID ,
    entryFee: DWORD ,
    perPlayerPurseBonus: DWORD ,
    password: 8 * BYTE ,         (* Binary, NOT null-terminated *)
    raceHistoryID: DWORD ,
    perRacePurseBonus: DWORD ;
```

### 9.6. Join Race Message (218)

Sent by a player to join an existing race.

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     msgNo (218 = 0x00DA)      |                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+                               +
|                           Race ID                             |
+                               +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                               |                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+                               +
|                          Vehicle ID                           |
+                               +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                               | Power |Unknwn |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

where:

- **msgNo**: 2 bytes; msgNo == 218. Message identifier.
- **Race ID**: 4 bytes. Race to join (from lobby chat).
- **Vehicle ID**: 4 bytes. Player's current vehicle.
- **Power Class**: 1 byte. Calculated power class of vehicle.
- **Unknown**: 1 byte. Purpose unknown; always observed as 0.

```ebnf
JoinRaceMsg =
    msgNo: WORD ,                (* 218 *)
    raceID: MCOTS_INTRAID ,
    vehicleID: DWORD ,
    powerClass: BYTE ,
    unknown: BYTE ;              (* always observed as 0 *)
```

### 9.7. Race Join OK Response (224)

Sent to player upon successful race join.

```ebnf
RaceJoinedMsg =
    msgNo: WORD ,                (* 224 *)
    raceID: MCOTS_INTRAID ,
    password: 8 * BYTE ;         (* Binary NPS channel password *)
```

### 9.8. Start Race Message (232)

Sent by host to start the race with the racer lineup.

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     msgNo (232 = 0x00E8)      |                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+                               +
|                           Race ID                             |
+                               +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                               |                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+                               +
|                                                               |
+                        Racer 0: ID                            +
|                                                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                      Racer 0: Vehicle ID                      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|Human?|          ... repeat for Racers 1-5 ...                 |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
:                             ...                               :
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
| Round | Laps  |                   Lobby Flags                 |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|       Lobby Flags (cont)      |  Dialin[0]    |  Dialin[1]    |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     Dialin (cont)             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

where:

- **msgNo**: 2 bytes; msgNo == 232. Message identifier.
- **Race ID**: 4 bytes. Race identifier.
- **Racers[6]**: 6 × StartingRacers structure. Up to 6 racers.
- **Round**: 1 byte. Multi-round limit (0=no limit).
- **Laps**: 1 byte. Number of laps (1-8).
- **Lobby Flags**: 4 bytes. Race configuration flags (see below).
- **Dialin[2]**: 2 × 2 bytes. Drag race handicap ticks.

```ebnf
StartRaceMsg =
    msgNo: WORD ,                (* 232 *)
    raceID: MCOTS_INTRAID ,
    racers: 6 * StartingRacers ,
    multiRoundLimit: BYTE ,
    numLaps: BYTE ,
    lobbyFlags: DWORD ,
    dialinTicks: 2 * WORD ;

StartingRacers =
    id: DWORD ,                  (* Persona ID or AI ID *)
    vehicleID: DWORD ,
    isHuman: BYTE ;

(* Lobby Flags bit definitions *)
LOBBYFLAG_BACKWARD    = 0x00000001 ;
LOBBYFLAG_DAMAGE      = 0x00000002 ;
LOBBYFLAG_MIRRORED    = 0x00000004 ;
LOBBYFLAG_NIGHT       = 0x00000008 ;
LOBBYFLAG_WEATHER     = 0x00000010 ;
LOBBYFLAG_TRAFFIC     = 0x00000020 ;
LOBBYFLAG_HANDICAP    = 0x00000040 ;
```

### 9.9. Race Started Response (233)

Confirmation with validation results for each racer.

```ebnf
StartRaceResultMsg =
    msgNo: WORD ,                (* 233 *)
    raceID: MCOTS_INTRAID ,
    okToStart: BOOL ,            (* Sufficient humans? *)
    racers: 6 * StartingRacersResult ;

StartingRacersResult =
    id: DWORD ,
    isntValid: BYTE ;            (* 1 if racer cannot race *)
```

### 9.10. Racer Completed Race Message (234)

Sent by each racer upon finishing.

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     msgNo (234 = 0x00EA)      |          Top Speed            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                           Race ID                             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                          Racer ID                             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       Completion Time                         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                        Best Lap Time                          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|         Avg Speed             |                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+                               +
|                        Security Flags                         |
+                               +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                               |                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+                               +
|                      Travel Map Length                        |
+                               +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                               |                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+                               +
:                          Travel Map                           :
:                       (variable length)                       :
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

where:

- **msgNo**: 2 bytes; msgNo == 234. Message identifier.
- **Top Speed**: 2 bytes. Maximum speed achieved (m/s).
- **Race ID**: 4 bytes. Race identifier.
- **Racer ID**: 4 bytes. Persona ID or AI ID.
- **Completion Time**: 4 bytes. Start-to-finish time (64Hz ticks).
- **Best Lap Time**: 4 bytes. Best single lap (64Hz ticks).
- **Avg Speed**: 2 bytes. Average speed (m/s).
- **Security Flags**: 4 bytes. Cheat detection flags.
- **Travel Map Length**: 4 bytes. Uncompressed size of travel map.
- **Travel Map**: Variable. Compressed path data for validation.

```ebnf
CompletedRaceMsg =
    msgNo: WORD ,                (* 234 *)
    topSpeed: WORD ,             (* m/s *)
    raceID: MCOTS_INTRAID ,
    id: DWORD ,
    completionTime: DWORD ,      (* 64Hz ticks *)
    bestLapTime: DWORD ,         (* 64Hz ticks *)
    avgSpeed: WORD ,             (* m/s *)
    securityFlags: DWORD ,
    travelMapLength: DWORD ,
    travelMap: travelMapLength * BYTE ;
```

**Note:** Times are in 64Hz ticks. To convert to milliseconds: `ms = ticks * 1000 / 64`

### 9.11. Final Results Message (237)

Sent to all racers after the last racer finishes or times out.

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     msgNo (237 = 0x00ED)      |                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+                               +
|                           Race ID                             |
+                               +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                               |                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+                               +
|                                                               |
+                      Racer Placements [6]                     +
:                        (see structure)                        :
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
| Drag Rounds   |       Drag Round Winners      | Final Flags   |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       Team Cash Bonus                         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       Team Point Bonus                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                      Team Combined Par                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

```ebnf
FinalResultsMsg =
    msgNo: WORD ,                (* 237 *)
    raceID: MCOTS_INTRAID ,
    racers: 6 * RacerPlacement , (* Ordered by finish position *)
    dragRoundsCompleted: BYTE ,
    dragRoundWinners: WORD ,     (* Bit 0=round 0, 1=player1 won *)
    finalResultFlags: BYTE ,
    teamCashBonus: DWORD ,
    teamPointBonus: DWORD ,
    teamCombinedPar: DWORD ;

RacerPlacement =
    id: DWORD ,
    raceTime: DWORD ,            (* 0 = DNF; 64Hz ticks *)
    bestLapTime: DWORD ,         (* 64Hz ticks *)
    topSpeedMPS: WORD ,
    avgSpeedMPS: WORD ,
    racePoints: int16 ,          (* Signed - can be negative *)
    totalPoints: WORD ,
    pointsToNextLevel: WORD ,
    pointsToNextRank: WORD ,
    oldLevel: BYTE ,
    oldRank: BYTE ,
    prizeID: DWORD ,             (* Part ID won, or 0 *)
    cashWon: DWORD ,
    newLevel: BYTE ,
    newRank: BYTE ,
    resultFlags: DWORD ;

(* Result Flags *)
RACERESULT_WONCAR              = 0x00000001 ;
RACERESULT_LOSTCAR             = 0x00000002 ;
RACERESULT_BESTEVER_TOPSPEED   = 0x00000004 ;
RACERESULT_BESTTURF_TOPSPEED   = 0x00000008 ;
RACERESULT_BESTLOBBY_TOPSPEED  = 0x00000010 ;
RACERESULT_BESTTURF_LAPTIME    = 0x00000020 ;
RACERESULT_BESTLOBBY_LAPTIME   = 0x00000040 ;
RACERESULT_DRAGSTER_FAULTED    = 0x00000080 ;
RACERESULT_TIMEDOUT            = 0x00000100 ;
RACERESULT_PROMOTIONBONUS      = 0x00000200 ;
RACERESULT_CHEATSUSPECTED      = 0x00000400 ;

(* Final Result Flags *)
FINALRESULT_RACEAGAINOK        = 0x01 ;
FINALRESULT_INVALIDFROMERROR   = 0x02 ;
FINALRESULT_INVALIDFROMCHEATING= 0x04 ;
```

### 9.12. Racer Left Race Message (235)

Sent when a racer quits, disconnects, faults (drag), or is busted (cop).

```ebnf
(* Uses GenericRequest *)
RacerLeftRace =
    msgNo: WORD ,                (* 235 *)
    data: MCOTS_INTRAID ,        (* raceID *)
    data2: int32 ;               (* always observed as 0 *)
```

### 9.13. In-Race Damage Update (240)

Sent during race to report part damage (prevents save-quit exploits).

```ebnf
DamagedPartsMsg =
    msgNo: WORD ,                (* 240 *)
    raceID: DWORD ,
    noParts: WORD ,              (* observed max: 47 parts *)
    partID: noParts * DWORD ,
    damagePercent: noParts * BYTE ;  (* 0-100, 100=destroyed *)
```

### 9.14. Post-Race Damage Report (241)

Final damage and wear report after race.

```ebnf
DamageAndWearMsg =
    msgNo: WORD ,                (* 241 *)
    raceID: DWORD ,
    noParts: WORD ,
    damageWearList: noParts * PackedDamageAndWear ;

PackedDamageAndWear =
    partID: DWORD ,
    packedDamWear: DWORD ;
    (* Format: ((pctDamage & 0xFF) << 24) | (wear & 0xFFFFFF) *)
```

### 9.15. Keep Race Alive (448)

Heartbeat sent by client to prevent race timeout (every 15 minutes).

```ebnf
(* Uses GenericRequest *)
KeepRaceAlive =
    msgNo: WORD ,                (* 448 *)
    data: MCOTS_INTRAID ,        (* raceID *)
    data2: int32 ;               (* always observed as 0 *)

MC_KEEP_RACE_ALIVE_SECONDS = 900 ;  (* 15 minutes *)
```

### 9.16. Race Error Codes

| Code | Name | Description |
|------|------|-------------|
| 231 | MC_INVALID_RACE_ID | Race does not exist |
| 236 | MC_PERSONA_NOT_IN_RACE | Player not in this race |
| 238 | MC_TOO_MANY_PLAYERS | Race is full |
| 239 | MC_RACE_TIME_ALREADY_RECEIVED | Duplicate finish report |
| 189 | MC_INVALID_CAR_CLASS | Vehicle class not allowed |
| 190 | MC_INVALID_DRIVER_CLASS | Driver class not allowed |
| 191 | MC_INVALID_VEHICLE | Vehicle validation failed |
| 133 | MC_INSUFFICIENT_FUNDS | Can't afford entry fee |

---

## Appendix A: Message ID Tables

### A.1. NPS Login Client Commands (0x5xx)

```
0x501  NPS_USER_LOGIN
0x502  NPS_GAME_LOGIN
0x503  NPS_REGISTER_GAME_LOGIN
0x504  NPS_SET_GAME_BLOB
0x505  NPS_GET_NEXT_SERVER
0x506  NPS_NEW_EA_ACCOUNT
0x507  NPS_NEW_GAME_ACCOUNT
0x512  NPS_DELETE_GAME_PERSONA
0x519  NPS_GET_PERSONA_INFO
0x533  NPS_VALIDATE_PERSONA_NAME
0x534  NPS_CHECK_TOKEN
```

### A.2. NPS Login Server Commands (0x6xx)

```
0x601  NPS_USER_VALID
0x602  NPS_USER_INVALID
0x607  NPS_GAME_ACCOUNT_INFO
0x616  NPS_PERSONA_INFO
0x625  NPS_DUP_PERSONA
0x626  NPS_USER_BANNED
```

### A.3. NPS Lobby Client Commands (0x1xx)

```
0x100  NPS_LOGIN
0x103  NPS_SET_MY_USER_DATA
0x104  NPS_LOG_OFF_SERVER
0x105  NPS_CLOSE_COMM_CHANNEL
0x106  NPS_OPEN_COMM_CHANNEL
0x108  NPS_START_GAME
0x109  NPS_READY_FOR_GAME
0x120  NPS_LOGIN_RESP
```

### A.4. NPS Lobby Server Commands (0x2xx)

```
0x201  NPS_FORCE_LOGOFF
0x202  NPS_USER_LEFT
0x203  NPS_USER_JOINED
0x207  NPS_ACK
0x211  NPS_USER_LIST
0x214  NPS_CHANNEL_GRANTED
0x217  NPS_HEARTBEAT
0x229  NPS_MINI_USER_LIST
0x230  NPS_OK_TO_LOGIN          (server-push handshake on connect)
0x231  NPS_Q_POSITION           (queue position while waiting)
```

---

## Appendix B: Known Unknowns

The following aspects require verification or further reverse engineering:

### B.1. Encryption Details

- [x] Exact MCOTS encryption algorithm (ARC4/RC4 - documented in §7.3)
- [x] Key derivation from `base1`/`base2` (Diffie-Hellman - documented in §7.3)
- [x] Per-message encryption state management (stream cipher - documented in §7.3.2)

### B.2. Compression

- [x] Compression algorithm for `COMPRESSED` flagged messages (PKWARE DCL - documented in §8)
- [x] `ASCII` flag optimization behavior (CMP_ASCII vs CMP_BINARY - documented in §8)

### B.3. Field Meanings

| Message | Field | Status |
|---------|-------|--------|
| NPS_Header | unknown (offset 6-7) | Always observed as 0; purpose unclear |
| LoginCompleteMsg | webCookie | Purpose unclear |
| Vehicle | flags | Bit meanings partially known |
| Part | attachmentPoint | Mapping to vehicle positions incomplete |

### B.4. Message Completeness

The following message categories were identified but not fully documented:

- Classified Ads (478-494)
- Clubs (365-477)
- Seasons/Leagues (1080-1127)
- Events (243-276)
- Badges (311-313)

---

## References

- [Augmented Packet Header Diagrams](https://datatracker.ietf.org/doc/html/draft-mcquistin-augmented-ascii-diagrams-10)
- Network traffic captures from original game client (2001-2003 era)
- Protocol behavior observed via controlled server experimentation

---

## Legal Notice

This document was created using cleanroom reverse engineering techniques. 
Information was derived solely from:

1. Observation of network protocol behavior
2. Analysis of publicly transmitted packet structures
3. Controlled experimentation with compatible server implementations
4. Community knowledge from preservation efforts

No proprietary source code, confidential documentation, or trade secrets 
were used in the creation of this specification. This document is provided 
for historical preservation and educational purposes only.

Motor City Online is a trademark of Electronic Arts Inc. This project is 
not affiliated with or endorsed by Electronic Arts.

---

*This document is a cleanroom specification for educational and preservation purposes.*
