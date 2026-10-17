# Motor City Online — NPS Protocol Specification

**Status:** DRAFT (reverse-engineered from MCity_d.exe; all formats verified from binary analysis)  
**Source of truth:** `MCity_d.exe` (debug client build)  
**Date:** 2026-06-28
**Last revised:** 2026-10-17

---

## Revision History

Newest first. Each entry lists the sections changed and the evidence used.

| Date | Sections | Change | Evidence |
|------|----------|--------|----------|
| 2026-10-17 | 11.1, 11.4, 11.7, 12.1 | Reframed AddCommChannel (0x0106) as the client adding an existing channel to its own channel list (not a server-side create, and distinct from a channel join); channels are created server-side. Removed the "commId=0 creates a channel / server MUST allocate" requirements and diagram. Documented client behavior: grant commId is authoritative, 0x0215 is treated as success, the grant port is used only for UDP and ignored for TCP, non-zero already-open commId fails locally with -5, and any other reply is a denial. Marked the 0x020E payload layout as unverified. Reworded 0x0106 from "join" to "add to the client's channel list" (the client only adds the entry after a 0x0214/0x0215 grant); "join" is kept for the server-side user-in-channel events (0x0203, 0x020C). Left open: the contradictory "connect to the granted port" text in 11.4.2 and 12.1 steps 1-2. | `cNPSAPI::NPSAddCommChannel` (`00ad7690`); design intent from the project owner (creates happen server-side). |
| 2026-10-17 | 11.1, 12.4, 12.9 | Corrected opcode 0x010C: it is GetServerInfo, not GetReadyList. GetReadyList is 0x010E only; removed the "alt" row and the 0x010C references in the ready-state flow. Removed the duplicate 0x010C row in 11.1. | `cNPSAPI::NPSGetServerInfo` (`00ad3870`) sends 0x10C and `cNPSAPI::NPSGetReadyList` (`00ad2e20`) sends 0x10E, both via vtable slot +100 with a 4-byte payload. |
| 2026-06-28 | all | Initial draft. | Binary analysis of `MCity_d.exe`. |

---

## Table of Contents

1. [Overview](#1-overview)
2. [Authentication (authlogin.dll)](#2-authentication-authlogindll)
3. [NPS Login/Persona Server Wire Framing](#3-nps-loginpersona-server-wire-framing)
4. [TOMC Lobby/Room Server Wire Framing](#4-tomc-lobbyroom-server-wire-framing)
5. [Port and Address Configuration](#5-port-and-address-configuration)
6. [Operation: NPSUserLogin (0x501 → 0x601)](#6-operation-npsuserlogin-0x501--0x601)
7. [Operation: NPSGetPersonaMaps (0x532 → 0x607)](#7-operation-npsgetpersonamaps-0x532--0x607)
8. [Operation: NPSGetFirstGamePersona (0x502 → 0x613 + 0x607×N)](#8-operation-npsgetfirstgamepersona-0x502--0x613--0x607n)
9. [Operation: NPSCreateGamePersona (0x507 → 0x601)](#9-operation-npscreategamepersona-0x507--0x601)
10. [Operation: NPS Lobby Handshake (0x100 → 0x120)](#10-operation-nps-lobby-handshake-0x100--0x120)
11. [Lobby TOMC Application Messages](#11-lobby-tomc-application-messages)
    - [11.5 Operation: GetGameServersList (0x0309 → 0x0402)](#115-operation-getgameserverslist-0x0309--0x0402)
    - [11.6 Operation: NPSStartGameServerOnHost (0x010A → 0x0214 + 0x021C)](#116-operation-npsstartgameserveronhost-0x010a--0x0214--0x021c-broadcast)
12. [Room Server Protocol](#12-room-server-protocol)
13. [Client Session Flow](#13-client-session-flow)
14. [Data Types Reference](#14-data-types-reference)
15. [Error Opcodes](#15-error-opcodes)
16. [MCOTS Database Server Protocol](#16-mcots-database-server-protocol)
    - [16.6 Master/Slave Architecture](#166-masterslave-server-architecture)
    - [16.7 Connection and Login Flow](#167-connection-and-login-flow)
    - [16.8 Known Message Types (C→S)](#168-known-message-types-client--server)
    - [16.11 Server Response Wire Format](#1611-server-response-wire-format)
    - [16.12 Known Response Formats](#1612-known-response-formats-mc_success)
    - [16.13 Server MUST Requirements](#1613-server-implementation-notes-must)

---

## 1. Overview

### 1.1 Key Words

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

Motor City Online (MCO, 2001, EA) uses EA's proprietary **Network Play System (NPS)** protocol. It operates over TCP on two distinct wire-framing schemes:

- **NPS Login/Persona stream**: 12-byte binary header (no magic), used for authentication and persona management. Each operation is a separate short-lived TCP connection.
- **TOMC stream**: `TOMC`-magic-prefixed framing for the persistent lobby and room connections.

NPS is **Big-Endian** throughout except where noted.

---

## 2. Authentication (authlogin.dll)

Before connecting to the NPS server, the client authenticates via HTTPS against an EA authentication service.

### 2.1 Registry Configuration

Confirmed from RE of `authlogin.dll` string table at 0x1000d0b8:

```
HKLM\SOFTWARE\EACom\AuthAuth\
    AuthLoginServer        REG_SZ  → auth server hostname (default fallback: "ea4.dev.ea.com")
    AuthLoginBaseService   REG_SZ  → URL path prefix (e.g. "/AuthLogin")
```

If the registry key is absent the client falls back to the compiled-in default `ea4.dev.ea.com`.

### 2.2 Auth Request

Confirmed from RE of `authlogin.dll` (strings at 0x1000d0d0–0x1000d110; InternetConnectA/HttpOpenRequestA call sites at ~0x10001aff and ~0x10001ce7):

```
GET /{AuthLoginBaseService}?username=X&password=Y&serviceID=Z&version=2.0 HTTP/1.0
```

- HTTP version: **HTTP/1.0** (lpszVersion parameter to HttpOpenRequestA; `"HTTP/1.0"` string at 0x1000d0d4).
- User-Agent: `"AuthLogin"` (lpszAgent to InternetOpenA; string at 0x1000d074).
- Port: **443** (nServerPort = 0x1BB = 443, confirmed from InternetConnectA call at ~0x10001aff).
- `serviceID` — a numeric string identifying the game/service.

### 2.3 Auth Response

Plain-text body:

```
Valid=TRUE\n
Ticket=<hex_string>\n
```

- `Ticket` is an opaque hex string used as the auth token in the 0x501 NPSUserLogin message.
- On failure: `Valid=FALSE\n` (no Ticket field).
- Response field names confirmed from RE string table: `"Valid"` at 0x1000d1d0, `"Ticket"` at 0x1000d1a0, `"TRUE"` at 0x1000d1cc.

### 2.4 TLS Behaviour — SSLRetry Mechanism

Confirmed from RE of `authlogin.dll` code at 0x10001d0f–0x10001d68 and string `"SSLRetry"` at 0x1000d068:

The client uses **WinINet** (InternetConnectA → HttpOpenRequestA → HttpSendRequestA) with an internal **SSLRetry** loop:

1. First attempt: `HttpSendRequestA` with default SSL certificate validation.
2. If the request fails and `GetLastError` returns one of:
   - `12037` (0x2F05) — `ERROR_INTERNET_SEC_CERT_DATE_INVALID`
   - `12043` (0x2F0B) — `ERROR_INTERNET_SEC_CERT_REV_FAILED`
   - `12045` (0x2F0D) — `ERROR_INTERNET_SEC_INVALID_CA`
3. The client calls `InternetSetOptionA(hRequest, INTERNET_OPTION_SECURITY_FLAGS=31, existing_flags | 0xF180)`.

   The `0xF180` mask bypasses:
   | Flag value | Meaning |
   |-----------|---------|
   | `0x0080`  | `SECURITY_FLAG_IGNORE_REVOCATION` — ignore cert revocation errors |
   | `0x0100`  | `SECURITY_FLAG_IGNORE_UNKNOWN_CA` — accept unknown/self-signed CA |
   | `0x1000`  | `SECURITY_FLAG_IGNORE_CERT_CN_INVALID` — accept hostname mismatch |
   | `0x2000`  | `SECURITY_FLAG_IGNORE_CERT_DATE_INVALID` — accept expired cert |
   | `0x4000`  | redirect-related ignore flag |
   | `0x8000`  | redirect-related ignore flag |

4. `HttpSendRequestA` is called a second time with the relaxed flags.

**Implication for server operators:** A server MAY use a self-signed, expired, or hostname-mismatched TLS certificate. The client will fail the first attempt and succeed on the SSLRetry.

### 2.5 Server Implementation Notes

A server implementation MUST:
1. Listen on port **443** (or whatever port is configured in `HKLM\SOFTWARE\EACom\AuthAuth\AuthLoginServer` — client always connects to port 443 unless the registry value encodes a different port).
2. Terminate TLS (reverse proxy or Python `ssl.SSLContext`). A self-signed certificate is sufficient; the client's SSLRetry will bypass certificate validation errors (§2.4).
3. Accept any username/password and return `Valid=TRUE\nTicket=<hex>\n`.
4. Include a `Ticket` value in every successful response. The ticket is forwarded by the client to the NPS server in the 0x501 message. A server MAY accept it without cryptographic validation.

---

## 3. NPS Login/Persona Server Wire Framing

Used for all operations in sections 6–9. **NOT** TOMC-framed.

### 3.1 Message Frame

```
 Offset  Size  Type       Field
 ------  ----  ---------  -----
 0       2     uint16 BE  opcode
 2       2     uint16 BE  total_len   (= 12 + payload_size; includes all header bytes)
 4       2     uint16 BE  version     (client sends 0x0101; receiver MUST NOT validate)
 6       2     uint16 BE  reserved    (0)
 8       4     uint32 BE  checksum    (client sends total_len; receiver MUST NOT validate)
 12      N     bytes      payload
```

**total_len INCLUDES the 12-byte header.** A message with no payload has total_len = 12.

This is the `NPS_Serialize` "v1" header (header flag = 1, the constructor default at
`NPS_Serialize::NPS_Serialize` 0x00bb90d0). `NPS_Serialize::deserialize` (0x00bb9970) copies
`version` and `checksum` into the object and compares neither; `Header::getDataPtr`
(0x00bb9550) returns header+12. Transport (`NPSLoginComm::Read`, 0x00ac18e0) reads only the
first 4 bytes (opcode, total_len) and then `total_len - 4` more, so only those two fields
must be correct.

Confirmed from:
- `FUN_00bb9550`: advances write pointer by 12 (header size)
- `vtable[1]()`: returns `12 + payload_size` (total bytes to send)
- `FUN_00ac2070`: sends exactly `vtable[1]()` bytes

### 3.2 Reading a Frame

```
1. Read 4 bytes → opcode (uint16 BE), total_len (uint16 BE)
2. Read (total_len - 4) bytes → remaining 8 header bytes + payload
3. payload = bytes[12 .. total_len]
```

### 3.3 NPS String Encoding

Within payloads, variable-length strings are encoded as:

```
[uint16 BE length][length bytes (no null terminator)]
```

An empty string MUST be encoded as `[uint16 BE 0]` with no following bytes.

Confirmed from `FUN_00bb9aa0` (NPS string packer) and `FUN_00bb9d10` (sub-message reader).

### 3.4 Sub-Message Encoding

Some fields use a sub-message envelope:

```
[uint16 BE sub_len][sub_len bytes]
```

**The reader does not honour `sub_len` for the nested parse.** `NPS_Serialize::_deserialize(NPS_Serialize*)`
(0x00bb9d10) reads `sub_len`, then deserializes the nested object starting right after it
(with header flag 0) regardless of `sub_len`, and only then advances the outer cursor by
`sub_len`. Consequences:

- The nested object always consumes its own full field list from the bytes that follow.
- `sub_len` MUST equal the size of the nested object's encoding, or the outer parse
  desyncs. `sub_len = 0` is NOT an empty field: the nested parse still reads the
  following bytes, and the outer cursor then re-reads the same bytes as its next field.
- To send a "blank" sub-object, encode every field of it with zero/empty values and set
  `sub_len` to that encoded size.

---

## 4. TOMC Lobby/Room Server Wire Framing

Used for the lobby handshake (section 10) and all lobby/room messages (section 11).

### 4.1 Outer TOMC Frame

```
 Offset  Size  Type       Field
 ------  ----  ---------  -----
 0       2     uint16 LE  wire_length   (= 9 + nps_size)
 2       4     bytes      magic = "TOMC"
 6       4     uint32     zeros
 10      1     uint8      flags
 11      N     bytes      nps_payload
```

- `wire_length` is LE (the only LE field in the NPS protocol).
- flags = 0x00 for application messages; flags = 0x80 for transport-level keepalives.

### 4.2 Transport Keepalives (flags = 0x80)

```
nps_payload = [uint32 LE opcode]
  0x0000F216 = PING (server may send or receive)
  0x0000F207 = PONG (response to PING)
```

### 4.3 NPS Application Message (flags = 0x00)

Nested inside TOMC:

```
 Offset  Size  Type       Field
 ------  ----  ---------  -----
 0       2     uint16 BE  opcode
 2       2     uint16 BE  msg_len   (= 4 + payload_size; includes only this 4-byte header)
 4       N     bytes      payload
```

**Note:** The NPS message header here is 4 bytes (opcode + msg_len), NOT the 12-byte login-stream header.

### 4.4 Lobby Handshake (pre-TOMC)

The first message in a lobby connection is sent raw (no TOMC wrapping) using the same 4-byte NPS message format:

```
[uint16 BE opcode][uint16 BE total_len][payload]
```

where total_len = 4 + payload_size.

---

## 5. Port and Address Configuration

### 5.1 Shard Configuration Discovery

The client fetches shard configuration via HTTP GET from a configurable URL.

#### 5.1.1 URL Selection (in priority order)

1. Registry key `HKLM\SOFTWARE\Electronic Arts\Motor City\1.0\ShardUrlTest` (if present)
2. Registry key `HKLM\SOFTWARE\Electronic Arts\Motor City\1.0\ShardUrlDev` (if not equal to the hardcoded default)
3. Hardcoded fallback: `http://159.153.226.86/ShardList/`

Confirmed from `FUN_0083e0b0` (registry reader) and `FUN_0083e7d0` (fetcher, logs `"Fetching Shard List: <URL>"`).

#### 5.1.2 Response Format (INI-style text)

The response body is an **INI-style text file** (EA internal format, source file `gini.cpp`). Each shard is a separate INI section; the section name is arbitrary (client iterates sections by index). Keys within each section:

```
[<arbitrary section name>]
ShardId=<integer>
MCOTSServerIP=<ip_string>
LoginServerIP=<ip_string>
LoginServerPort=<port_integer>
LobbyServerIP=<ip_string>
LobbyServerPort=<port_integer>
```

Example (one shard):

```
[Shard1]
ShardId=1
MCOTSServerIP=203.0.113.10
LoginServerIP=203.0.113.10
LoginServerPort=8226
LobbyServerIP=203.0.113.10
LobbyServerPort=7003
```

- **Maximum response size**: 10240 bytes (0x2800). Client logs `"Shard list Too Big to log!"` and discards if exceeded.
- **Multiple shards**: Add additional `[SectionN]` blocks. Client selects a shard randomly from the list.
- The raw body is logged verbatim between `"---------- BEGIN SHARD LIST -----------"` and `"---------- END SHARD LIST -----------"` markers in the client debug log.

**`MCOTSServerIP` is structurally required**: the INI parser in `FUN_008362d0` uses deeply-nested
`if/else` blocks — each field is only read inside the `else` of the previous one. If `MCOTSServerIP`
is absent, the client never reads `LoginServerIP`, `LoginServerPort`, `LobbyServerIP`, or
`LobbyServerPort`. The field MUST be present even though no server needs to listen on its port
(see §5.1.4).

Confirmed from:
- `FUN_0083e990` (HTTP response logger + size check)
- `FUN_00833690` → `FUN_00b1f740` (INI parser, `gini.cpp`)
- `FUN_008339e0` (get-shard-by-index, looks up `"ShardId"` key via `FUN_00b1ee20`)
- `FUN_008362d0` (reads ShardId, MCOTSServerIP, LoginServerIP, LoginServerPort, LobbyServerIP, LobbyServerPort into client globals)

#### 5.1.3 Client-side Storage

After parsing, the client stores:
- `MCOTSServerIP` → `DAT_020d6150` (max 127 bytes, null-terminated at +0x7f)
- `LoginServerIP` → `DAT_015d0d60+8` (max 255 bytes)
- `LoginServerPort` → `DAT_015d0d60+0x308` (uint32)
- `LobbyServerIP` → `DAT_015d0d60+0x108` (max 255 bytes)
- `LobbyServerPort` → `DAT_015d0d60+0x30c` (uint32)

#### 5.1.4 MCOTS — Leaderboard Server (Optional for Core Flow)

**MCOTS** = Motor City Online Traffic Server / Leaderboard server. Source: `DBResultQ.C`
(`DBResultQ_EnsureServerID`). Connects to `MCOTSServerIP` on port **43300** (0xa924).

The `MCOTSServerIP` value can also be overridden by reading the `LBServer` registry value
from `HKLM\SOFTWARE\Electronic Arts\Motor City\1.0` (`FUN_006b07c0`).

Connection failures are **non-blocking**: the client logs `"Failed to connect to LB"` or
`"MCOTS connect failed!"` and continues. No server needs to listen on port 43300 for the
core login → persona → lobby → room flow to work.

A private server MUST include `MCOTSServerIP` in the shard response (for the parser),
but SHOULD NOT expose port 43300 unless leaderboard functionality is implemented.

The parsed shard list is also cached locally at `<AppPath>\nps\shardlistip.ini`.

#### 5.1.4 `<SHARDS>` XML Tags (Separate Subsystem)

The client also registers `<SHARDS>`, `<PERSONAS>`, `<DELETE>`, `<CREATE>` XML tokens in `FUN_0083a750`. These are used by a **separate, push-based** XML parser for server-sent persona and shard update messages over an already-established connection. They are **not** part of the HTTP shard list response format.

### 5.2 NPS Login/Persona Ports

Confirmed from RE of `FUN_00abbd00` (0x501) and `FUN_00aa7ff0` (0x532) — both read `LoginServerPort` from `[0x020e510c]` but differ in one instruction:

| Opcode | Operation | Port |
|--------|-----------|------|
| 0x501 | NPSUserLogin | `LoginServerPort` (`MOVSX ECX,[0x020e510c]` → `PUSH ECX`) |
| 0x532 | NPSGetPersonaMaps | `LoginServerPort + 2` (`MOVSX ECX,[0x020e510c]` → `ADD ECX,2` → `PUSH ECX`) |
| 0x502 | NPSGetFirstGamePersona | `LoginServerPort + 2` (same pattern as 0x532) |
| 0x507 | NPSCreateGamePersona | `LoginServerPort + 2` (same pattern as 0x532) |

The server MUST listen on **both** `LoginServerPort` and `LoginServerPort+2`. Both ports use the same handler.

### 5.3 Lobby Port

The client connects to **`LobbyServerPort` directly** as advertised in the shard config. `LobbyServerPort` MUST be different from `LoginServerPort` and `LoginServerPort+2`.

### 5.4 Recommended Private Server Layout

```
HttpPort        = 3000  (shard config at /ShardList/ + auth at all other paths)
LoginServerPort = 8226  (0x501 NPSUserLogin connects here)
                 8228   (LoginServerPort+2: 0x532/0x502/0x507 connect here)
LobbyServerPort = 7003  (lobby server, TOMC framing)
RoomPort        = 7000  (room server, also TOMC framing)
```

Client registry keys to redirect to this server:

```
ShardUrlTest    = http://<server-ip>:3000/ShardList/
AuthLoginServer = <server-ip>
```

### 5.5 Connection Pattern

Each NPS persona operation opens its own **short-lived TCP connection**:

1. Client connects to the appropriate port (see §5.2)
2. Client sends one request message
3. Server sends one response message (or error)
4. **Client initiates close**: calls `shutdown(sd, SD_BOTH=2)` then `closesocket(sd)`

Confirmed from RE of `FUN_00bbb390` (socket close helper), called from `FUN_00ac16c0` (cleanup),
called from `FUN_00abbd00` (NPSUserLogin) after the response is received. The binary at
0x00bbb3bb–0x00bbb3d0 shows: `PUSH 2; PUSH socket; CALL shutdown_wrapper` followed immediately
by `PUSH socket; CALL closesocket_wrapper`.

The server MUST NOT rely on the client's FIN to detect end of request — instead the server
reads one complete NPS message (fixed header length then `total_len` bytes total), writes one
response, and MAY close immediately after `drain()`. The client will observe the server's FIN
and proceed through its own shutdown sequence.

---

## 6. Operation: NPSUserLogin (0x501 → 0x601)

Client side: `cNPSLoginAPI::NPSUserLogin` (0x00abbd00) on `LoginServerPort` (§5), transport
`NPSLoginComm`, 12-byte v1 header (§3.1). Classes: request `NPS_AAILogin`, response
`GLDP_UserStatus`. (The persona operations, §7-9, use `LoginServerPort + 2`; the lobby,
§4, is a different API, `NPSConnectToServer`, on `LobbyServerPort`.)

Verified 2026-09-30 by decompile and against a live client log (`MCity_Log.txt`).

### 6.1 Request: 0x501 `NPS_AAILogin`

Built in `NPSUserLogin`: `NPS_AAILogin::NPS_AAILogin` (constructor, 0x00abdb10), then
`setMessageId(0x501)` and `NPS_Serialize::serialize`.

Before building it, the client:
1. Obtains the auth ticket. Normally via HTTP (`Auth_GetNewTicket`, §2). If a registry flag
   under `SOFTWARE\Electronic Arts\Network Play System\System` selects it, a virtual call
   is used instead, very likely `NPS_AAI_RequestEAS` (0x530 `NPS_AAIRequest` → 0x620
   `NPS_AAIRequestReply`, same port; the reply's `context` string plays the ticket role).
   The slot target is not yet confirmed.
2. Generates its own 32-byte session key (`FUN_00abdf10` → `UserState::sessionKey`), logs it
   as `created crypto: skey = ...`, and places an encrypted form in the request
   (`FUN_00abe310` → `NPS_AAILogin::setEncryptedSessionKey`).

A server MAY treat the payload as opaque. Known fields (partial):

| Offset | Type       | Field                          |
|--------|------------|--------------------------------|
| 0      | uint32 BE  | customerID                     |
| 4      | NPS string | persona name (may be empty)    |
| ...    | ...        | game name, auth ticket, encrypted session key (layout not yet mapped) |

### 6.2 Exchange: two reads

After sending, the client calls `NPSLoginComm::Read` twice:

| Call | Timeout | Log line | What it requires |
|------|---------|----------|------------------|
| `Read(0x1e)` | 30 s | `Waiting for Login Server ACK` | Any complete, correctly framed message. The opcode is not inspected. |
| `Read(0x78)` | 120 s | `Waiting for Login response` | The real response, dispatched on opcode (§6.3, §6.4). |

The second read replaces the first message, so only the second is parsed. A server MUST
send two messages; sending the 0x601 twice works. Sending only one makes the second read
time out.

### 6.3 Response: 0x601 `GLDP_UserStatus`

Parsed by `NPS_Serialize::deserialize(data, false)` into a `GLDP_UserStatus`
(`_doDeserialize` 0x00abda10). Payload, after the 12-byte header:

```
 Field                Type                         Client use
 -------------------  ---------------------------  ------------------------------------------
 customerId           uint32 BE                    -> param_5+4; the only login output
                                                      (`NPSUserLogin success: <id>`,
                                                      `Account_GetCustomerId` 0x00591490)
 (unnamed)            uint32 BE                    stored at +0x504, never read
 (unnamed)            bool (uint8)                 stored at +0x508, never read
 ban                  sub-msg: GLD_UserAction      param_5[0] = ban().isValid()
 gag                  sub-msg: GLD_UserAction      param_5[1] = gag().isValid()
 sessionKey           sub-msg: NPS_SessionKey      parsed, then discarded
 (unnamed)            uint32 BE                    stored at +0x554, never read
 metricsId            NPS string, max 0x40         stored at +0x558, never read here
```

`GLD_UserAction` (`_doDeserialize` 0x00abd4c0), header flag 0:

```
 uint32 BE   (unnamed, +0x20)
 int32  BE   active      (+0x24)
 int32  BE   expiry      (+0x28, time_t)
 NPS string  max 0x40
 NPS string  max 0x100
 NPS string  max 0x100
```

All-zero/empty encoding is 18 bytes (12 + 3 x 2), so a blank action is sent as
`sub_len = 18` followed by 18 zero bytes. `GLD_UserAction::isValid` (0x00abd700):
`active == 0` → false; else `expiry == 0` → true (permanent); else `time() < expiry`.

`NPS_SessionKey` (`_doDeserialize` 0x00aa7790), header flag 0:

```
 NPS string  key, max 0x20
 int32  BE   (unnamed, +0x44)
```

Blank encoding is 6 bytes: `sub_len = 6`, then 6 zero bytes.

**Minimal correct 0x601 payload** (customerId C, no ban, no gag, blank key):

```
 C (4)  00000000  00  0012 <18 x 00>  0012 <18 x 00>  0006 <6 x 00>  00000000  0000
```

Payload size 4+4+1+20+20+8+4+2 = 63; total_len = 75.

**The session key the client keeps is its own.** On success `NPSUserLogin` copies the
key it generated in §6.1 into `param_5+8` (length at `param_5+0x28`, object at
`param_5+0x2c`) and logs `storing crypto: skey = ...` with the same bytes as `created crypto`.
Nothing the server sends affects it, so the server cannot disable encryption from the
0x601.

**Sub-message lengths must be exact (§3.4).** A short or mislabelled ban/gag field makes
the nested parse read whatever follows. If those bytes put a non-zero value in `active`
and a future `expiry`, the user is flagged as banned or gagged.

### 6.4 Other responses

Handled in the `switch` after `Read(0x78)`. All use the 12-byte header with no payload.

| Opcode | Log string | NPSUserLogin returns |
|--------|------------|----------------------|
| 0x0601 | `NPSUserLogin success: <customerId>` | 0 |
| 0x0602 | `NPSUserLogin USER_NOT_FOUND` | 0xfffffff5 |
| 0x0610 | `NPS_USER_NOT_AUTHORIZED` | 0xffffff96 |
| 0x0623 | `NPS_AUTH_DENIED i.e., restricted access` | 0xffffff72 |
| 0x0626 | `NPS_USER_BANNED` | 0xffffff81 |
| 0x0637 | `CRC_MISMATCH` | 0xffffff73 |
| other  | `NPSUserLogin recved ERR msgId: 0x...` | 0xffffffff |

The 0x0602 row is confirmed from the decompile. The other error rows come from a subagent
trace and have not been re-read directly. A failed or timed-out read returns its own
status. See also §15.

---

## 7. Operation: NPSGetPersonaMaps (0x532 → 0x607)

Function: `FUN_00aa7ff0`.

This operation retrieves the persona-to-game mapping for an account. It runs **after** NPSUserLogin on a new TCP connection to the same port.

### 7.1 Request: 0x532

```
Header: [uint16 BE 0x0532][uint16 BE 16][zeros...]
Payload (4 bytes):
  [uint32 BE customerId]
```

total_len = 12 + 4 = 16.

Confirmed from `FUN_00aa88d0` (serializer).

### 7.2 Response: 0x607 NPSPersonaMapList

```
Header: [uint16 BE 0x0607][uint16 BE total_len][zeros...]
```

Payload:

```
 Offset  Size       Type       Field
 ------  ---------  ---------  -----
 0       2          uint16 BE  personaCount  (N)
 2       N * varies sub-msg    persona records (see 7.3)
 after   1          uint8      maxPersonaCount
```

Confirmed from `FUN_00aa9ac0` (outer deserializer), `FUN_00aa9080` (inner list serializer).

### 7.3 Persona Sub-Object Wire Format

Each persona record is wrapped in a sub-message envelope:

```
[uint16 BE subLen][subLen bytes of persona data]
```

Persona data (confirmed from `FUN_00aa9850`, vtable[2] at PTR_FUN_011fda34):

```
 Offset  Size  Type       Field           Notes
 ------  ----  ---------  -----           -----
 0       4     uint32 BE  customerId      Account-level customer ID
 4       4     uint32 BE  gameUserId      Persona-level game user ID
 8       4     uint32 BE  field_0x28      (semantic TBD; game_struct[0x50c])
 12      4     uint32 BE  field_0x2c      (semantic TBD; game_struct[0x2c])
 16      2     uint16 BE  nameLen         Persona name length
 18      N     bytes      name            Persona name (no null terminator)
```

Field semantics confirmed from cross-referencing `FUN_00aa8b70` (persona data copier):
- `persona+0x20` → `game_struct[0]` = customerId
- `persona+0x24` → `game_struct[0x38]` = gameUserId (matches GameUserId log output)
- `persona+0x30` → `game_struct+4` = persona name (matches GameUserName log output)

### 7.4 Error Response: 0x602

If the customerId is unknown or invalid, the server MUST respond with `0x602` (no payload, total_len = 12).

---

## 8. Operation: NPSGetFirstGamePersona (0x502 → 0x613 + 0x607×N)

Function: `FUN_00ab9670`.

Retrieves the first available game persona. Uses the same TCP port as NPSUserLogin but a new connection. The response is split across multiple messages: one 0x613 count header followed by N individual 0x607 persona records.

### 8.1 Request: 0x502

```
Header: [uint16 BE 0x0502][uint16 BE total_len][zeros...]
Payload:
  [uint32 BE customerId]
  [uint16 BE gameNameLen]
  [gameNameLen bytes of game name]
```

For Motor City Online, `gameName = "Motor City"` (10 bytes).

total_len = 12 + 4 + 2 + 10 = 28.

Confirmed from `FUN_00aba0b0` (serializer) and `FUN_00589b30` (passes "Motor City").

### 8.2 First Response: 0x613 NPSPersonaCount

```
Header: [uint16 BE 0x0613][uint16 BE 14][zeros...]
Payload (2 bytes):
  [uint16 BE personaCount]
```

total_len = 12 + 2 = 14.

Confirmed from `FUN_00aba340` (vtable[3] deserializer calls `FUN_00aa92c0` which reads uint16 BE) and `FUN_00aba260` (returns the count as uint16).

### 8.3 Subsequent Responses: 0x607 NPSPersonaRecord (×N)

After 0x613, the server sends **one 0x607 per persona**. The client waits for each with a 120-second timeout.

Each 0x607 frame contains a **single** persona record (not a list). Wire format:

```
Header: [uint16 BE 0x0607][uint16 BE total_len][zeros...]
Payload:
  [uint16 BE 1]           personaCount = 1 (always)
  [uint16 BE subLen]
  [subLen bytes]          persona data (same format as Section 7.3)
  [uint8 maxPersonaCount] max allowed personas for this account
```

**Note:** The outer 0x607 payload structure matches the NPSGetPersonaMaps response even for single-persona responses. The client uses `FUN_00ab6c50` to copy the persona data into its 0x510-byte game struct.

### 8.4 No Personas Case

If `personaCount == 0` in the 0x613 response, the server MUST NOT send any 0x607 messages. The client will proceed to NPSCreateGamePersona.

---

## 9. Operation: NPSCreateGamePersona (0x507 → 0x601)

Function: `FUN_00ab5a80`.

Creates a new game persona. Called when NPSGetFirstGamePersona returns count 0. New TCP connection to the same port.

### 9.1 Request: 0x507

Serializer: `FUN_00ab52d0` (vtable[2] at PTR_FUN_011fe464).

Payload (all fields confirmed from binary):

```
 #   Size  Type       Field                  Source (game_struct offset)
 --  ----  ---------  -----                  -----
 1   4     uint32 BE  customerId             [+0x00]
 2   var   NPS string persona name           [+0x04] (max 32 bytes)
 3   4     uint32 BE  field_0x28             [+0x28]
 4   4     uint32 BE  field_0x2c             [+0x2c]
 5   4     uint32 BE  field_0x30             [+0x30]
 6   4     uint32 BE  field_0x34             [+0x34]
 7   4     uint32 BE  gameUserId             [+0x38] (0 for new persona)
 8   2     uint16 BE  bool_flag              [+0x3c] (0 or 1)
 9   4     uint32 BE  field_0x40             [+0x40]
 10  var   NPS string game name              [+0x44] = "Motor City"
 11  4     uint32 BE  field_0x68             [+0x68]
 12  4     uint32 BE  field_0x6c             [+0x6c]
 13  var   NPS string string_0x70            [+0x70] (may be empty)
 14  var   NPS string string_0x270           [+0x270] (may be empty)
 15  var   NPS string string_0x370           [+0x370] (may be empty)
 16  1     uint8      bool_flag_2            [+0x3c8]
 17  4     uint32 BE  field_0x374            [+0x374]
 18  var   NPS string string_0x378           [+0x378] (may be empty)
 19  2     uint16 BE  field_0x508            [+0x508]
 20  4     uint32 BE  field_0x50c            [+0x50c]
```

NPS string = `[uint16 BE len][len bytes]`; empty = `[0x00 0x00]`.

A server MUST parse:
- Field 1: customerId (SHOULD verify it matches the session)
- Field 2: persona name (MUST store as the new persona's name)

A server MAY parse fields 3–20 and MAY store or ignore their values.

### 9.2 Success Response: 0x601

Same format as Section 6.2. The `userId` in the 0x601 payload is the new persona's server-assigned ID.

### 9.3 Error Responses

| Opcode | Meaning                              |
|--------|--------------------------------------|
| 0x0602 | User not found / invalid customerId  |
| 0x020a | Persona name already in use          |
| 0x060a | Create persona failed                |
| 0x0612 | Unknown error                        |
| 0x0621 | Persona limit reached                |
| 0x0634 | —                                    |
| 0x0635 | —                                    |
| 0x0636 | —                                    |
| 0x0637 | —                                    |
| 0x0640 | —                                    |
| 0x0641 | —                                    |

All error responses have no payload (total_len = 12).

---

## 10. Operation: NPS Lobby Handshake (0x100 → 0x120)

The lobby uses a **separate, persistent TCP connection** to the lobby port (Section 5). The connection begins with a 4-byte-header handshake (not 12-byte), then transitions to TOMC framing.

### 10.1 Client Request: 0x0100 NPS_USER_LOGIN

```
[uint16 BE 0x0100][uint16 BE total_len][payload]
```

Payload format (`lpb llpppb`):

| Field       | Type       | Description                        |
|-------------|------------|------------------------------------|
| userId      | uint32 BE  | userId from 0x601 (Section 6)      |
| name        | NPS 'p'    | persona name (`[uint32 len+1][bytes][0x00]`) |
| blob        | 64 bytes   | `tsMCity_UserData` struct (see §10.3) |
| token       | uint32 BE  | session token                      |
| field_c8    | uint32 BE  | —                                  |
| version     | NPS 'p'    | client version string              |
| hostname    | NPS 'p'    | client hostname                    |
| ip          | NPS 'p'    | client IP string                   |
| sessionKey  | 16 bytes   | session key                        |

**Note:** The 'p' format in lobby handshakes is `[uint32 BE (len+1)][bytes][0x00 null]`, not NPS string `[uint16 BE len][bytes]`. This is the lobby-specific 'p' format.

### 10.2 Server Response: 0x0120 NPS_LOGIN_OK

```
[uint16 BE 0x0120][uint16 BE total_len][payload]
```

Payload format (`lpb`):

| Field  | Type      | Description                   |
|--------|-----------|-------------------------------|
| userId | uint32 BE | echo back the userId          |
| name   | 'p'       | persona name (echo back)      |
| blob   | 64 bytes  | user blob (zeros acceptable)  |

Both sides MUST switch to TOMC-framed messages after the handshake completes.

### 10.3 64-Byte User Data Blob (`tsMCity_UserData`) — CONFIRMED 2026-06-28

**Source:** RE of `Pit_GetUserData` (0x0089e210), `tCarIDs` methods (`GetDBID`/`GetBPT`/`SetStock`/`SetInstanced`/`SetSkin`), `tsMCity_UserData::SetPerformance` (0x005c61a0), and `MCar_SetFromPlayer` (MCEVENT_GETCARDEF handler).

The 64-byte blob that appears in:
- 0x0100 client login (§10.1) — sent by client on connect
- 0x0120 server login response (§10.2) — echoed or zeroed by server
- 0x0203 NPS_USER_JOINED — broadcast to all users when a user connects
- 0x0211 NPS_USER_LIST — included in all user list entries

This blob IS the `tsMCity_UserData` struct (59 bytes active + 5 bytes padding to 64).  
It starts with an embedded `tCarIDs` struct (38 bytes) that identifies the player's current car.

**`tCarIDs` struct layout** (at blob+0x00, 38 bytes):

```
Offset  Size  Field      Description
------  ----  -----      -----------
+0x00   4     dbID       uint32: Database car instance ID.
                          0 = stock/unmodified car; non-zero = player's custom car DB key.
+0x04   4     bptID      uint32: Body Part Type ID = stock car model number (the car type/model).
+0x08   4     skinID     uint32: Skin / color ID.
+0x0c   1     flags      byte: internal flags (server: treat as opaque).
+0x0d   3     (padding)  3 bytes alignment padding — copy constructor skips these.
+0x10   4     field_10   uint32: unknown (copy constructor copies; likely part-related).
+0x14   4     field_14   uint32: unknown.
+0x18   4     field_18   uint32: unknown.
+0x1c   4     field_1c   uint32: unknown.
+0x20   1     isInstanced byte: non-zero if car is a custom instance (zeroed by SetStock).
+0x21   1     skinFlag   byte: skin variant flag (set by SetSkin 2-arg overload; 0 = default skin).
+0x22   4     decalID    uint32: Car decal / number plate ID (tCarDecal struct, 4 bytes).
+0x26   2     (padding)  2 bytes alignment padding before next uint32.
```

**`tsMCity_UserData` remainder** (blob+0x28 onward):

```
Offset  Size  Field         Description
------  ----  -----         -----------
+0x28   4     serverID      uint32: Current lobby/room server ID (DAT_01408c28); 0 if offline.
+0x2c   4     clubID        uint32: Player's club affiliation (from MCityDBIPersona::GetClub).
+0x30   1     statusFlags   byte: Bitfield:
                              bit 0 = 1 if player is connected to lobby or pit (online)
                              bit 1 = 1 if player is in a race room (inRoom); 0 if in lobby
                              bit 2 = 1 if race-ready flag is set (DAT_01408d78 & 1)
                              bit 3 = always 1 (set unconditionally at end of Pit_GetUserData)
+0x31   1     accelEnc      byte: Encoded acceleration (0–255 scale).
+0x32   1     topSpeedEnc   byte: Encoded top speed (0–255 scale).
+0x33   1     handlingEnc   byte: Encoded handling (0–255 scale).
+0x34   1     (reserved)    byte: High byte of performance word — 0 unless previously set.
+0x35   4     points        int32: Persona points (from MCityDBIPersona::GetPoints).
+0x39   2     level         int16: Persona level (from MCityDBIPersona::GetLevel).
+0x3b   5     (padding)     Zero padding to reach 64-byte blob boundary.
```

**Performance encoding** (`SetPerformance` at 0x005c61a0):
```
accelEnc    = encode(accel)         & 0xff
topSpeedEnc = encode(topSpeed)      & 0xff
handlingEnc = encode(handling * 8000) >> 13 & 0xff
```
Where `encode(x)` = `FUN_005c6280(x)` = a float-to-scaled-int converter.

**Car identification summary for server:**
- To know what car model a player is using: read **`dbID` at blob+0x00** and **`bptID` at blob+0x04**.
  - If `dbID == 0`: player has a stock (unmodified) car of model `bptID`.
  - If `dbID != 0`: player has a customized car; `dbID` is the DB primary key and `bptID` is its base model.
- **`skinID` at blob+0x08**: the car's skin/color.
- The server does NOT need to look up the car separately — each user entry carries this data.
- The server MUST relay the blob unchanged in NPS_USER_JOINED (0x0203) and NPS_USER_LIST (0x0211) so other clients can read the car data. Other clients call `MCar_SetFromPlayer` (event MCEVENT_GETCARDEF=0x66) to load the opponent's car from this blob.

**How the blob is populated:**
1. At login, `Pit_GetUserData()` (0x0089e210) fills the struct from:
   - `DAT_01408bd8` — the player's active `tCarIDs` global (set by `Garage_RestoreCar` → `Garage_GetIn` on login; see §10.3.1)
   - `DAT_0161753c` — the player's persona DB object (club, level, points)
   - `MCityDBICar::GetWAGS()` — WAGS (vehicle performance) data for performance fields
2. The filled blob is placed at `NPSArg_ConnectToServer+0x6c` before calling vtable[1] (`FUN_00ace8f0`) to build the 0x0100 login message.
3. Players can update their blob at any time via **0x0103 NPSSetMyUserData** — the client calls this when the car changes (e.g., after leaving the workshop). The server MUST broadcast the update to all users in the same channel.

#### 10.3.1 Car Data Origin Chain (how `DAT_01408bd8` is populated) — CONFIRMED 2026-06-28

**Source:** RE of `Garage_GetIn` (0x0080b240), `Garage_RestoreCar` (0x0080b120), `MCityDBIPersona::InitGameSetup` (0x005bd560), `MStarterCarLot::CarSelected` (0x007cf390).

`DAT_01408bd8` is a process-global `tCarIDs` struct. It contains two distinct kinds of data written by separate subsystems:

**A) Car ID fields** (which car is selected): written by:

1. **`Garage_GetIn(dbID, stockID)` at 0x0080b240** — the primary car-selection path during an active session.
   - Called when the player enters a car from the garage UI.
   - Guards: checks `Garage_CanChangeCar()` and that the selected car differs from the current one.
   - Writes: `tCarIDs::SetInstanced(&DAT_01408bd8, dbID, stockID)` — sets custom car dbID + base stock model.
   - Side-effect: saves `dbID` to `_PersonaOptions` (persisted across sessions via `Persona_tOptions::Save`).

2. **`Garage_RestoreCar(int)` at 0x0080b120** — called at login to restore the last active car.
   - Guards: must be connected to NPS (`cNPS_RoomServer::isConnected`) and have no custom car currently active.
   - Calls `MCityDBIOwnedCars::Get(DAT_01617540, ...)` — fetches the player's owned car list from the game database.
   - Finds the entry matching `_PersonaOptions` (the saved active car dbID) via `DBCarIDListOutputData::FindPartID`.
   - If found: calls `Garage_GetIn(car.dbID, car.stockID)` → `tCarIDs::SetInstanced(&DAT_01408bd8, dbID, stockID)`.
   - If not found: clears `_PersonaOptions` (car no longer owned; fall back to no active car).

3. **`MStarterCarLot::CarSelected` at 0x007cf390** — new players only; first car selection from the starter lot.
   - Calls `tCarIDs::SetStock(&DAT_01408bd8, bptID)` — stock car, no dbID.
   - Only runs once during account creation; thereafter `Garage_GetIn` / `Garage_RestoreCar` are used.

**B) Driver appearance + decal fields**: written by:

4. **`MCityDBIPersona::InitGameSetup` at 0x005bd560** — called when the persona record is loaded from the game DB.
   - Calls `tCarIDs::SetDriver(&DAT_01408bd8, driverModel, hair, skin, shirt, pants)` — driver avatar appearance from the persona DB record.
   - Calls `tCarIDs::SetDecal(&DAT_01408bd8, decal)` — car number plate from the persona DB record.

**Complete login-time sequence that fills `DAT_01408bd8`:**

```
1. MCityDBIPersona::InitGameSetup  → SetDriver + SetDecal  (driver look from DB)
2. Garage_RestoreCar               → Garage_GetIn           (which car from DB)
3. Pit_GetUserData                 → reads DAT_01408bd8     (packs into 64-byte blob)
4. 0x0100 NPS_USER_LOGIN           → sends blob to server
```

**Active-session update:**

```
Player selects different car in Garage UI
  → Garage_GetIn(dbID, stockID)
  → tCarIDs::SetInstanced(&DAT_01408bd8, ...)  [updates global]
  → _PersonaOptions saved                      [persisted for next login]
  → Pit_UpdateRoom()                           [re-packs blob, sends 0x0103 NPSSetMyUserData]
```

**Server implementation note:** The server does NOT need to manage car selection — that is handled entirely by the game DB and client. The server's only car-related obligations are:
- Store the 64-byte blob per user (received in 0x0100 and updated via 0x0103).
- Relay the blob unchanged in 0x0203 NPS_USER_JOINED and 0x0211 NPS_USER_LIST entries.
- Broadcast 0x0103 blob updates to all users in the same channel.

---

## 11. Lobby TOMC Application Messages

All messages after handshake are wrapped in TOMC frames (Section 4).

### 11.1 Client → Server Messages

| Opcode | Name                  | Payload (confirmed format)                           |
|--------|-----------------------|------------------------------------------------------|
| 0x010F | GetServerList         | none                                                 |
| 0x0302 | GetRIFFList           | none                                                 |
| 0x030C | GetMiniRIFFList       | none                                                 |
| 0x0106 | AddCommChannel        | See §11.4 (client adds an existing channel to its list; channels are created server-side, see §11.7) |
| 0x0101 | GetUserList           | `[uint32 BE commId]`                                 |
| 0x0207 | HeartbeatResponse     | none (ack to server 0x0217)                          |
| 0x0217 | SetTimeoutRate        | none                                                 |
| 0x010C | GetServerInfo         | `[uint32 BE commId]`                                 |
| 0x030B | GetStatistics         | none                                                 |
| 0x0301 | MonitorLogin          | lobby monitor/spectator mode variant of 0x0100       |
| 0x0309 | GetGameServersList    | none — requests available game server hosts; server MUST reply 0x0402 |
| 0x010A | NPSStartGameServerOnHost | `[uint32 BE commId][char hostname[16]]` = 20 bytes raw (sent via NPSSendCommand, NOT format encoder); server MUST reply 0x0214 then broadcast 0x021C on room channel |
| 0x030A | RestartRoomServer     | `[uint32 BE commId]`                                 |
| 0x0111 | SetHeartbeatTimeout   | `[uint32 BE timeout]` (sent raw via NPSSendCommand)  |
| 0x0112 | GetHeartbeatTimeout   | none (sent raw via NPSSendCommand)                   |
| 0x0119 | SetServerFlag_0x400   | none (flag 0x400 variant of NPSSetServerFlags)       |
| 0x011A | SetServerFlag_0x800   | none                                                 |
| 0x011B | SetServerFlag_0x1000  | none                                                 |
| 0x011C | SetServerFlag_0x2000  | none                                                 |
| 0x0105 | CloseCommChannel      | `[uint32 BE commId]` — vtable[8] NPSCloseCommChannel; sent to close/leave a channel |
| 0x0107 | GetCommChannelCount   | `[uint32 BE commId]` — vtable[13] NPSGetCommChannelCount |
| 0x0110 | SetCommChannelRate    | TBD — vtable[42] NPSSetCommChannelRate               |
| 0x010E | GetReadyList          | `[uint32 BE commId]` — vtable[39] NPSGetReadyList    |
| 0x0100 | NPSLogon              | See §10 (login handshake)                            |
| 0x011F | NPSReadyForGame       | `[s isReady][s pad=0][l roomCommId]` = 8 bytes raw (vtable[15]); sent via NPSSendCommand |
| 0x011D | NPSTerminateGameServer| `[uint32 BE commId]` — vtable[18] NPSTerminateGameServer |
| 0x0103 | SetMyUserData         | `[b 64-byte blob]` — vtable[20] NPSSetMyUserData     |
| 0x0126 | GetUserInfo           | `[uint32 BE userId]` — vtable[22] NPSGetUserInfo     |

### 11.2 Server → Client Messages

| Opcode | Name              | Payload format                                                      |
|--------|-------------------|---------------------------------------------------------------------|
| 0x0212 | ServerList        | `[uint32 BE count]` + N×`[p name][l commId][p name2][l 0][l 0][l numUsers]` |
| 0x0401 | RIFFList          | `[uint32 BE field0][uint32 BE count]` + N×`[p name][l commId][l 0][p desc][s s s s][b 256][s s][l][c]` |
| 0x0404 | MiniRIFFList      | `[uint32 BE count]` + N×`[p name][l commId][s numUsers]`           |
| 0x0214 | ChannelGranted    | `[uint32 BE commId][uint32 BE port]` — port = room server port (for 0x0106 grant) or game server port (for 0x010A grant) |
| 0x0213 | ChannelDenied     | none                                                                |
| 0x0211 | UserList          | `[uint32 BE commId][uint32 BE count]` + N×`[l userId][p name][b 64]` |
| 0x0217 | Heartbeat         | none (server sends periodically; client acks with 0x0207)           |
| 0x0402 | GameServersList   | `[uint32 BE field0][uint32 BE numServers]` + N×195 bytes; see §11.5 |
| 0x021C | GameServerStarted | `[uint32 BE commId]` — notification that game server is ready (lobby fires this; room server MUST also broadcast it to trigger client connect) |
| 0x021D | GameServerTerminated | `[uint32 BE commId]` — game server has stopped                   |
| 0x0208 | NPS_USER_LEFT_CHANNEL | `[uint32 BE userId]` — user removed from channel (client adds userId to removed list) |
| 0x0209 | NPS_CHANNEL_CLOSED | none — channel has been closed by server                         |
| 0x020E | NPS_CHANNEL_CREATED | `[uint32 BE commId][p channelName]` — new channel created (broadcast to all clients) |
| 0x020F | NPS_CHANNEL_DELETED | `[uint32 BE commId]` — channel deleted (broadcast to all clients)|
| 0x0218 | NPS_HEARTBEAT_TIMEOUT | none — client failed to respond to heartbeats; server closing connection |
| 0x022E | NPS_BUDDY_LEFT | `[uint32 BE userId]` — buddy has left the server                 |
| 0x022F | NPS_BUDDYLIST_UPDATE | TBD — buddy list state update                                  |
| 0x021E | VersionMismatch | none — client version not accepted by server                     |
| 0x022A | InvalidKey | none — client auth key rejected                                    |
| 0x022B | NPS_NO_VALIDATION_SERVER | none — no validation server available                    |
| 0x020A | DuplicateUser | none — userId already connected on this server                   |
| 0x020B | ServerFull | none — server has reached maximum capacity                        |
| 0x0230 | NPS_OK_TO_LOGIN | `[uint32 BE userId][...]` — sent after connect during login phase (see §6) |
| 0x0231 | NPS_Q_POSITION | `[uint32 BE position]` — client is queued; position in queue     |

**Field type legend (lobby 'p' format, NOT NPS string):**
- `l` = uint32 BE
- `s` = uint16 BE
- `c` = uint8
- `p` = `[uint32 BE (len+1)][bytes][null]`
- `b N` = N raw bytes (fixed size, no length prefix)

### 11.3 Heartbeat

The server SHOULD send 0x0217 at 30-second intervals. The client MUST respond with 0x0207. The server MUST respond to a transport PING (0xF216) with PONG (0xF207).

### 11.4 Operation: AddCommChannel (0x0106 → 0x0214 / 0x0213)

Client sends 0x0106 to add a channel (server slot, RIFF/room, or other logical channel) to its own channel list. The client builds its local channel entry, sends the request, and only after a grant (0x0214/0x0215) does it add the entry to its list. Server responds with 0x0214 GRANTED or 0x0213 DENIED.

#### 11.4.1 Request: 0x0106 AddCommChannel

Serializer: `FUN_00bc30f0` → `FUN_00bbdfe0`, format string `"lplllllsssssspscssllbl"`.

Payload is TOMC-wrapped (Section 4). All multi-byte integers are Big-Endian.

The `p` format encodes a null-terminated string as `[uint32 BE (strlen+1)][bytes]['\0']`.

| # | Format | Size       | Field              | Source / Default value                                |
|---|--------|------------|--------------------|-------------------------------------------------------|
| 1 | `l`    | 4          | **commId**         | NPSArg[2]; ID of an existing channel (see §11.7)      |
| 2 | `p`    | 4+len+1    | **channelName**    | NPSArg+4 string (max 30 chars); default `"CTRL"`      |
| 3 | `l`    | 4          | correlation_1      | Client-side callback ptr; **server must ignore**       |
| 4 | `l`    | 4          | correlation_2      | Client-side callback ctx; **server must ignore**       |
| 5 | `l`    | 4          | **clientPort**     | Client's TCP/UDP port for this channel; default 0     |
| 6 | `l`    | 4          | **protocol**       | Transport: `0x21`=TCP, `0x2c`=UDP, `0x37`=UDP+TCP-fallback, `0x42`=TCP-forced |
| 7 | `l`    | 4          | **userId**         | Client's userId from lobby login                      |
| 8 | `s`    | 2          | field_8            | Zero (not set by client)                              |
| 9 | `s`    | 2          | field_9            | Zero (not set by client)                              |
| 10 | `s`   | 2          | grantedFlag        | Default 1 in request (set to 1/0 in GRANTED/CONDITIONAL response internally) |
| 11 | `s`   | 2          | caps_0x20          | `(uint16)(NPSArg[3] & 0x20)`; capability flag        |
| 12 | `s`   | 2          | field_12           | Zero (not set by client)                              |
| 13 | `s`   | 2          | priority           | Derived from `NPSArg[3]`: bit0→`1`, bit2→`4`, default `2` |
| 14 | `p`   | 4+len+1    | gameModeStr        | 17-byte game mode string from NPSArg (often empty)   |
| 15 | `s`   | 2          | caps_0x4000        | `(uint16)(NPSArg[3] & 0x4000)`; capability flag      |
| 16 | `c`   | 1          | field_16           | Default **1** (set in constructor)                    |
| 17 | `s`   | 2          | field_pad          | Uninitialized padding (reads 0 in practice)           |
| 18 | `s`   | 2          | extraFlag          | `NPSArg[+0x150]`; default 0                          |
| 19 | `l`   | 4          | extra_0x88         | `NPSArg[+0x48]`; default 0                           |
| 20 | `l`   | 4          | extra_0x8c         | `NPSArg[+0x4c]`; default **250 (0xFA)**              |
| 21 | `b`   | 256        | blob               | 256-byte capability blob from `NPSArg[+0x50]`; default 256 zeros |
| 22 | `l`   | 4          | fullFlags          | `NPSArg[3]` (full flags uint32); default 0           |

**Confirmed from:** `FUN_00ad97e0` (channel state init), `FUN_00ad9b80` (defaults), `FUN_00ad8850` (wire area prep), `FUN_00bbdfe0` (serializer), `FUN_00bc30f0` (outer encoder).

**For a private server, only fields 1, 2, 5, 6, and 7 are needed:**
- Field 1 (`commId`): the ID of an existing channel the client is adding to its list. Channels are created server-side and announced to clients (§11.7), so a client should always already hold a non-zero ID
- Field 2 (`channelName`): which RIFF/room the client wants to add
- Field 6 (`protocol`): whether to set up a TCP or UDP data path
- Field 7 (`userId`): identify which connected user is making the request
- Field 5 (`clientPort`): client's listening port (relevant for UDP channels)

#### 11.4.2 Response: 0x0214 NPS_CHANNEL_GRANTED

Parsed by `FUN_00bbff00` (opcode 0x214) → reads 8 bytes into native struct.

```
Payload (8 bytes):
  [uint32 BE commId]    server-assigned or confirmed channel ID
  [uint32 BE port]      port the client should use for the room/game server TCP connection
```

The client MUST connect to `(LobbyServerIP, port)` upon receiving 0x0214.

#### 11.4.3 Response: 0x0213 NPS_CHANNEL_DENIED

No payload. Client logs `"Access Denied"`. The client MUST NOT retry.

### 11.5 Operation: GetGameServersList (0x0309 → 0x0402)

Confirmed from `FUN_00adda10` (lobby dispatcher 0x402 case) and `FUN_00ad6b50` (game server list handler).

#### 11.5.1 Request: 0x0309 GetGameServersList

```
Payload: none (0 bytes)
```

**CONFIRMED from RE:** `NPSStartGameServer` (vtable[16], `FUN_00ad6d40`) and `NPSGetGameServersList` (vtable[31], `FUN_00ad2a10`) both call `NPSSendCommand(connId, 0, 0x309, 0, 0)` — the last two zero arguments are payload pointer and payload length. The connection object identity (`DAT_01290a9c`) is used to match the 0x0402 response, not a payload field.

The race master sends this to the lobby to request available game server hosts.

#### 11.5.2 Response: 0x0402 NPS_GAME_SERVERS_LIST

```
Payload:
  [uint32 BE field0]      unused; server SHOULD send 0
  [uint32 BE numServers]  number of entries that follow

  Per entry (195 bytes):
    [char group[65]]        null-padded group/region name
    [char serverName[65]]   null-padded display name
    [char hostname[65]]     null-padded hostname; client reads first 16 bytes max
```

**Confirmed from:** `FUN_00ad6b50` — client reads `entry+0x00` (group), `entry+0x41` (serverName), `entry+0x82` (hostname, strncpy 16 bytes).

When `numServers == 0` the room server sets channel state to 8 ("no game servers available") and the client aborts the race start with `"Failed: Game Server start"`.

When `numServers >= 1` the client reads the **first entry's hostname** (entry+0x82, first 16 bytes), then calls `NPSStartGameServerOnHost` (§11.6).

Server MUST place the game server's reachable hostname or IP in the first entry's hostname field. For a private server this SHOULD be the same IP as `SERVER_IP`.

### 11.6 Operation: NPSStartGameServerOnHost (0x010A → 0x0214 + 0x021C broadcast)

Confirmed from `FUN_00ad4de0` (NPSStartGameServerOnHost, vtable[17] of NPS client object at `PTR_FUN_011ff408`), `FUN_00adda10` (lobby dispatcher 0x214 handler), `FUN_004ee420` (room dispatcher 0x021C handler).

#### 11.6.1 Request: 0x010A NPSStartGameServerOnHost (Lobby)

Sent **via NPSSendCommand directly** (vtable[25], NOT via format string encoder):

```
Raw payload (20 bytes):
  [uint32 BE commId]    the race channel commId (client's current room commId)
  [char hostname[16]]   game server hostname, null-padded (from 0x0402 entry, max 15 chars + null)
```

**Note:** The opcode 0x010A is also used on the **room server** as `SendChannelMsg` with format `"lp"` (a chat/channel message). These are entirely different messages on different connections; §12.4 documents the room variant.

#### 11.6.2 Response: 0x0214 NPS_CHANNEL_GRANTED (game channel)

Sent by the lobby server to the requesting client after the game server is provisioned:

```
Payload (8 bytes):
  [uint32 BE commId]   game channel commId (may equal the room commId)
  [uint32 BE port]     TCP port the client MUST use to connect to the game server
```

**Confirmed from:** `FUN_00adda10` case 0x214 log string `"NPS_CHANNEL_GRANTED commId=%d port=%d"`.

#### 11.6.3 Broadcast: 0x021C NPS_GAME_SERVER_STARTED

After the game server is ready, the **room server MUST** broadcast 0x021C to all clients in the race channel:

```
Payload (4 bytes):
  [uint32 BE commId]   the race channel commId
```

**Confirmed from:** `FUN_004ee420` case 0x021C — sets room channel state to 4, which unblocks the client's game-start wait loop (`FUN_004ec530`). The lobby also sends 0x021C (notification only; room is the authoritative trigger).

After receiving 0x021C on the room channel, every client connects to the game server at:
- **hostname**: from the 0x0402 entry (§11.5.2)
- **port**: from the 0x0214 response (§11.6.2)

#### 11.6.4 Full Sequence

```
Master Client        Lobby Server        Room Server         All Clients
     │                    │                   │                    │
     │── 0x0309 ─────────▶│  (no payload)     │                    │
     │                    │                   │                    │
     │◀── 0x0402 ─────────│  [field0][N]      │                    │
     │    [entry:group]   │  + entries(195B)  │                    │
     │    [entry:name]    │                   │                    │
     │    [entry:hostname]│                   │                    │
     │                    │                   │                    │
     │── 0x010A ─────────▶│  [commId]         │                    │
     │    [hostname:16B]  │                   │                    │
     │                    │                   │                    │
     │◀── 0x0214 ─────────│  [commId][port]   │                    │
     │    game ch granted │                   │                    │
     │                    │                   │                    │
     │                    │                   │── 0x021C ─────────▶│ (broadcast)
     │◀── 0x021C ─────────│                   │   [commId]         │
     │    (notification)  │                   │                    │
     │                    │                   │                    │
     │◀═══════════════════╪═══════════════════╪════════════════════╡
     │  All clients connect to game server at (hostname, port)     │
```

Server MUST requirements for this flow:
1. Server MUST respond to 0x0309 with 0x0402 containing at least one entry with a reachable hostname.
2. Server MUST respond to the master's 0x010A with 0x0214 `[commId][gameServerPort]` on the **lobby** connection.
3. Server MUST send 0x0214 `[commId][gameServerPort]` to **all non-master lobby clients** connected to the same race channel, so they can connect to the game server. Confirmed: non-master clients (FUN_00828d00 / FUN_004e6f30) connect using the room server's hostname and need the port from a 0x0214.
4. Room server MUST broadcast 0x021C `[commId]` to all clients in the race channel.
5. Room server MUST broadcast 0x0108 S→C to all channel members immediately after receiving 0x0108 C→S from the race master. Confirmed from `FUN_004ee420` case 0x0108 — all clients receive and log it; it is a required start notification even though clients take no direct action on receipt (the actual game-connect trigger is 0x021C).
6. All clients (not just master) receive 0x021C and MUST connect to the game server.
7. The game server MUST be deployed at the same IP address as the room server. Non-master clients resolve the game server hostname from their existing room server connection (`game_state+0xa0`); they do not use the hostname from 0x0402. Confirmed from `FUN_004e6f30`: NULL hostname override causes reuse of current room hostname.

---

### 11.7 Channel Lifecycle (server-side creation, announcement, deletion)

AddCommChannel (0x0106) means "add this existing channel to my list"; it is not a create, and it is not a server-side channel join. Channels are created by the server, which assigns the commId and announces it to clients; a client only ever opens an ID it has already been given. The server MUST NOT rely on a client sending `commId=0` to request a new channel.

**CONFIRMED from RE of `cNPSAPI::NPSAddCommChannel` (`00ad7690`, vtable[2]):**
- If a non-zero commId is already open on the server connection, the client fails locally with `NPS_ERR_CHANNEL_ALREADY_OPEN` (-5) and sends nothing.
- If the commId is 0, the client logs `"addcom: CommId 0, Id will be retreived from server"` and sends the request unchanged. This looks like a generic library fallback; no caller in the game was found that uses it. Because the client stores the first dword of whatever 0x0214/0x0215 it receives as the channel's commId, a server that grants commId 0 makes the client hold channel 0 without complaint.
- The client takes the commId from the grant (0x0214 or 0x0215) and returns it as the call result; the grant is authoritative.
- 0x0214 and 0x0215 are both treated as success. Any other reply is treated as denial ("Access Denied"); the first dword of that reply becomes the error code (-1 maps to -0x17).
- The port in the grant is used only for UDP protocols (0x2c, 0x37), where it is passed to `ConnectUDPSocket`. For TCP protocols (0x21, 0x42) it is read and ignored: the channel is added to the existing connection to that server, and the call fails with `-6` ("Server Not Connected") if there is none.

#### 11.7.1 Request: 0x0106 AddCommChannel

Same format as §11.4.1. Field 1 (`commId`) is the existing channel being added. Field 21 (`blob`, 256 bytes) carries the race configuration when the sender has one (see §11.7.6).

#### 11.7.2 Response: 0x0214 NPS_CHANNEL_GRANTED

```
Payload:
  [uint32 BE commId]      the channel being granted (the client stores this value as the commId)
  [uint32 BE port]        used by the client only for UDP channels; ignored for TCP
```

#### 11.7.3 Broadcast: 0x020E NPS_CHANNEL_CREATED

When the server creates a channel, it announces it to lobby-connected clients:

```
Payload:
  [uint32 BE commId]      the commId of the new channel
  [p channelName]         channel name (p-string: [uint32 BE len+1][bytes][null])
```

*Note:* the reference server currently sends a larger struct here (commId, riff, protocol, 256-byte channel data, type, max ready players) and only to the requesting client. Which layout the client reads is not yet verified.

#### 11.7.4 Broadcast: 0x020F NPS_CHANNEL_DELETED

When a channel is closed (race ended, room disbanded, or connection dropped), the server broadcasts:

```
Payload:
  [uint32 BE commId]      the commId being deleted
```

#### 11.7.5 Full Sequence

```
Server               Lobby Clients         Adding Client
   │                      │                      │
   │ (creates channel,    │                      │
   │  assigns commId)     │                      │
   │── 0x020E ───────────▶│                      │
   │   [commId][name]     │                      │
   │                      │                      │
   │◀── 0x0106 ───────────┼──────────────────────│  commId = existing channel
   │── 0x0214 ────────────┼─────────────────────▶│  [commId][port]
   │                      │                      │
   ... session proceeds ...
   │                      │                      │
   │◀── 0x0105 ───────────┼──────────────────────│  (CloseCommChannel)
   │── 0x020F ───────────▶│                      │
   │   [commId]           │                      │
```

Server requirements:
1. The server MUST create channels itself and assign unique, non-zero commIds.
2. The server MUST respond to 0x0106 for a known channel with 0x0214 (or 0x0215) carrying that channel's commId.
3. The server MUST announce new channels with 0x020E.
4. The server MUST announce channel deletion with 0x020F.
5. The server MUST NOT use commId 0 for a channel it expects clients to treat as distinct (the client accepts a grant of 0 and stores it as channel 0).
6. The server SHOULD read and store the 256-byte Race Config Blob (§11.7.6) from field 21 to know race type and parameters.

#### 11.7.6 Race Config Blob Layout (field 21 of 0x0106)

**CONFIRMED from RE of `FUN_0089e510`** (packs all race globals into the 204-byte RIFF config struct, which is then zero-padded to 256 bytes and copied into `NPSArg[+0x50]`) and **`FUN_0082b0c0`** (stores UI selections into race globals `DAT_01408cXX`).

The 256-byte blob is a serialized `RaceConfig` struct (204 bytes of data + 52 bytes of zero padding). The struct is packed by `FUN_0089e510` from per-race globals set by the UI selection functions.

```
Blob layout (little-endian except where noted):
Offset  Size  Field           Description
------  ----  -----           -----------
+0x00   4     typeId          Struct type/version ID (DAT_01408c40); opaque to server
+0x04   28    raceName        Null-terminated race name string (28 bytes max)
+0x44   4     carClassLimit   uint32: car class / selection limit (race type-4 only; from DAT_01408c94)
+0x48   4     settingA        uint32: from DAT_01408c8c
+0x4c   4     settingB        uint32: from DAT_01408c90
+0x50   1     packed_A        Byte: bits 0–3 = track setting low nibble (DAT_01408cb4 & 0xf);
                               bits 4–7 = track setting high nibble (DAT_01408cb8 & 0xf)
+0x51   1     packed_B        Byte: bits 0–3 = lap/player setting low nibble (DAT_01408cc0 & 0xf);
                               bits 4–7 = lap/player setting high nibble (DAT_01408cc4 & 0xf)
+0x52   1     flagByte        Bit-packed boolean flags:
                               bit 0 = DAT_01408cc8 & 1
                               bit 1 = DAT_01408ccc & 1
                               bit 2 = DAT_01408cd0 & 1
                               bit 3 = DAT_01408cd4 & 1
                               bits 4–5 = DAT_01408cd8 & 3  (2-bit field)
                               bit 6 = DAT_01408cdc & 1
                               bit 7 = (DAT_01408ce4 != 0) ? 1 : 0
+0x53   1     (padding/zero)
+0x54   4     raceType        uint32: RACE TYPE enum (see table below)
+0x58   4     carId           uint32: car identifier (DAT_01408c9c)
+0x5c   1     carFieldA       byte: DAT_01408ca0 (track/region setting A)
+0x5d   1     carFieldB       byte: DAT_01408ca4 (track/region setting B)
+0x5e   1     carFieldC       byte: DAT_01408ca8 (car value / car class field)
+0x5f   1     carFieldD       byte: DAT_01408cac (car value / car class field)
+0x60   4     openFlags       uint32: bit 0 = open(1) / private(0) flag (DAT_01408cb0 != 0)
+0x64   1     miscFlag        byte: bit 0 = DAT_01408d78 & 1
+0x68   4     gameStateField  uint32: from live game state vtable call (dynamic; server may ignore)
+0x6c   28    secondaryName   Null-terminated secondary name string (from DAT_01408b54)
+0x78   4     riffName        uint32: RIFF/room name reference (DAT_01408b8c)
+0x7c   ..    (unused/zero)
+0xc0   4     globalA         uint32: DAT_0163e168 (server-side global; client echoes it back)
+0xc4   4     globalB         uint32: DAT_0163e16a
+0xc8   4     globalC         uint32: DAT_0163e16c
+0xcc   ..    (zero padding to 256 bytes)
```

**Race Type values (`raceType` at blob+0x54):**

| Value | Race Mode | Feature flags active |
|-------|-----------|----------------------|
| 0     | Standard / Knockout | 0x1, 0x2, 0x8, 0x10, 0x20, 0x100, 0x200, 0x400 |
| 1     | Car-select race | 0x2000, 0x4000 fields active |
| 2     | Time Trial variant | car value fields (0x4000) active; open/private forced=0 |
| 3     | Circuit / confirmed race | 0xb83 dialog shown to confirm |
| 4+    | Extended type | car class limit (blob+0x44) meaningful |

**UI Config Struct → Blob offset mapping** (from `FUN_008986e0` / `FUN_0082b0c0`):

| UI config offset | Feature flag | Blob destination |
|------------------|-------------|-----------------|
| +0x00..+0x3f | — | blob+0x04 (race name) |
| +0x54 | — | blob+0x44 (carClassLimit, type-4 only) |
| +0x58 | — | blob+0x54 (raceType) |
| +0x5c | 0x0010 | blob+0x60 bit 0 (open/private) |
| +0x60 | 0x4000 | blob+0x5e (carFieldC) |
| +0x64 | 0x4000 | blob+0x5f (carFieldD) |
| +0x68 | 0x1000 | blob+0x5c (carFieldA) |
| +0x6c | 0x1000 | blob+0x5d (carFieldB) |
| +0x70 | 0x0800 | blob+0x52 bit 7 (bonus/reward flag) |
| +0x74 | — | blob+0x50 bits 0–3 (track setting low nibble) |
| +0x78 | 0x0200 | blob+0x51 bits 4–7 (max players high nibble) |
| +0x7c | 0x0200 | blob+0x51 bits 0–3 (max players low nibble) |
| +0x80 | 0x0001 | blob+0x52 bit 0 |
| +0x84 | 0x0002 | blob+0x52 bit 3 |
| +0x88 | 0x0008 | blob+0x52 bit 2 |
| +0x8c | 0x0100 | blob+0x52 bits 4–5 (laps field) |

Server MUST read `blob+0x54` (raceType) and `blob+0x60` bit 0 (open/private) at minimum to manage channel visibility and type-appropriate behavior. All other blob fields should be stored opaquely and echoed in 0x0401 NPS_RIFF_LIST entries (§12.8).

---

## 12. Room Server Protocol

The room server is a separate TCP endpoint from the lobby. It manages real-time channel/room presence, ready-state tracking, and game start coordination. Its wire framing and handshake are identical to the lobby (Sections 4 and 10).

### 12.1 Connection Lifecycle

1. **Lobby sends 0x0214 NPS_CHANNEL_GRANTED** — payload `"ll"` = `[uint32 commId][uint32 port]`. The `port` field is the room server TCP port.
2. **Client opens new TCP connection** to the server (same host as lobby) on the received port.
3. **Handshake** (raw, pre-TOMC) — identical to lobby handshake (Section 10): client sends 0x0100, server replies 0x0120.
4. **TOMC framing** — all subsequent messages on both directions use TOMC framing (Section 4).
5. **Server MUST send 0x020D NPS_SERVER_INFO** — one entry (76 bytes) describing the room server itself.
6. **Server MUST send 0x0401 NPS_RIFF_LIST** — initial list of available rooms.
7. **Client adds a channel** — sends 0x0106 AddCommChannel (same format as lobby, Section 11.4).
8. **Server responds 0x0214 NPS_CHANNEL_GRANTED** (or 0x0213 NPS_CHANNEL_DENIED).
9. **Server MUST send 0x0211 NPS_USER_LIST** — current occupants of the joined channel. Confirmed from `FUN_004ee420` case 0x0211: client populates its user list from this message; if omitted the joining client sees an empty room.
10. **Server MUST send 0x0227 NPS_CHANNEL_MASTER** — identifies the current race master. Confirmed from `FUN_004ee420` case 0x0227: client stores master userId at `game_state+0x188` and sets isMaster flag. MUST be sent after the user list.
11. **Server MUST send 0x0203 NPS_USER_JOINED to existing channel members** and **0x020C NPS_USER_JOINED_CHANNEL to all members** when a new user joins. Confirmed from `FUN_004ee420` cases 0x0203/0x020C.
12. **Normal operation** — ready-state exchange (0x011F / 0x0109 / 0x0210), game start (0x0108), user presence (0x0203 / 0x0202).
13. **Disconnect** — server sends 0x0201 NPS_FORCE_LOGOFF or 0x02A0 NPS_SERVER_DISCONNECTED on teardown.

### 12.2 Wire Framing and Handshake

Identical to lobby:
- Pre-handshake: raw NPS `[uint16 BE opcode][uint16 BE total_len][payload]` (no TOMC).
- Post-handshake: TOMC-wrapped NPS messages (Section 4).
- Keepalives: PING (0xF216) / PONG (0xF207) as described in Section 4.
- Handshake format: client 0x0100 `"lpb"+"llpppb"`, server 0x0120 `"lpb"` — identical to Section 10.

### 12.3 Server→Client Opcodes

Confirmed from `FUN_004ee420` (`cnps_roomserver.cpp`). The NPS library decodes the wire format before dispatching; all offsets below refer to the **deserialized** uint32 buffer (`param_3`).

Notation: `[n]` = uint32 at word offset n (byte offset n×4); `*(u16*)(+B)` = uint16 at byte offset B.

| Opcode | Name | Payload (deserialized) |
|--------|------|------------------------|
| 0x0108 | NPS_START_GAME | `[0]` commId |
| 0x0109 | NPS_READY_FOR_GAME | `[0]` commId, `[1]` userId, `*(u16*)(+8)` isReady, `*(u16*)(+10)` isMaster |
| 0x0201 | NPS_FORCE_LOGOFF | (no payload) |
| 0x0202 | NPS_USER_LEFT | `[0]` userId |
| 0x0203 | NPS_USER_JOINED | `[0]` userId, `[1…]` name (p-string) |
| 0x0204 | NPS_USER_INFO | `[0]` userId, `[1…]` name; bit `(byte)[0x15]>>3&1` = dataValid; `*(u16*)(+0x5d)` = level |
| 0x0206 | NPS_CLIENT_COUNT | `[0]` commId, `[1]` count |
| 0x020C | NPS_USER_JOINED_CHANNEL | `[8]` userId (byte +32), `[9]` commId (byte +36) |
| 0x020D | NPS_SERVER_INFO | `[8]` commId (byte +32); 1 entry × 76 bytes; see §12.6 |
| 0x020E | NPS_CHANNEL_CREATED | `[0]` commId, `[1…]` name (p-string) |
| 0x020F | NPS_CHANNEL_DELETED | `[0]` commId |
| 0x0210 | NPS_READY_LIST | `[0]` numReady; N×12 bytes: `[0]` commId, `[1]` userId, `*(u16*)(+8)` isReady, `*(u16*)(+10)` isMaster |
| 0x0211 | NPS_USER_LIST | `[0]` commId (0=server list), `[1]` numUsers; N×100 bytes; see §12.7 |
| 0x0212 | NPS_SERVER_LIST | `[0]` numServers; N×76 bytes; see §12.6 |
| 0x0213 | NPS_CHANNEL_DENIED | (no payload) — client ignores silently |
| 0x0214 | NPS_CHANNEL_GRANTED | `[0]` commId |
| 0x0215 | NPS_CHANNEL_CONDITIONAL | `[0]` commId |
| 0x0219 | NPS_CHANNEL_UPDATE | `[0]` commId |
| 0x021A | NPS_FORCE_LEAVE_CHANNEL | `[0]` commId, `[1]` userId (who forced the leave) |
| 0x021B | NPS_USER_LOCATION | `[1]` count; per entry: uint32 commId |
| 0x021C | NPS_GAME_SERVER_STARTED | `[0]` commId |
| 0x021D | NPS_GAME_SERVER_TERMINATED | `[0]` commId |
| 0x0224 | NPS_GAME_SERVER_STATE_CHANGE | `[0]` commId, `[1]` senderId, `(char)[2]` state |
| 0x0225 | NPS_SLOT_UPDATE | (no payload fields accessed) |
| 0x0226 | NPS_SLOT_LIST | `[0]` numSlots; N×16 bytes: `[0]` commId, `[1]` userId, `[2]` slot, `*(s16*)(+12)` add(≠0)/remove(0) |
| 0x0227 | NPS_CHANNEL_MASTER | `[0]` commId, `[1]` masterId |
| 0x0229 | NPS_MINI_USER_LIST | `[0]` commId, `[1]` numUsers; N×100 bytes (same layout as 0x0211) |
| 0x022C | NPS_INC_MINI_USER_LIST | `[0]` commId (0=server list), `[1]` count; N×100 bytes |
| 0x022D | NPS_DEC_MINI_USER_LIST | `[0]` count; then array of uint32 userIds at `[1…count]` |
| 0x02A0 | NPS_SERVER_DISCONNECTED | `[0]` errorCode |
| 0x0401 | NPS_RIFF_LIST | `[0]` field0, `[1]` numRiffs; N×336 bytes; see §12.8 |
| 0x0402 | NPS_GAME_SERVERS_LIST | `[0]` field0 (unused), `[1]` numServers; if 0, sets channel state=8 ("no servers"); N×195 bytes: `[char group[65]][char serverName[65]][char hostname[65]]`; room dispatcher only checks numServers==0 |
| 0x0403 | NPS_STATISTICS | (ignored by client) |
| 0x0404 | NPS_MINI_RIFF_LIST | `[0]` numRiffs; compact entries; see §12.8 |
| 0x0FFF | NPS_SYSTEM_ERROR | `*(s16*)(+0)` failedOpcode, `[1]` errorCode, `[3]` commId |

**GameServer variant** (`FUN_004e29f0`): chains to the above dispatch then additionally:
- **0x0208** — adds userId to `mUserList_Removed`
- **0x020C** — adds user to `mUserList_Added`
- **0x0211 / 0x0229** with commId==0 — adds all entries to server-side user list

### 12.4 Client→Server Request Opcodes

Confirmed from NPS encoder dispatch `FUN_00bbf850` and body-encoder analysis. Format string conventions are defined in Section 3.1.

| Opcode | Name | Wire Format | Fields |
|--------|------|-------------|--------|
| 0x0101 | GetUserList | `"l"` | `[uint32 BE commId]` |
| 0x0103 | UpdateChannel | `"lpb"` | `[l commId][p name][b 64-byte blob]` |
| 0x0104 | GetChannelInfo | `"l"` | `[uint32 BE commId]` |
| 0x0105 | CloseCommChannel | `"l"` | `[uint32 BE commId]` — vtable[8] NPSCloseCommChannel; lobby closes/leaves channel |
| 0x0106 | AddCommChannel | `"lplllllsssssspscssllbl"` | Same 22-field format as lobby (§11.4) |
| 0x0107 | GetCommChannelCount | `"l"` | `[uint32 BE commId]` — vtable[13] NPSGetCommChannelCount |
| 0x0108 | StartGame (C→S) | `"ls"` | `[l commId][s field1]` |
| 0x010A | SendChannelMsg (room) | `"lp"` | `[l commId][p message]` — **room server only**; see §11.6.1 for the lobby variant (different wire format) |
| 0x010C | GetServerInfo | `"l"` | `[uint32 BE commId]` — `cNPSAPI::NPSGetServerInfo` (`00ad3870`) |
| 0x010D | GetSlotList | `"ll"` | `[l commId][l field1]` |
| 0x010E | GetReadyList | `"l"` | `[uint32 BE commId]` — `cNPSAPI::NPSGetReadyList` (`00ad2e20`) |
| 0x010F | RemoveSlot | `"l"` | `[uint32 BE commId]` |
| 0x0111 | SetHeartbeatTimeout | raw | `[uint32 BE timeout_ms]` — sent raw via NPSSendCommand (not format encoder); vtable[43] |
| 0x0112 | GetHeartbeatTimeout | raw | none — sent raw via NPSSendCommand; vtable[44] |
| 0x0119 | SetServerFlag_0x400 | raw | none — vtable[38] NPSSetServerFlags (0x400 flag variant) |
| 0x011A | SetServerFlag_0x800 | raw | none — vtable[38] (0x800 flag variant) |
| 0x011B | SetServerFlag_0x1000 | raw | none — vtable[38] (0x1000 flag variant) |
| 0x011C | SetServerFlag_0x2000 | raw | none — vtable[38] (0x2000 flag variant) |
| 0x011D | (unknown) | `"l"` | `[uint32 BE commId]` |
| 0x011E | UpdateChannelBlob | `"lpb"` | `[l commId][p name][b 64-byte blob]` |
| 0x011F | NPSReadyForGame (C→S) | `"ssl"` | `[s isReady][s pad=0][l roomCommId]` = 8 bytes; sent raw via NPSSendCommand |
| 0x0122 | RequestSlotPosition | raw | `[uint32 BE commId]` — sent raw via NPSSendCommand; vtable[3] NPSRequestSlotPosition and vtable[4] NPSFreeSlotPosition both use this opcode |
| 0x0123 | GetSlotList | `"l"` | `[uint32 BE commId]` |
| 0x0125 | UdpChannelAck | raw | TBD — vtable-confirmed; sent via NPSSendCommand |
| 0x0126 | GetUserInfo | `"l"` | `[uint32 BE commId]` |
| 0x0128 | GetMiniUserList | `"l"` | `[uint32 BE commId]` — vtable[11] NPSGetMiniUserList |
| 0x0207 | HeartbeatReply | (header only) | Client reply to server 0x0217 heartbeat |
| 0x0213 | ChannelDenied ACK | `"l"` | `[uint32 BE commId]` |
| 0x0214 | ChannelGranted ACK | `"ll"` | `[l commId][l field1]` |
| 0x0215 | ChannelConditional ACK | `"ll"` | `[l commId][l field1]` |

**Note on 0x011F NPSReadyForGame**: Wire format confirmed from `FUN_00ad5560` (NPSReadyForGame wrapper, vtable slot 15 of 0x011ff408). The wrapper builds an 8-byte stack buffer at EBP−16: `[isReady(uint16)][pad(uint16=0)][roomCommId(uint32)]` and passes `&buf, len=8` to the raw NPS sender. All values are Big-Endian per NPS convention. The `Compress` encoder (`FUN_00bbf850`) throws `"opcode UNSUPPORTED in Compress"` for 0x11F (debug-build assertion); this does not affect the wire format.

### 12.5 Handshake Sequence (Detailed)

```
Client                        Room Server
  │                                │
  │── TCP connect ─────────────────▶│
  │                                │
  │── 0x0100 NPS_LOGIN ────────────▶│   (raw, no TOMC)
  │   "lpb": [userId][name][blob]   │
  │   "llpppb": [token][field_c8]   │
  │            [version][host][ip]  │
  │            [16-byte sessionKey] │
  │                                │
  │◀── 0x0120 NPS_LOGIN_OK ─────────│   (raw, no TOMC)
  │    "lpb": [userId][name][blob]  │
  │                                │
  │   ── TOMC framing begins ───   │
  │                                │
  │◀── 0x020D NPS_SERVER_INFO ──────│   (TOMC wrapped)
  │    1 entry × 76 bytes          │
  │                                │
  │◀── 0x0401 NPS_RIFF_LIST ────────│   (TOMC wrapped)
  │    N entries × 336 bytes       │
```

### 12.6 Server Info / Server List Entry (76 bytes each)

Stride: **0x4C = 76 bytes** per entry. Used by 0x020D NPS_SERVER_INFO and 0x0212 NPS_SERVER_LIST.

Wire format per entry: `"plplll"`:

| Field | Format | Description |
|-------|--------|-------------|
| name | `p` | Server/channel name (p-string) |
| commId | `l` | Channel communication ID |
| name2 | `p` | Secondary name (often same as name) |
| field_0x34 | `l` | Unknown field (server MAY set to zero) |
| field_0x38 | `l` | Unknown field (client ignores; server MAY set to zero) |
| numUsers | `l` | Current user count |

Deserialized layout (confirmed from `FUN_004e4830` field copies):

| Byte Offset | Field |
|-------------|-------|
| +0x20 | commId |
| +0x24 | name string source |
| +0x34 | field_0x34 |
| +0x3C | numUsers / capacity |

### 12.7 User List Entry (100 bytes each)

Stride: **0x64 = 100 bytes** per user entry. Used by 0x0211 NPS_USER_LIST, 0x0229 NPS_MINI_USER_LIST, 0x022C NPS_INC_MINI_USER_LIST.

Wire format per user: `"lpb"`:

| Field | Format | Bytes | Description |
|-------|--------|-------|-------------|
| userId | `l` | 4 | User ID |
| name | `p` | variable | Persona name (p-string: uint32 len+1 + bytes + null) |
| blob | `b` | 64 | User data blob (raw, no length prefix) |

The NPS library copies the p-string name into a fixed internal buffer. The deserialized stride of 100 bytes accommodates userId(4) + name(up to 32) + blob(64).

Message header for 0x0211: `[l commId][l numUsers]` before the per-user entries.

### 12.8 RIFF / Room List Entry Formats

**0x0401 NPS_RIFF_LIST** — stride: **0x150 = 336 bytes** per entry.

Wire format per entry: `"pllpssssbsslc"`:

| Field | Format | Description |
|-------|--------|-------------|
| name | `p` | Room/RIFF name |
| commId | `l` | Channel ID |
| field_0x24 | `l` | Unknown |
| desc | `p` | Room description |
| s1, s2, s3 | `s s s` | Unknown uint16 fields |
| enabled | `s` | Room enabled state (default 2) |
| blob | `b[256]` | 256 raw bytes (NO length prefix) |
| s5, s6 | `s s` | Unknown uint16 fields |
| l3 | `l` | Unknown uint32 |
| c | `c` | Unknown uint8 |

Deserialized layout (confirmed from `FUN_004e5250`):
- +0x24: name string
- +0x3C: numUsers (uint16)

Message header for 0x0401: `[l field0][l numRiffs]` before the per-riff entries.

**0x0404 NPS_MINI_RIFF_LIST** — compact form.

Wire format per entry: `"pls"`:

| Field | Format | Description |
|-------|--------|-------------|
| name | `p` | Room name |
| commId | `l` | Channel ID |
| numUsers | `s` | Current user count (uint16) |

Message header for 0x0404: `[l numRiffs]`.

### 12.9 Ready State Flow

```
Client                    Room Server              Other Clients
  │                            │                        │
  │── 0x011F ─────────────────▶│  [s isReady][s 0]     │
  │   [l roomCommId]           │                        │
  │                            │                        │
  │                            │── 0x0109 broadcast ───▶│
  │◀── 0x0109 broadcast ───────│   [commId][userId]     │
  │    [commId][userId]        │   [isReady][isMaster]  │
  │    [isReady][isMaster]     │                        │
  │                            │                        │
  │── 0x010E GetReadyList ────▶│  (format "l" commId)   │
  │◀── 0x0210 NPS_READY_LIST ──│                        │
  │    [numReady]              │                        │
  │    N×[commId][userId]      │                        │
  │      [isReady][isMaster]   │                        │
```

Server MUST requirements for the ready-state flow:
1. Server MUST broadcast 0x0109 NPS_READY_FOR_GAME to ALL users in the channel whenever any user's ready state changes (client sends 0x011F). Confirmed: `FUN_004ee420` case 0x0109 updates both the individual user's ready flag and the local isMaster flag.
2. Server MUST send 0x0210 NPS_READY_LIST (full snapshot) in response to 0x010E (GetReadyList).
3. Server MUST send 0x0227 NPS_CHANNEL_MASTER when the channel master changes. Additionally, server MUST send 0x0227 when a new client joins an existing channel (so they learn who the master is). Confirmed: `FUN_004ee420` case 0x0227 stores `masterId` at `game_state+0x188` and sets the local isMaster flag if the incoming masterId matches the local userId.
4. The `isMaster` field in 0x0109 (uint16 at byte offset +10 of the deserialized struct) is a redundant per-message hint; 0x0227 is the authoritative master notification.

### 12.10 Game Start Flow

The complete race-start sequence spans both the lobby and room connections. The race master drives the start; all clients in the channel follow.

```
Master (room)     Room Server     Master (lobby)     Lobby Server    All Clients (room)
    │                  │                │                  │                │
    │── 0x0108 ───────▶│ [commId][f1]  │                  │                │
    │   StartGame       │                │                  │                │
    │                  │── 0x0108 ──────────────────────────────────────────▶│
    │◀── 0x0108 ────────│   broadcast   │                  │                │
    │   [commId]        │               │                  │                │
    │                  │               │                  │                │
    │                  │               │── 0x0309 ────────▶│                │
    │                  │               │   (no payload)    │                │
    │                  │               │                  │                │
    │                  │               │◀── 0x0402 ────────│                │
    │                  │               │   [field0][N]     │                │
    │                  │               │   [entry:hostname]│                │
    │                  │               │                  │                │
    │                  │               │── 0x010A ────────▶│                │
    │                  │               │   [commId]        │                │
    │                  │               │   [hostname:16B]  │                │
    │                  │               │                  │                │
    │                  │               │◀── 0x0214 ────────│                │
    │                  │               │   [commId][port]  │                │
    │                  │               │   game ch granted │                │
    │                  │               │                  │                │
    │                  │── 0x021C ──────────────────────────────────────────▶│
    │◀── 0x021C ────────│   broadcast   │                  │                │
    │   [commId]        │   [commId]    │                  │                │
    │   ← room state=4  │               │                  │                │
    │                  │               │                  │                │
    │   (all clients connect to game server at hostname:port)              │
    │                  │               │                  │                │
    │◀── 0x021C ────────────────────────│◀─────────────────│                │
    │   (lobby notification, no action) │                  │                │
    │                  │               │                  │                │
    │                  │── 0x0224 ──────────────────────────────────────────▶│
    │◀── 0x0224 ────────│ state change  │                  │                │
    │   [commId][id][s] │               │                  │                │
```

**Key invariants confirmed from binary:**
- Room server sets channel state=4 when it processes the 0x021C it broadcasts; `FUN_004ec530` polls this state and returns when state==4. Confirmed from `FUN_004ee420` case 0x021C: `thunk_FUN_004e4f60(*commId, 4)`.
- If the lobby responds with 0x0402 where numServers==0, the room server sets channel state=8 and the client logs `"Failed: Game Server start"`. Confirmed from `FUN_004ee420` case 0x0402.
- The master's game server hostname comes from the 0x0402 entry (§11.5.2); port comes from the lobby 0x0214 (§11.6.2).
- **Non-master game server address (CONFIRMED from `FUN_00828d00`, `FUN_004e6f30`):** Non-master clients connect to the game server using the SAME hostname as the race room server (stored in `game_state+0xa0` from the existing room connection). The game server port is expected via a 0x0214 on the lobby channel for each non-master. Therefore, the game server MUST be deployed at the same IP as the room server.
- 0x0108 S→C is purely informational: confirmed from `FUN_004ee420` case 0x0108 — the dispatcher only logs it, takes no further action. The actual client-side trigger for connecting to the game server is 0x021C.
- 0x0224 carries state transitions (loading → in-progress → complete). On termination the server MUST send 0x021D NPS_GAME_SERVER_TERMINATED to all channel members. Confirmed from `FUN_004ee420` case 0x021D: `thunk_FUN_004e4f60(*commId, 1)` resets channel state to 1.

### 12.11 Slot Management

Slots represent position assignments (race starting positions, team slots) within a channel.

| Message | Dir | Format | Description |
|---------|-----|--------|-------------|
| 0x010D GetSlotList | C→S | `"ll"` `[commId][field1]` | Request current slot list |
| 0x010F RemoveSlot | C→S | `"l"` `[commId]` | Remove self from slot |
| 0x0225 NPS_SLOT_UPDATE | S→C | (no payload) | Slot state changed; client should re-request |
| 0x0226 NPS_SLOT_LIST | S→C | `[numSlots]` + N entries | Full slot assignment list |

Per-slot entry (16 bytes in deserialized buffer — 4 uint32 words):
- `[0]` commId — channel this slot belongs to
- `[1]` userId — assigned user (0 = empty)
- `[2]` slot number
- `*(s16*)(+12)` — nonzero = add assignment, zero = remove

**Server MUST requirements for slot management:**
1. Server MUST respond to 0x010D GetSlotList with 0x0226 NPS_SLOT_LIST containing the current full slot assignment list for the requested commId.
2. Server MUST respond to 0x0122 RequestSlotPosition with 0x0226 NPS_SLOT_LIST after assigning the slot; the response includes the new assignment.
3. Server MUST broadcast 0x0225 NPS_SLOT_UPDATE to all channel members when any slot assignment changes (user joins, leaves, or is reassigned), signaling that clients should re-request the slot list.
4. Server MUST respond to 0x010F RemoveSlot by clearing the slot assignment for that user and broadcasting 0x0225 to all channel members.
5. Server MUST respond to 0x010D/0x0122/0x010F with 0x0226 using the per-slot entry layout: `[commId][userId][slot][padding+flags]` where `*(s16*)(+12)` is nonzero for add and zero for remove.

### 12.12 User Presence

Server-to-client messages for tracking user join/leave state within a room channel.

| Message | Dir | Format | Description |
|---------|-----|--------|-------------|
| 0x0202 NPS_USER_LEFT | S→C | `[0]` userId | User has left the channel |
| 0x0203 NPS_USER_JOINED | S→C | `[0]` userId, `[1…]` name p-string, `[…]` player blob | User has joined the channel; includes full player data blob |
| 0x020C NPS_USER_JOINED_CHANNEL | S→C | `[8]` userId (byte +32), `[9]` commId (byte +36) | Membership event for the channel itself |
| 0x0219 NPS_CHANNEL_UPDATE | S→C | `[0]` commId | Channel configuration has changed |

**Server MUST requirements for user presence:**
1. Server MUST send 0x0203 NPS_USER_JOINED to all **existing** channel members when a new user joins. The payload MUST include the full player blob so other clients can load the joining player's car model via `MCar_SetFromPlayer`. Confirmed: relay blob unchanged (see §8.1 / §8.2).
2. Server MUST send 0x020C NPS_USER_JOINED_CHANNEL to **all** channel members (including the joining user) when a new user joins. Confirmed from `FUN_004ee420` case 0x020C: adds user to `mUserList_Added`.
3. Server MUST send 0x0202 NPS_USER_LEFT to all **remaining** channel members when a user leaves or disconnects. The payload MUST contain the departing user's userId so clients can remove them from their local user list.
4. Server MUST send 0x0219 NPS_CHANNEL_UPDATE to all channel members when race configuration changes (e.g., track selection, race settings). The payload MUST contain the commId of the affected channel.
5. The player blob carried in 0x0203 and 0x0211 MUST be relayed byte-for-byte unchanged; clients parse it directly via `MCar_SetFromPlayer` (MCEVENT_GETCARDEF = 0x66).

---

## 13. Client Session Flow

```
 ┌──────────────────────────────────────────────────────────────────┐
 │  1. HTTPS auth:  GET /{service}?username&password&serviceID       │
 │     Server:      Valid=TRUE\nTicket=<hex>\n                       │
 └──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │  2. TCP connect to (LoginServerIP, LoginServerPort)               │
 │     Client → 0x501  NPSUserLogin  (contains auth ticket)          │
 │     Server → 0x601  NPS_LOGIN_OK  (payload: userId + zeros)       │
 │     Client closes connection (shutdown SD_BOTH + closesocket)     │
 └──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │  3. TCP connect to (LoginServerIP, LoginServerPort + 2)           │
 │     Client → 0x532  NPSGetPersonaMaps  (payload: customerId)      │
 │     Server → 0x607  PersonaMapList   or 0x602 error               │
 │     Client closes connection                                      │
 └──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │  4. TCP connect to (LoginServerIP, LoginServerPort + 2)           │
 │     Client → 0x502  NPSGetFirstGamePersona  (customerId + "Motor City") │
 │     Server → 0x613  PersonaCount  (N = number of personas)        │
 │                                                                   │
 │   If N > 0:                                                       │
 │     Server → 0x607  × N  (one per persona, individual records)    │
 │     Client closes connection                                      │
 │                                                                   │
 │   If N == 0:                                                      │
 │     Client closes connection                                      │
 │     → goto step 5 (create persona)                                │
 └──────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴──────────┐
                    │ N==0               │ N>0
                    ▼                    ▼
 ┌──────────────────────────┐    ┌──────────────────────────────────┐
 │ 5. NPSCreateGamePersona  │    │ (use first persona from step 4)  │
 │    TCP → LoginPort+2     │    └──────────────────────────────────┘
 │    Client → 0x507                                 │
 │    Server → 0x601 (new userId) or error           │
 │    Client closes connection                       │
 └─────────────────────┬─────────────────────────────┘
                       │
                       ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │  6. TCP connect to (LobbyIP, LobbyPort)                          │
 │     Client → 0x0100  NPS_USER_LOGIN  (userId, persona name, ...)  │
 │     Server → 0x0120  NPS_LOGIN_OK    (echo userId)                │
 │     → switch to TOMC framing                                      │
 │     Client ↔ Server: lobby/room messages (Section 11)             │
 │     Connection persists for session                               │
 └──────────────────────────────────────────────────────────────────┘
```

---

## 14. Data Types Reference

| Name       | Wire encoding                                 | Notes                              |
|------------|-----------------------------------------------|------------------------------------|
| uint32 BE  | 4 bytes, big-endian                           | `FUN_00aa5270`, `FUN_00aa76f0`     |
| uint16 BE  | 2 bytes, big-endian                           | `FUN_00ab5470`, `FUN_00aa92c0`     |
| uint8      | 1 byte                                        | `FUN_00aa7b90`                     |
| NPS string | `[uint16 BE len][len bytes]`                  | `FUN_00bb9aa0`; empty = 2 zero bytes |
| NPS sub-msg| `[uint16 BE len][len bytes]`                  | `FUN_00bb9c50`; empty = 2 zero bytes |
| 'p' string | `[uint32 BE (len+1)][bytes][0x00 null]`       | Lobby handshake only               |
| 'b' blob   | Fixed N bytes, no length prefix               | Used in 0x0401 RIFFList (256 bytes)|

---

## 15. Error Opcodes

All error responses MUST use the 12-byte NPS login header with no payload (total_len = 12). Error opcodes MUST be sent instead of the success opcode, never in addition to it.

| Opcode | Constant name (inferred) | Trigger                              |
|--------|--------------------------|--------------------------------------|
| 0x0602 | NPS_USER_NOT_FOUND       | Unknown customerId                   |
| 0x0610 | NPS_USER_NOT_AUTHORIZED  | Invalid credentials                  |
| 0x0623 | NPS_AUTH_DENIED          | Auth ticket rejected                 |
| 0x0626 | NPS_USER_BANNED          | Account banned                       |
| 0x0637 | NPS_CRC_MISMATCH         | Client binary mismatch               |
| 0x020a | NPS_NAME_IN_USE          | Persona name conflict (0x507 only)   |
| 0x060a | NPS_CREATE_FAILED        | Persona creation failed              |
| 0x0612 | NPS_GENERIC_ERROR        | Unspecified failure                  |
| 0x0621 | NPS_PERSONA_LIMIT        | Max persona count reached            |
| 0x0634 | —                        | (semantic TBD)                       |
| 0x0635 | —                        | (semantic TBD)                       |
| 0x0636 | —                        | (semantic TBD)                       |
| 0x0640 | —                        | (semantic TBD)                       |
| 0x0641 | —                        | (semantic TBD)                       |

---

## 16. MCOTS Database Server Protocol

**Status:** CONFIRMED — wire framing, response dispatch mechanism, and key operation layouts all verified from binary RE of `MCity_d.exe` (`DBHandlers.c`, `DBResultQ.C`, `dbdorace.c`, `dbperson.c`).

### 16.1 Role and Scope

MCOTS is the **entire game database backend** — not merely a leaderboard server. All online database operations route to it: car ownership, persona data, parts, clubs, auctions, racing, skins, economy (paychecks, junkyard), and more.

MCOTS is distinct from the NPS servers:

| Server | Port | Protocol | Purpose |
|--------|------|----------|---------|
| LoginServerIP | LoginServerPort | NPS login stream (§3) | Authentication, persona mgmt |
| LobbyServerIP | LobbyServerPort | TOMC/NPS (§4/§11) | Lobby, matchmaking |
| MCOTSServerIP | **43300** | MCOTS DB protocol | All in-game database operations |

The MCOTS server address is populated from the shard INI file as `MCOTSServerIP` (§5.1.2). The port is hardcoded to **43300**.

Confirmed from `DBResultQ_EnsureServerID` (0x0040d21f): uses `lpData_020d6150` = `MCOTSServerIP` string.

### 16.2 Protocol Mode Selection

The client operates in one of two DB modes, controlled by the global flag at `DAT_020be5bc`:

| Value | Mode | Backend |
|-------|------|---------|
| 1 | Online | MCOTS binary protocol over TCP:43300 |
| other | Offline | Microsoft DAO → SQL → local Access .MDB |

Confirmed from multiple DBREQ functions that check `if (DAT_020be5bc == 1)` before deciding online vs offline path.

**Offline mode** (single-player/LAN) uses Microsoft DAO COM objects (`DAODatabase`, `DAORecordset`) via `DBParamQuery` and `DBRecordset` wrappers. Named queries include `"StockAssembly_SelectAPT"` and `"Badge_Select"`. Source files: `C:\MCity\Frontend\dbcode.c`, `dbperson.c`, `dbparts.c`, `DBBadges.c`.

**Online mode** uses the MCOTS binary protocol described in the remainder of §16.

### 16.3 Async Queue Architecture

All online DB operations go through a two-queue system defined in `C:\MCity\Frontend\DBResultQ.C`:

- **DBResultQ** (`DBRequestQ`) — outbound request queue. Sends messages to MCOTS.
- **DBOutstandingQ** — pending-response tracking. Correlates responses to callbacks via sequence number.
- **CommMgr** at `DAT_020d6250` — same SocketMgr instance used for NPS lobby/room connections. Manages the TCP connection to MCOTS.

The send path:

```
DBREQ_Foo()
  └── DBFoo_FooOnline()
        └── DBResultQ_AllocMsg(&node, &payload, size)   // allocate buffer
            payload[0..1] = msgType (uint16 LE)
            payload[2..]  = parameters (uint32 LE)
        └── DBResultQ_Send(node, ...)
              ├── SERVERS::ConnectID() → connID
              ├── node[0x00..0x03] = connID
              ├── node[0x0b..0x0e] = "TOMC"
              └── CommMgr::vtable[3](node) → TCP send
```

### 16.4 MessageNode Buffer Layout

The `MessageNode` buffer written by `DBResultQ_Send` before transmission:

```
Offset  Size  Field
------  ----  -----
0x00    4     int32:  connection ID (internal CommMgr socket selector; NOT transmitted)
0x04    5     unknown internal fields
0x09    2     uint16 LE: wire_length (total bytes following this field, set by DBResultQ_AllocMsg)
0x0b    4     "TOMC" magic
0x0f    4     uint32 LE: sequence number
0x13    1     flags (typically 0)
0x14    2     uint16 LE: message type  ← payload pointer starts here
0x16    N     parameters (uint32 LE fields packed at 2-byte boundaries)
```

Total `MessageNode` size = `0x14 + alloc_size` where `alloc_size` is the DB payload size passed to `DBResultQ_AllocMsg`.

**TCP wire frame** (what is actually transmitted, starting at byte [0x09]):

```
Offset  Size  Field
------  ----  -----
0       2     uint16 LE: wire_length  (= alloc_size + 10)
2       4     "TOMC" magic
6       4     uint32 LE: seqNo (non-zero; distinguishes MCOTS from NPS which uses 0)
10      1     flags (typically 0)
11      2     uint16 LE: msgType
13      N     payload fields (uint32 LE)
```

This is IDENTICAL to the NPS TOMC wire framing (§4) except the 4-byte field at wire[6..9] is a non-zero sequence number rather than all zeros.

Confirmed from `DBResultQ_Send` (`FUN_009a16c0`, source `DBResultQ.C`):
- `*(int *)param_2 = local_18;` — writes connection ID at [0x00]
- `*(undefined4 *)(param_2 + 0xb) = s_TOMC._0_4_;` — writes "TOMC" at [0x0b]
- `*(undefined4 *)(param_2 + 0xf) = seqNo;` — writes seqNo at [0x0f]
- `local_14 = (ulong)*(ushort *)(param_2 + 0x14);` — reads msgType for debug log
- `DBResultQ_AllocMsg` (`FUN_009a1d00`): `*(undefined2*)(*ppNode + 9) = size;` — writes wire_length at [0x09]

### 16.5 DB Message Payload Format

All DB messages use **Little-Endian** encoding (unlike NPS which is Big-Endian).

Standard payload layout (where `payload` = `node + 0x14`):

```
Offset  Size  Field
------  ----  -----
0       2     uint16 LE: message type
2       4     uint32 LE: parameter 1 (if present)
6       4     uint32 LE: parameter 2 (if present)
...
```

For messages with structured bodies (CreateRace, JoinRace, etc.), the entire input struct is memcpy'd into the payload at offset 0 and the type field at offset 0 is then overwritten.

### 16.6 Master/Slave Server Architecture

The MCOTS system uses a **master + up to 4 slave** architecture:

1. The client connects to the **master** MCOTS server (connId = 0xFE, `MCOTSServerIP:43300`).
2. The client sends a 0x01b6 `Attach` to the master (aka `AttachAndLogin` for legacy path).
3. The master's success response (§16.12.2) contains up to 4 **slave server slots** (each 26 bytes). Each slot specifies a hostname+port for a dedicated slave server.
4. For each active slave slot (active = slot[0..3] ≠ 0xFFFFFFFF), the client:
   - Opens a new TCP connection to the slave hostname:port
   - Sends an identical 0x01b6 `Attach` message to the slave
5. All subsequent game DB operations are routed to the appropriate slave server.

Confirmed from `DBRES_AttachAndLogin` (`FUN_0099ed00`) and `FUN_0099ff10`:
- Master connId = 0xFE (`thunk_FUN_0099c980(0, 0xfe, hostname, 0xa924)`)
- Slave connId = `slot[0x47]` (from connection object)
- Slave Attach uses IDENTICAL 0x01b6 format as master Attach

### 16.7 Connection and Login Flow

```
Client                                  Master MCOTS (MCOTSServerIP:43300)
  │                                                  │
  │── TCP connect ────────────────────────────────▶  │
  │── 0x01b6 Attach (40 bytes) ─────────────────▶  │
  │                                                  │
  │◀─ [0x0065 MC_SUCCESS][0x00d5 response] ───────  │
  │       payload: flags, slave slots[0..3],         │
  │       server IDs, session metadata               │
  │                                                  │
  │   (for each active slave slot in response)       │
  │        ┌──────────────────────────────────────┐  │
  │        │     Slave MCOTS Server               │  │
  │        │── TCP connect ──────────────────▶    │  │
  │        │── 0x01b6 Attach (40 bytes) ──────▶   │  │
  │        │◀─ [0x0065 MC_SUCCESS] response ───   │  │
  │        └──────────────────────────────────────┘  │
  │                                                  │
  │  (all subsequent game DB requests go to slaves)  │
```

#### 16.7.1 Request: 0x1b6 Attach (Login)

Confirmed from `DBResultQ_Attach` (source: `C:\MCity\Frontend\DBResultQ.C`).

```
Total payload: 40 bytes (0x28)

Offset  Size  Field
------  ----  -----
0x00    2     uint16 LE: 0x01b6 (message type = Attach)
0x02    4     uint32 LE: customerID
0x06    4     uint32 LE: userID (= personaID)
0x0a   13     reserved, zero-filled
0x17   12     char[12]: persona name (null-terminated)
0x23    1     0x00 (explicit null terminator)
0x24    4     uint32 LE: 0x00001771 (constant = 6001 decimal)
```

A separate 288-byte context struct (allocated on heap) is passed to `DBResultQ_Send` carrying the session key:
```
  [0]  uint32: connectionID
  [4]  uint32: customerID
  [8]  uint32: userID
 [12]  char[15]: persona name
 [28]  uint32: sessionKeyLen
 [32]  byte[sessionKeyLen]: session key
```

The global `DAT_020be5b4` is set to `userID` after a successful attach. The global `DAT_020be5bc` is set to 1 (online) upon successful login.

#### 16.7.2 Legacy Login: 0x69 AttachAndLogin

Confirmed from `DBResultQ_AttachAndLogin` (0x0040671c, source: `C:\MCity\Frontend\DBResultQ.C`).

An earlier or alternative login message. Exact payload size and layout are partially confirmed:

```
Offset  Size  Field
------  ----  -----
0x00    2     uint16 LE: 0x0069 (message type = AttachAndLogin)
0x02    4     uint32 LE: customerID
0x06    4     uint32 LE: userID
...    ...    persona name at offset ~0x16 (13 bytes)
...    ...    uint32 0x1771 at offset ~0x23
```

The relationship between 0x1b6 and 0x69 is not fully resolved. 0x69 may be the legacy/simpler variant (without session key); 0x1b6 may be the session-key-authenticated variant used in production.

### 16.8 Known Message Types (Client → Server)

All values are **uint16 LE**. All fields are **uint32 LE** unless noted.

#### 16.8.1 Session

| Type | Name | Total Size | Payload Fields |
|------|------|-----------|----------------|
| 0x0069 | AttachAndLogin | ~40 | customerID, userID, persona name, 0x1771 |
| 0x01b6 | Attach | 40 | customerID, userID, pad[13], name[12], 0x00, 0x1771 |

#### 16.8.2 Persona / Player

| Type | Name | Total Size | Payload Fields |
|------|------|-----------|----------------|
| 0x006c | GetPersonaInfo | 10 | personaID |
| 0x010a | SetPlayerPhysical | 26 | personaID, model, hair, skin, shirt, pants |
| 0x0169 | GetPersonaRaceHistory | 10 | personaID |

Confirmed sources: `DBPersona_GetPersonaInfo` → type 0x6c; `DB_SetPlayerPhysicalOnline` → type 0x10a; `DBPersona_GetPersonaRaceHistory` → type 0x169.

#### 16.8.3 Vehicle / Garage

| Type | Name | Total Size | Payload Fields |
|------|------|-----------|----------------|
| 0x00ac | GetCarIdsByOwner | 10 | ownerID |
| 0x0091 | GetCarPartsList | 10 | carID, delta |
| 0x00a3 | UserVehicleChange | 10 | carID |
| 0x00aa | UpdateSkin | 11 | carID, skinID, skinClass (uint8) |

Confirmed sources: `Dbcode_GetCarIdsByOwnerOnline` → 0xac; `DBParts_GetCarPartsListOnline` → 0x91; `DBREQ_UserVehicleChange` → 0xa3; `DBClass_UpdateSkin` → 0xaa.

#### 16.8.4 Parts / Workshop

| Type | Name | Total Size | Payload Fields |
|------|------|-----------|----------------|
| 0x00ae | GetInventoryPartList | 10 | ownerID |
| 0x00b5 | InstallPart | 14 | carID, partID, attachmentType |

Confirmed sources: `DBParts_GetInventoryPartList` → 0xae; `DBParts_InstallPart` → 0xb5.

#### 16.8.5 Junkyard

| Type | Name | Total Size | Payload Fields |
|------|------|-----------|----------------|
| 0x0098 | JunkyardScrapCar | 10 | carID |

Confirmed from `DBCode_JunkyardScrapCar`.

#### 16.8.6 Racing

| Type | Name | Total Size | Structure |
|------|------|-----------|-----------|
| 0x00e6 | CreateRace | 50 | CreateRaceMsg struct (50 bytes; type overwrites bytes 0–1) |
| 0x00da | JoinRace | 12 | JoinRaceMsg struct (12 bytes; type overwrites bytes 0–1) |
| 0x00e8 | StartRace | 70 | DBStartRaceInputData struct (70 bytes; type overwrites bytes 0–1) |

Confirmed sources: `DBDoRace_CreateStandardRace` → 0xe6; `DBDoRace_JoinRace` → 0xda; `DBDoRace_StartRace` → 0xe8.

#### 16.8.7 Clubs

| Type | Name | Total Size | Structure |
|------|------|-----------|-----------|
| 0x017c | GetClubList | 54 | ClubGetListOfClubsMsg struct (54 bytes; type overwrites bytes 0–1) |

Confirmed from `DBClubs_GetClubList`.

#### 16.8.8 Economy / Miscellaneous

| Type | Name | Total Size | Payload Fields |
|------|------|-----------|----------------|
| 0x0144 | GetLobbyList | 10 | none |
| 0x0185 | GetTunables | 10 | none |
| 0x018a | GetPaychecks | 10 | none |
| 0x018c | DepositPaycheck | 10 | personaID |

Confirmed sources: `DBMiscInfo_GetLobbyList` → 0x144; `DBMiscInfo_GetTunables` → 0x185; `DBMiscInfo_GetPaychecks` → 0x18a; `DBMiscInfo_DepositPaycheck` → 0x18c.

### 16.9 Additional Operations (Layout TBD)

The following `DBREQ_*` functions exist in the binary (source files: `dbdorace.c`, `dbclass.c`, `DBClubs.cpp`, `DBMiscInfo.cpp`, `dbjunkyd.c`) but their wire type bytes and payload layouts have not yet been extracted:

**Audio:** `DBREQ_GetAbstractAudioList`, `DBREQ_SetAbstractAudioCount`, `DBREQ_ClearAbstractAudioCounts`, `DBREQ_GetNewCarAudioList`, `DBREQ_SetNewCarAudioCount`, `DBREQ_ClearNewCarAudioCounts`

**Auctions:** `DBREQ_OfferEntry`, `DBREQ_BidEntry`, `DBREQ_GetAdDetails`, `DBREQ_GetAuctionActivity`, `DBREQ_GetAuctionMakes`

**Clubs:** `DBREQ_CreateClub`, `DBREQ_ResignFromClub`, `DBREQ_UnInviteIntoClub`, `DBREQ_InviteIntoClub`, `DBREQ_PromoteClubMember`, `DBREQ_DemoteClubMember`, `DBREQ_EjectClubMember`, `DBREQ_QuitClub`, `DBREQ_ReplyToClubInvite`, `DBREQ_GetClubInfo`, `DBREQ_ChangeClubDescription`, `DBREQ_GetClubInvitations`, `DBREQ_GetClubMemberInfo`, `DBREQ_GetClubMemberList`, `DBREQ_ClubMessageAll`, `DBREQ_AllowClubInvites`, `DBREQ_ShowClubLogoAcronym`, `DBREQ_RegisterClub`, `DBREQ_AssignClubTitle`

**Parts/Workshop:** `DBREQ_KillPart`, `DBREQ_BuyReplaceAndKill`, `DBREQ_UninstallPart`, `DBREQ_GetBrandedPartList`, `DBREQ_GetSkinList`, `DBREQ_GetSkinIDList`, `DBREQ_GetSkinInfo`, `DBREQ_GetAssemblyPartList`, `DBREQ_RepairPart`, `DBREQ_PurgeAllParts`, `DBREQ_GetRepairCost`, `DBREQ_PartPutUserLabel`, `DBREQ_PartsSetStatus`, `DBREQ_GetStockPartsList`, `DBREQ_ManufactureStockAssembly`, `DBREQ_GetBrandNamesList`

**Race/Damage:** `DBREQ_RacerCompleted`, `DBREQ_RacerLeft`, `DBREQ_RacerDidNotFinish`, `DBREQ_RacerFaulted`, `DBREQ_RacerRequestRestart`, `DBREQ_RacerUpdate`, `DBREQ_KeepRaceAlive`, `DBREQ_PutDamageInSim`, `DBREQ_PutModelData`, `DBREQ_ClearModelData`, `DBREQ_GetModelData`, `DBREQ_SendPreRaceCrc`, `DBREQ_SendPostRaceCrc`, `DBREQ_SendPreRaceCRCTestDrive`, `DBREQ_GetTeamTrialBracketInfo`, `DBREQ_GetFeePurseInfo`, `DBREQ_CreateRace`, `DBREQ_JoinRace`, `DBREQ_StartRace`, `DBREQ_GetBlockFamilyList`

**Other:** `DBREQ_ValidateAddressees`, `DBREQ_GetUrlInfo`, `DBREQ_GetArcadeCarList`, `DBREQ_GetGameConfigCarTable`, `DBREQ_DeletePersona`, `DBREQ_SetPlayerOptions`, `DBREQ_SetVehicleFlags`, `DBREQ_ScrapInventoryPart`, `DBREQ_GetPartInfos`, `DBREQ_ApplyPatches`, `DBREQ_GetEnginePhysicsByOrdinal`, `DBREQ_JunkyardGetCarSellPrice`, `DBREQ_GetLobbyList`, `DBREQ_RefreshCarPartsList`

### 16.10 Offline-Only Operations (No MCOTS Wire Message)

The following operations are **offline-only** — they query the local Access .MDB directly via DAO/SQL and have no MCOTS binary protocol counterpart:

- `Dbcode_GetStockCarList` — SQL named query `"StockAssembly_SelectAPT"`, returns `DBStockListOutputData`
- `DBBadges_GetList` — SQL named query `"Badge_Select"`, returns `DBBadgeList`
- `DBParts_GetBrandedPartList` — calls `DBParts_AppendBrandedPartsToList` from local DB

### 16.11 Server Response Wire Format

All MCOTS server responses use the same outer TOMC framing as requests (§16.4). The server identifies success or failure via the outer **msgType** field:

| Wire msgType | Constant | Meaning | Callback successFlag |
|-------------|----------|---------|---------------------|
| 0x0065 | MC_SUCCESS | Operation succeeded | 1 |
| 0x0066 | MC_FAILED | Operation failed | 0 |
| 0x0107 | MC_MSG_NOT_HANDLED_BY_SERVER | Server does not support this msgType | 0 |

The server MUST echo back the client's **seqNo** unchanged in the response wire frame, so the client can match the response to the pending callback via `DBOutstandingQ_FindBySeq`.

Confirmed from `DBHandlers_MatchToSequence` (`FUN_009190e0`, source `DBHandlers.c`):
```c
if (param_2 == 0x65) param_3 = 1;   // MC_SUCCESS → successFlag=1
else if (param_2 == 0x66) param_3 = 0; // MC_FAILED → successFlag=0
else if (param_2 == 0x107) param_3 = 0; // MC_MSG_NOT_HANDLED → successFlag=0
```

#### 16.11.1 MC_SUCCESS Response Payload

For successful responses, the payload (at `node+0x14`) is operation-specific. The first 2 bytes are an **operation response code** (uint16 LE) identifying the specific success response type:

```
Offset  Size  Field
------  ----  -----
0       2     uint16 LE: operation response code (operation-specific)
2       N     operation-specific response fields (uint32 LE unless noted)
```

#### 16.11.2 MC_FAILED Response Payload

For failed responses (`outer msgType = 0x0066`), the payload layout is:

```
Offset  Size  Field
------  ----  -----
0       2     uint16 LE: ??? (unclear; possibly 0x0066 mirrored)
2       2     uint16 LE: "reply" type (the original DBREQ msgType being responded to)
4       4     uint32 LE: error/result code (the error enum value)
8       4     uint32 LE: additional data (operation-dependent)
```

Confirmed from `DBHandlers_MatchToSequence` (`FUN_009190e0`):
- `.reply` = `param_4[1]` (uint16 at payload[2..3])
- `.result` = `*(uint32*)(param_4+2)` (uint32 at payload[4..7] via uint16* arithmetic)
- `.data` = `*(uint32*)(param_4+4)` (uint32 at payload[8..11])

The error code at payload[4..7] is what all `DBRES_*` handlers access via `*(undefined4*)(param_4 + 4)` when `successFlag == 0`.

#### 16.11.3 Common Error Codes

Error codes confirmed from `DBRES_Attach` (`FUN_0099cd20`) and `DBRES_AttachAndLogin` (`FUN_0099ed00`):

| Code | Hex | Meaning (where known) |
|------|-----|-----------------------|
| 107 | 0x6b | Authentication/session error |
| 124 | 0x7c | Generic failure (JoinRace) |
| 125 | 0x7d | Mapped to 0x1c (OfferEntry) |
| 126 | 0x7e | Mapped to 0x19 (OfferEntry) |
| 130 | 0x82 | Unknown |
| 131 | 0x83 | Unknown |
| 133 | 0x85 | JoinRace: mapped to state 0x0f |
| 138 | 0x8a | Mapped to 3 (OfferEntry); general error |
| 162 | 0xa2 | JoinRace: mapped to state 0x2a |
| 186 | 0xba | Unknown |
| 187 | 0xbb | Unknown |
| 188 | 0xbc | Unknown |
| 189 | 0xbd | JoinRace: mapped to state 0x28 |
| 190 | 0xbe | JoinRace: mapped to state 0x29 |
| 191 | 0xbf | JoinRace: mapped to state 0x1a |
| 231 | 0xe7 | Race already started |
| 238 | 0xee | JoinRace: mapped to state 0x2c |
| 436 | 0x1b4 | Attach/login error |

### 16.12 Known Response Formats (MC_SUCCESS)

#### 16.12.1 AttachAndLogin Response (0x00d5)

Operation response code: **0x00d5**. Total payload: ≥ 173 bytes (0xad).

Confirmed from `DBRES_AttachAndLogin` (`FUN_0099ed00`, source `DBResultQ.C`):

```
Offset  Size  Field
------  ----  -----
0x00    2     uint16 LE: 0x00d5 (operation success code)
0x02    4     uint32 LE: ??? (server version? always 0 in dev build)
0x06    1     uint8:  flags
                bit0 = FirstLogin (DAT_020d6260)
                bit1 = PaycheckWaiting (DAT_020d6261)
                bit2 = unknown (DAT_020d6262)
0x07    2     unknown (2 bytes)
0x09    4     uint32 LE: DAT_020d5c10
0x0d    4     uint32 LE: DAT_020d5c14
0x11    4     uint32 LE: DAT_020d6144
0x15    4     uint32 LE: DAT_020d6138
0x19    4     uint32 LE: DAT_020d6120
0x1d    4     uint32 LE: DAT_020d6140
0x21   104    4 × 26-byte slave server slots (see below)
0x89    4     uint32 LE: DAT_020d6124 (server count/ID)
0x8d    4     uint32 LE: DAT_020d5c18
0x91    4     uint32 LE: DAT_020d5c1c
0x95    4     uint32 LE: DAT_020d5c20
0x99    4     uint32 LE: DAT_020d5c24
0x9d    4     uint32 LE: DAT_020d6128
0xa1    4     uint32 LE: DAT_020d612c
0xa5    4     uint32 LE: DAT_020d6130
0xa9    4     uint32 LE: DAT_020d6134
```

**Slave server slot (26 bytes each)**, 4 slots at offsets 0x21, 0x3b, 0x55, 0x6f:
```
Offset  Size  Field
------  ----  -----
0       4     uint32 LE: server ID (0xFFFFFFFF = slot inactive/unused)
4      22     additional connection parameters (layout partially unknown)
```

A slot is active if and only if `slot[0..3] != 0xFFFFFFFF`.

#### 16.12.2 Attach (Slave) Response

The slave Attach response is processed by `DBRES_Attach` (`FUN_0099cd20`). On MC_SUCCESS:
- Calls `FUN_00a7e742` (session key validation)
- Calls `FUN_00a7e5cf` (enable encryption)

The exact response payload layout for slave Attach is not yet confirmed.

#### 16.12.3 GetPersonaInfo Response

Operation msgType sent: **0x006c**. Payload size: 10 bytes.

Success response (outer MC_SUCCESS):
```
Offset  Size  Field
------  ----  -----
0       2     uint16 LE: response type (TBD)
2       4     uint32 LE: personaID  (logged: "Got playerinfo! PersonaID: %d")
0x24    2     uint16 LE: numCarsOwned (MUST be < 128)
```

Total response size: up to 449 bytes (0x1c1), copied into a 456-byte (0x1c8) internal persona struct.

Confirmed from `DBRES_GetPersonaInfo` (`FUN_0097b0d0`, source `dbperson.c`):
- PersonaID at `*(uint32*)(param_4 + 2)` = payload[2..5]
- numCarsOwned at `*(uint16*)(param_4 + 0x24)` = payload[0x24..0x25], ASSERT < 128

#### 16.12.4 CreateRace Response

Operation msgType sent: **0x00e6**, payload 50 bytes.

Success response (outer MC_SUCCESS):
```
Offset  Size  Field
------  ----  -----
0       2     uint16 LE: response type (TBD)
2       4     uint32 LE: raceID  (logged: "raceID = %d")
6       4     uint32 LE: race field A
10      8     race data block (8 bytes)
22      4     uint32 LE: race field B
26      4     uint32 LE: race field C
```

Total: ≥ 30 bytes. Server allocates a 32-byte (0x20) internal race descriptor.

Confirmed from `DBRES_CreateRace` (`FUN_00901880`, source `dbdorace.c`):
- raceID at `*(uint32*)(param_4 + 2)` = payload[2..5]

#### 16.12.5 JoinRace Response

Operation msgType sent: **0x00da**, payload 12 bytes.

Success response (outer MC_SUCCESS):
```
Offset  Size  Field
------  ----  -----
0       2     uint16 LE: response type (TBD)
2       4     uint32 LE: raceID
6       8     race join data (8 bytes; exact semantics TBD)
```

Total: ≥ 14 bytes. Server allocates a 16-byte (0x10) internal join descriptor.

Error codes confirmed from `DBRES_JoinRace` (`FUN_00903320`): 0x7c, 0x85, 0xa2, 0xbd, 0xbe, 0xbf, 0xe7 (race already started), 0xee.

#### 16.12.7 GetCarIdsByOwner Response

Operation msgType sent: **0x00ac**, payload 10 bytes (ownerID at [2..5]).

Success response (outer MC_SUCCESS):
```
Offset  Size  Field
------  ----  -----
0       2     uint16 LE: 0x00ac (echo of request msgType)
2       1     uint8:  N = vehicle count
3+i×8   4     uint32 LE: carId[i]
7+i×8   4     uint32 LE: bptId[i]   (blueprint ID of the base assembly)
```

Total inner payload: 3 + 8×N bytes.

Confirmed from `DBRES_GetCarIdsByOwner` (`FUN_008f3300`, source `dbcode.c`):
- count at `*(byte*)(param_4 + 2)` (uint8)
- carId[i] at `*(uint32*)(param_4 + 3 + i*8)`
- bptId[i] at `*(uint32*)(param_4 + 7 + i*8)`

#### 16.12.6 StartRace Response

Operation msgType sent: **0x00e8**, payload 70 bytes (broadcast to all MCOTS servers via `FUN_009a38f0`).

Success response (outer MC_SUCCESS):
```
Offset  Size  Field
------  ----  -----
0       2     uint16 LE: response type (TBD)
2       4     uint32 LE: raceID
6       4     uint32 LE: race field
10     30     6 × 5-byte racer entries:
               [+0]: uint32 LE racer field
               [+4]: uint8 racer status
```

Total: ≥ 40 bytes. Server allocates a 44-byte (0x2c) internal race-start descriptor.

Error codes confirmed from `DBRES_StartRace` (`FUN_00904f00`): 0xe7 → client state 0x27 (race already started), all others → client state 3.

### 16.13 Server Implementation Notes (MUST)

A MCOTS server implementation MUST:

1. Accept TCP connections on port **43300**.
2. Authenticate via the 0x01b6 Attach message (customerID + userID; session key in outer context struct).
3. For each 0x01b6 Attach, return an MC_SUCCESS response (outer msgType 0x0065) with an inner payload beginning with 0x00d5 (per §16.12.1), including up to 4 slave server slots.
4. Process all DB message types listed in §16.8 and return responses matching the formats in §16.12.
5. Return all response payload fields as **Little-Endian** (the protocol is LE throughout, unlike NPS).
6. Echo the request **seqNo** unchanged in the response wire frame so the client can match via `DBOutstandingQ_FindBySeq`.
7. Return MC_FAILED (outer msgType 0x0066) for any operation failure, with the error code at response payload[4..7].
8. Track per-session state using the `customerID` / `userID` pair from the Attach message.

---

## Appendix A: Key Functions (MCity_d.exe)

| Address     | Description                                          |
|-------------|------------------------------------------------------|
| FUN_00abbd00 | NPSUserLogin — sends 0x501, receives 0x601          |
| FUN_00aa7ff0 | NPSGetPersonaMaps — sends 0x532, receives 0x607     |
| FUN_00ab9670 | NPSGetFirstGamePersona — sends 0x502, receives 0x613 + 0x607×N |
| FUN_00ab5a80 | NPSCreateGamePersona — sends 0x507, receives 0x601  |
| FUN_00abdb10 | Builds 0x501 request object                          |
| FUN_00abda10 | Implied: builds 0x601 response payload               |
| FUN_00aa88d0 | Serializes 0x532 payload (`[uint32 BE customerId]`)  |
| FUN_00aba0b0 | Serializes 0x502 payload                             |
| FUN_00ab52d0 | Serializes 0x507 payload (vtable[2])                 |
| FUN_00aa9850 | Serializes persona sub-object (vtable[2])            |
| FUN_00aa9ac0 | Deserializes 0x607 outer response (vtable[3])        |
| FUN_00aba340 | Deserializes 0x613 response (vtable[3])              |
| FUN_00bb9aa0 | Packs NPS string `[uint16 BE len][bytes]`            |
| FUN_00bb9550 | Advances buffer write pointer by 12 (confirms header size) |
| FUN_00ac2070 | Sends `vtable[1]()` bytes = `12 + payload_size`     |
| FUN_00aa5270 | Packs uint32 BE to stream                            |
| FUN_00aa76f0 | Packs uint32 BE to stream (alternate path)           |
| FUN_00ab5470 | Packs uint16 BE to stream                            |
| FUN_00aa92c0 | Reads uint16 BE from stream (ntohs)                  |
| FUN_00aa7b90 | Packs uint8 to stream                                |
| FUN_00589b30 | Game init; reads AuthAuth registry; passes "Motor City" as gameName |
| FUN_00aa29d0 | NPSLogin init (authlogin.dll path, service, server)  |
| FUN_00aa3730 | Calls authlogin.dll for HTTPS auth → ticket          |
| FUN_00ac15b0 | AttachToServer(name, port, …) — connect to NPS port  |
| FUN_00ac18e0 | Wait for server response (timeout in seconds)        |
| FUN_0083e0b0 | Read shard list URL from registry (ShardUrlTest / ShardUrlDev / hardcoded) |
| FUN_0083e7d0 | Fetch shard list: reads URL, logs "Fetching Shard List:", calls HTTP GET |
| FUN_0083e990 | HTTP response handler: logs raw body, checks ≤10240 bytes |
| FUN_0083ee20 | HTTP event dispatcher: 0x5c=success→parse, 0x5d=error→retry |
| FUN_00833690 | Shard list processor: calls INI parser then get-first-shard |
| FUN_00b1f740 | INI parser (gini.cpp): parses `[Section]\nkey=value` format into section objects |
| FUN_008339e0 | Get shard by index (0-based); looks up "ShardId" key  |
| FUN_008362d0 | Read shard fields into client globals (ShardId, MCOTSServerIP, LoginServerIP, LoginServerPort, LobbyServerIP, LobbyServerPort) |
| FUN_00835410 | Main login loop: select shard randomly, call NPSUserLogin, download persona list |
| FUN_0083a750 | Register XML push-message tokens: `<SHARDS>` `<PERSONAS>` `<DELETE>` `<CREATE>` |
| FUN_00ad7690 | NPSAddCommChannel flow: alloc channel state, populate, send 0x106, wait for GRANTED/DENIED |
| FUN_00ad97e0 | Channel state init from NPSArg (sets commId, name, protocol, flags, blob) |
| FUN_00ad9b80 | Channel state defaults: protocol=TCP, priority=2, field_16=1, extra_0x8c=250 |
| FUN_00ad8850 | Channel state wire-area prep: copies low-offset fields to +0x1a0 scratch region |
| FUN_00bbdfe0 | 0x106 payload serializer: reads from wire scratch area, calls FUN_00bc39c0 with format "lplllllsssssspscssllbl" |
| FUN_00bc30f0 | 0x106 outer encoder: computes size (0x170 max), allocates buffer, calls FUN_00bbdfe0 |
| FUN_00bbe1f0 | Returns fixed max encoded size 0x170 = 368 bytes for 0x106 |
| FUN_004ee420 | Room server dispatcher (`cnps_roomserver.cpp`): handles all S→C opcodes 0x108–0x404, 0xFFF |
| FUN_004e29f0 | GameServer message dispatch: chains to FUN_004ee420 then handles 0x208/0x20C/0x211/0x229 for game-server user tracking |
| FUN_004e4d10 | Processes N server info entries (stride 0x4C=76 bytes); name at +0x20, calls FUN_004e4830 |
| FUN_004e4040 | Init a single 76-byte server info entry from wire data |
| FUN_00503ef0 | Extract name string from server info entry wire buffer |
| FUN_004e4830 | __thiscall: copies wire server-info fields to local channel_state struct; src+0x20=commId, src+0x24=name, src+0x34=field, src+0x3c=numUsers |
| FUN_004e5250 | Processes N RIFF/room entries (stride 0x150=336 bytes); name at +0x24, numUsers at +0x3c |
| FUN_004e54b0 | Handles 0x0404 NPS_MINI_RIFF_LIST compact room entries |
| FUN_004f4bf0 | Adds userId to mUserList_Removed (game-server departure tracking) |
| FUN_004f4b00 | Adds user entry to mUserList_Added (game-server arrival tracking) |
| FUN_00bbf850 | NPS "Compress" encoder dispatch: maps opcodes to body-encoder functions; throws for unsupported opcodes |
| FUN_00bc39c0 | NPS format-string serializer (msgpack.cpp): packs fields per format chars l/s/c/p/b |
| FUN_00bc2f50 | 0x100/0x301 handshake encoder |
| FUN_00bc2db0 | Format `"l"` encoder: used by 0x101, 0x104–0x107, 0x10c, 0x10e–0x10f, 0x119, 0x11d, 0x123, 0x126, 0x128, 0x201, 0x213, 0x30d–0x310 |
| FUN_00bc3020 | Format `"lpb"` encoder: used by 0x103, 0x11e |
| FUN_00bc30f0 | Format `"lplllllsssssspscssllbl"` encoder: used by 0x106 |
| FUN_00bc31c0 | Format `"ls"` encoder: used by 0x108 StartGame C→S |
| FUN_00bc32b0 | Format `"llss"` encoder: used by 0x109 NPS_READY_FOR_GAME |
| FUN_00bc33a0 | Format `"lp"` encoder: used by 0x10a SendChannelMsg |
| FUN_00bc3490 | Format `"ll"` encoder: used by 0x10d GetSlotList |
| FUN_00bc3890 | Format `"ll"` encoder: used by 0x214/0x215 CHANNEL_GRANTED/CONDITIONAL |
| FUN_00bbe4b0 | Body encoder for 0x101 etc.: references DAT_0118d55c ("l") |
| FUN_00bbf530 | Body encoder for 0x108 StartGame: references DAT_012141ac ("ls"), passes *(short*)(param_4+1) |
| FUN_00bbf170 | Body encoder for 0x109 ReadyForGame: references DAT_01214194 ("llss"), passes commId/userId/isReady/isMaster |
| FUN_00bbee50 | Body encoder for 0x214/0x215: references DAT_0118dffc ("ll") |
| FUN_00bbf4b0 | Body encoder for 0x10d: references DAT_0118dffc ("ll") |
| FUN_00bbf5b0 | Body encoder for 0x10a: references DAT_0121407c ("lp") |
| FUN_00bbd760 | Body encoder for 0x103/0x11e: references DAT_01214078 ("lpb") |
| FUN_00bbd540 | Header-only encoder: for unknown opcodes where param_2==0 |
| FUN_009a16c0 | DBResultQ_Send — writes connId/TOMC/seqNo, calls CommMgr::vtable[3] |
| FUN_009a1d00 | DBResultQ_AllocMsg — AllocPacket(size), writes wire_length at [0x09] |
| FUN_009a29e0 | DBOutstandingQ_FindBySeq — finds 5-DWORD queue item matching seqNo |
| FUN_009a1ca0 | DBResultQ_QueueAndSend — queues and sends a DB request |
| FUN_0099c130 | DBResultQ_EnsureServerID — connects to MCOTSServerIP:43300 as master |
| FUN_0099d950 | DBResultQ_Attach — builds 0x01b6 Attach request (40 bytes) |
| FUN_0099ed00 | DBRES_AttachAndLogin — master success response handler (0x00d5) |
| FUN_0099cd20 | DBRES_Attach — slave success response handler |
| FUN_0099ff10 | SlaveAttach initiator — sends 0x01b6 to slave servers |
| FUN_0099fc70 | SlaveSlotProcess — processes each active slave slot from AttachAndLogin response |
| FUN_009190e0 | DBHandlers_MatchToSequence — routes response by seqNo and msgType (0x65/0x66/0x107) |
| FUN_0097b0d0 | DBRES_GetPersonaInfo — success: personaID@payload[2..5], numCarsOwned@[0x24..0x25] |
| FUN_0097bd00 | DBREQ_GetPersonaInfo — sends 0x006c request (10 bytes) |
| FUN_0097b7d0 | DBPersona_GetPersonaInfo — builds 0x006c with personaID at payload[2..5] |
| FUN_009020d0 | DBREQ_CreateRace — sends 0x00e6 request (50 bytes) |
| FUN_00901740 | DBDoRace_CreateStandardRace — builds 0x00e6 payload |
| FUN_00901880 | DBRES_CreateRace — success: raceID at payload[2..5] |
| FUN_00903d30 | DBREQ_JoinRace — sends 0x00da request (12 bytes) |
| FUN_00903090 | DBDoRace_JoinRaceOnline — builds 0x00da payload |
| FUN_00903320 | DBRES_JoinRace — success: raceID@[2..5], 8 bytes@[6..13] |
| FUN_00905d50 | DB_StartRace — sends 0x00e8 request (70 bytes) via FUN_009a38f0 (broadcast send) |
| FUN_00904f00 | DBRES_StartRace — success: raceID@[2..5], 6×5B racer entries@[10..39] |

---

## Appendix B: Registry Keys (Windows Client)

```
HKLM\SOFTWARE\Electronic Arts\Motor City\AuthAuth\
    AuthLoginServer         REG_SZ  NPS auth server hostname
    AuthLoginBaseService    REG_SZ  Auth URL service path prefix

HKLM\SOFTWARE\Electronic Arts\Motor City\1.0\
    ShardUrlTest            REG_SZ  Shard list URL (highest priority; overrides all)
    ShardUrlDev             REG_SZ  Shard list URL (fallback if not == hardcoded default)
    (no key)                        → hardcoded: http://159.153.226.86/ShardList/

HKLM\SOFTWARE\Electronic Arts\Network Play System\System\
    AuthUse_NPS_AAI         REG_SZ  If "1", use NPS AAI auth (skip authlogin.dll)
    Auth_NPS_AAI_Hostname   REG_SZ  NPS AAI server hostname
    Auth_NPS_AAI_Port       REG_SZ  NPS AAI server port
```

Shard config is fetched at runtime via HTTP GET (Section 5.1). The response is an INI-style text file providing LoginServerIP, LoginServerPort, LobbyServerIP, and LobbyServerPort.

---

## Appendix C: Open Questions (Pending RE)

1. **0x501 payload full structure** — auth ticket placement and crypto sub-messages. A private server can bypass by accepting any 0x501, but full structure needed for a strict validator.
2. ~~**Shard config URL and format**~~ — **RESOLVED**: HTTP GET returning INI-style text (Section 5.1). All fields confirmed.
3. ~~**Lobby 0x0106 AddCommChannel full payload**~~ — **RESOLVED**: 22-field format confirmed (Section 11.4). Server needs fields 1/2/5/6/7.
4. ~~**Room server protocol**~~ — **RESOLVED**: Complete S→C opcode dispatch and C→S format strings confirmed (Section 12). ~~0x011F NPSReadyForGame format TBD~~ — **RESOLVED**: `"ssl"` = `[s isReady][s 0][l roomCommId]`, 8 bytes (confirmed from `FUN_00ad5560`).
5. **0x634–0x637, 0x640–0x641 error semantics** — observed in NPSCreateGamePersona error path.
6. **Persona sub-object fields +0x28, +0x2c** — confirmed wire position but semantic meaning (capabilities, subscription flags, etc.) not yet determined.
7. **NPSGetPersonaMaps 0x607 vs NPSGetFirstGamePersona 0x607** — whether these use identical on-wire format or slightly different layouts.
8. ~~**MCOTS wire format (outer TCP framing)**~~ — **RESOLVED**: TOMC framing identical to NPS §4, but seqNo at wire[6..9] is non-zero LE uint32. All fields LE. Wire starts at MessageNode[0x09]. Confirmed from DBResultQ_Send/AllocMsg.
9. ~~**MCOTS response format (success/failure dispatch)**~~ — **RESOLVED**: outer msgType 0x0065=MC_SUCCESS, 0x0066=MC_FAILED, 0x0107=unhandled. Confirmed from DBHandlers_MatchToSequence (FUN_009190e0). Error code at response payload[4..7].
10. ~~**MCOTS AttachAndLogin success response layout**~~ — **RESOLVED**: inner code 0x00d5, ≥173 bytes, 4×26B slave slots at offset 0x21. See §16.12.1.
11. **MCOTS slave server slot (26-byte) full layout** — confirmed only first 4 bytes = serverID; remaining 22 bytes contain hostname/port/type (not yet mapped).
12. **MCOTS DBREQ response formats for 60+ unmapped operations** — clubs, auctions, workshop, audio, damage, etc. (see §16.9 for full list).
