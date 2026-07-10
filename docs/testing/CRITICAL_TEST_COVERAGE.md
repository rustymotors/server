# Critical Test Coverage - Code Paths Analysis

This document identifies critical code paths that need test coverage. The codebase has multiple patterns for similar operations, making it brittle. This analysis focuses on areas where failures would cause service disruption or security issues.

## Executive Summary

**Current State:**
- Good coverage for: packet serialization, basic utilities, some message handlers
- Missing coverage for: server initialization, connection handling, message routing, authentication flows, encryption/decryption, error paths, database operations

**Critical Gaps:**
1. **Entry Points** - No tests for server startup/shutdown
2. **Connection Management** - Limited tests for socket handling, IP whitelisting
3. **Message Routing** - Complex routing logic untested
4. **Authentication** - Login flows have minimal coverage
5. **Encryption** - Critical security paths untested
6. **Error Handling** - Many error paths unverified
7. **Database Operations** - Transaction and query error paths untested

---

## 1. Server Initialization & Entry Points

### Critical Paths

#### 1.1 Server Startup (`src/nps_server.ts`, `src/mcots_server.ts`)
**Status**: ❌ **NO COVERAGE**

**Critical Functions:**
- `main()` - Entry point with multiple failure modes
- Database connection verification
- Configuration loading and validation
- Gateway server initialization

**Test Cases Needed:**
```typescript
// src/nps_server.test.ts
- ✅ Server starts successfully with valid config
- ✅ Server exits when database connection fails
- ✅ Server handles missing/invalid configuration
- ✅ Server handles legacy cipher verification failure
- ✅ Error handling in main() catch blocks
- ✅ Process exit codes are set correctly
- ✅ Port lists are correctly passed to Gateway
```

**Risk**: High - Server won't start if these paths fail

#### 1.2 Gateway Server Initialization (`packages/gateway/src/GatewayServer.ts`)
**Status**: ❌ **NO COVERAGE**

**Critical Functions:**
- `constructor()` - Gateway setup
- `start()` - Server startup, port binding
- `init()` - Port router registration
- `shutdownServers()` - Graceful shutdown

**Test Cases Needed:**
```typescript
// packages/gateway/src/GatewayServer.test.ts
- ✅ Gateway initializes with valid config
- ✅ TCP servers start on all specified ports
- ✅ UDP sockets open on all specified ports
- ✅ Port routers are registered correctly
- ✅ Web server starts on port 3000
- ✅ HotkeyManager is initialized
- ✅ Graceful shutdown closes all connections
- ✅ Error handling when port binding fails
- ✅ Error handling when web server is undefined
- ✅ SIGINT handler triggers graceful shutdown
```

**Risk**: High - Core server functionality

---

## 2. Connection Handling

### Critical Paths

#### 2.1 TCP Connection Handler (`packages/gateway/src/index.ts::onSocketConnection`)
**Status**: ⚠️ **PARTIAL COVERAGE** (socket utilities tested, but not connection flow)

**Critical Functions:**
- `onSocketConnection()` - Main TCP connection entry point

**Test Cases Needed:**
```typescript
// packages/gateway/src/index.test.ts
- ✅ Connection accepted from whitelisted IP
- ✅ Connection rejected from non-whitelisted IP
- ✅ Socket tagged with correct connectionId format
- ✅ Port router retrieved and called
- ✅ Error handling when localPort is undefined
- ✅ Error handling when remoteAddress is undefined
- ✅ Error handling when socket is already destroyed
- ✅ Error handling in port router (catch block)
- ✅ ConnectionId format: UUID prefix + port
- ✅ Socket error handler attached
```

**Risk**: High - All client connections go through this

**Brittleness**: IP whitelist hardcoded, no configuration

#### 2.2 UDP Message Handler (`packages/gateway/src/index.ts::onUdpMessage`)
**Status**: ❌ **NO COVERAGE**

**Test Cases Needed:**
```typescript
- ✅ UDP messages are processed correctly
- ✅ Remote info is passed to handlers
- ✅ Error handling for malformed UDP packets
```

**Risk**: Medium - UDP functionality

#### 2.3 Socket Error Handling (`packages/gateway/src/socketErrorHandler.ts`)
**Status**: ✅ **HAS TESTS** (`packages/gateway/test/socketErrorHandler.test.ts`)

**Gap**: Tests exist but should verify:
- All error codes are handled appropriately
- ConnectionId is logged correctly

---

## 3. Message Routing & Processing

### Critical Paths

#### 3.1 NPS Port Router (`packages/gateway/src/npsPortRouter.ts`)
**Status**: ❌ **NO COVERAGE**

**Critical Functions:**
- `npsPortRouter()` - Main router entry point
- `processSocketData()` - Packet processing
- `splitDataIntoPackets()` - Packet splitting logic
- `parseInitialMessage()` - Message parsing
- `routeInitialMessage()` - Complex routing logic
- `handlePacketRouting()` - Error handling wrapper

**Test Cases Needed:**
```typescript
// packages/gateway/src/npsPortRouter.test.ts
- ✅ Single packet processing
- ✅ Multiple packets with separator (0x11, 0x01)
- ✅ Empty packets are filtered out
- ✅ Invalid packets are rejected (isPacketValid)
- ✅ Port 7003 routes to lobby handler
- ✅ Port 8226 routes to login handler
- ✅ Port 8227 routes to chat handler
- ✅ Port 8228 routes to persona handler
- ✅ Ports 9000-9020 route to lobby handler
- ✅ Port 10001 routes to lobby handler
- ✅ Unknown ports log warning
- ✅ Packet splitting handles edge cases (empty, single, multiple)
- ✅ Error handling in processSocketData catch block
- ✅ Error handling in handlePacketRouting
- ✅ RangeError handling (parseInitialMessage)
- ✅ Socket errors are handled correctly
- ✅ Responses are queued correctly
```

**Risk**: Critical - All NPS protocol messages route through this

**Brittleness**: Complex switch statement with port ranges, multiple handler patterns

#### 3.2 MCOTS Port Router (`packages/gateway/src/mcotsPortRouter.ts`)
**Status**: ❌ **NO COVERAGE**

**Critical Functions:**
- `mcotsPortRouter()` - MCOTS protocol router
- `processIncomingPackets()` - Packet processing
- `findPackageSignatureIndices()` - Packet detection
- `parseInitialMessage()` - Message parsing
- `routeInitialMessage()` - Message routing

**Test Cases Needed:**
```typescript
// packages/gateway/src/mcotsPortRouter.test.ts
- ✅ Multiple packets with signature detection
- ✅ Packet signature indices found correctly
- ✅ Packets processed in parallel
- ✅ Error handling in routeInitialMessage
- ✅ Error handling in processIncomingPackets
- ✅ Responses written to socket
- ✅ ConnectionId passed correctly
```

**Risk**: High - MCOTS protocol handling

**Brittleness**: Different pattern than NPS router (async forEach vs for loop)

#### 3.3 Port Router Registry (`packages/gateway/src/portRouters.ts`)
**Status**: ✅ **HAS TESTS** (`packages/gateway/test/portRouters.test.ts`)

---

## 4. Authentication & Login Flow

### Critical Paths

#### 4.1 Login Handler (`packages/login/src/login.ts`)
**Status**: ❌ **NO COVERAGE**

**Critical Functions:**
- `login()` - Main login processing

**Test Cases Needed:**
```typescript
// packages/login/src/login.test.ts
- ✅ Valid login with correct credentials
- ✅ Login fails when user record not found (contextId)
- ✅ Session key extracted correctly
- ✅ Session key saved to database
- ✅ Database error handling (updateSessionKey catch)
- ✅ Response message format correct
- ✅ Multiple response messages returned
- ✅ CustomerId and profileId in response
- ✅ Session key in response buffer
- ✅ Error when contextId is invalid
- ✅ Error when sessionKey extraction fails
```

**Risk**: Critical - Authentication is security-critical

**Brittleness**: Mixed error handling (throw vs catch), database operations

#### 4.2 Login Data Handler (`packages/login/src/handleLoginData.ts`)
**Status**: ❌ **NO COVERAGE**

**Test Cases Needed:**
```typescript
- ✅ Routes to login() correctly
- ✅ Error handling and wrapping
- ✅ Message deserialization
```

#### 4.3 Client Connect (`packages/transactions/src/clientConnect.ts`)
**Status**: ❌ **NO COVERAGE**

**Critical Functions:**
- `clientConnect()` - Establishes encryption for transactions

**Test Cases Needed:**
```typescript
// packages/transactions/src/clientConnect.test.ts
- ✅ Encryption pair created when session key found
- ✅ Error when customerId is wrong type
- ✅ Error when session key not found in database
- ✅ Existing encryption detected and skipped
- ✅ Session and encryption added to state
- ✅ Response messages returned
- ✅ Database query error handling
```

**Risk**: High - Required for encrypted transactions

---

## 5. Encryption & Decryption

### Critical Paths

#### 5.1 Transaction Message Encryption (`packages/transactions/src/internal.ts`)
**Status**: ❌ **NO COVERAGE**

**Critical Functions:**
- `receiveTransactionsData()` - Main entry point
- `decryptMessage()` - Message decryption
- `encryptOutboundMessage()` - Message encryption
- `decompressMessage()` - Message decompression

**Test Cases Needed:**
```typescript
// packages/transactions/src/internal.test.ts
- ✅ Encrypted messages are decrypted
- ✅ Unencrypted messages pass through
- ✅ Compressed messages are decompressed
- ✅ Uncompressed messages pass through
- ✅ Error when encryption settings not found
- ✅ Error when decryption fails
- ✅ Error when decompression fails
- ✅ Outbound messages are encrypted
- ✅ Encryption state is updated
- ✅ Message length verification
- ✅ Multiple messages in response
```

**Risk**: Critical - Security and data integrity

**Brittleness**: Multiple conditional paths, different encryption patterns

#### 5.2 Lobby Command Encryption (`packages/lobby/src/handlers/encryptedCommand.ts`)
**Status**: ❌ **NO COVERAGE**

**Critical Functions:**
- `encryptCmd()` - Command encryption
- `decryptCmd()` - Command decryption
- `handleCommand()` - Command routing

**Test Cases Needed:**
```typescript
- ✅ Commands encrypted correctly
- ✅ Commands decrypted correctly
- ✅ Padding added for 8-byte alignment
- ✅ Error when encryption session not found
- ✅ Command routing to correct handler
- ✅ Unknown commands throw error
- ✅ Encryption state updated
```

**Risk**: High - Lobby security

#### 5.3 NPS Game Command Encryption (`packages/nps/gameMessageProcessors/processEncryptedGameCommand.ts`)
**Status**: ❌ **NO COVERAGE**

**Test Cases Needed:**
```typescript
- ✅ Encryption session created if missing
- ✅ Message decrypted correctly
- ✅ Error when session creation fails
- ✅ Error when decryption fails
```

**Risk**: Medium - Game command security

---

## 6. Message Handler Systems

### Critical Paths

#### 6.1 Lobby Message Handler (`packages/lobby/src/internal.ts`)
**Status**: ⚠️ **PARTIAL COVERAGE** (some handlers tested, not main flow)

**Critical Functions:**
- `receiveLobbyData()` - Main lobby handler
- Handler lookup and routing
- Error handling

**Test Cases Needed:**
```typescript
// packages/lobby/src/internal.test.ts
- ✅ Supported message codes route to correct handler
- ✅ Unsupported message codes return empty array (not throw)
- ✅ Handler errors are caught and logged
- ✅ Responses are queued correctly
- ✅ Multiple responses handled
```

**Risk**: High - Lobby functionality

**Brittleness**: Different error handling than persona/transactions (returns empty vs throws)

#### 6.2 Persona Message Handler (`packages/persona/src/receivePersonaData.ts`)
**Status**: ❌ **NO COVERAGE**

**Test Cases Needed:**
```typescript
- ✅ Supported messages route correctly
- ✅ Unsupported messages throw error (different from lobby!)
- ✅ Error handling wraps original error
- ✅ Error cause preserved
```

**Risk**: Medium - Persona functionality

**Brittleness**: Throws on unsupported vs lobby which returns empty

#### 6.3 Transaction Message Handler (`packages/transactions/src/internal.ts::processInput`)
**Status**: ❌ **NO COVERAGE**

**Test Cases Needed:**
```typescript
- ✅ Message handlers found correctly
- ✅ Handler execution
- ✅ Unsupported messages throw error
- ✅ Handler errors wrapped with context
- ✅ OldServerMessage conversion
```

**Risk**: High - Transaction processing

**Brittleness**: Different message format (ServerPacket vs BytableMessage)

#### 6.4 Chat Message Handler (`src/chat/index.ts`)
**Status**: ❌ **NO COVERAGE**

**Test Cases Needed:**
```typescript
- ✅ Message deserialization
- ✅ Handler lookup by messageId
- ✅ Error handling for deserialization failure
- ✅ Unsupported messages throw error
- ✅ Response format conversion
```

**Risk**: Medium - Chat functionality

---

## 7. Database Operations

### Critical Paths

#### 7.1 Database Service (`packages/database/src/databaseService.ts`)
**Status**: ❌ **NO COVERAGE**

**Critical Functions:**
- `findUser()` - User authentication
- `registerNewUser()` - User registration
- `updateSession()` - Session management
- `initializeDatabase()` - Database setup

**Test Cases Needed:**
```typescript
// packages/database/src/databaseService.test.ts
- ✅ User found with correct credentials
- ✅ User not found error
- ✅ Invalid password error
- ✅ User registration succeeds
- ✅ User registration handles duplicate username
- ✅ Session updated correctly
- ✅ Database initialization creates tables
- ✅ Database initialization creates indexes
- ✅ Database initialization creates default users
- ✅ SQLite WAL mode enabled
- ✅ Error handling for database operations
- ✅ Singleton pattern enforced
```

**Risk**: Critical - Authentication and data persistence

**Brittleness**: Multiple database systems (SQLite, PostgreSQL, Sequelize)

#### 7.2 Database Manager (`packages/database/src/DatabaseManager.ts`)
**Status**: ❌ **NO COVERAGE**

**Test Cases Needed:**
```typescript
- ✅ Session key lookup by customerId
- ✅ Connection ID mapping
- ✅ Database connection initialization
- ✅ Error when DATABASE_URL undefined
- ✅ Sequelize singleton pattern
```

**Risk**: High - Session management

#### 7.3 Database Functions (`packages/database/src/functions/`)
**Status**: ⚠️ **PARTIAL COVERAGE** (tunables tested)

**Critical Functions:**
- `purchaseCar()` - Car purchase transaction
- `getPlayer()` - Player data retrieval
- `saveVehicle()` - Vehicle persistence
- Various query functions

**Test Cases Needed:**
```typescript
// For each database function:
- ✅ Successful operation
- ✅ Database query errors handled
- ✅ Transaction rollback on failure
- ✅ Input validation
- ✅ Return value format
- ✅ Error logging
```

**Risk**: High - Data integrity

**Brittleness**: Mix of Slonik, Sequelize, and raw SQLite queries

---

## 8. Error Handling Patterns

### Critical Observations

The codebase has **inconsistent error handling patterns**:

1. **Lobby**: Returns empty array on unsupported message
2. **Persona**: Throws error on unsupported message  
3. **Transactions**: Throws error on unsupported message
4. **Chat**: Throws error on unsupported message

**Test Cases Needed:**
```typescript
// Error handling consistency tests
- ✅ Verify error handling patterns are intentional
- ✅ Document when to return empty vs throw
- ✅ Test error propagation through layers
- ✅ Test error logging formats
```

**Risk**: Medium - Inconsistent behavior makes debugging harder

---

## 9. State Management

### Critical Paths

#### 9.1 State Database (`packages/shared/src/State.ts`)
**Status**: ❌ **NO COVERAGE**

**Critical Functions:**
- `fetchStateFromDatabase()` - State retrieval
- `addSession()` - Session management
- `addEncryption()` - Encryption state
- `getEncryption()` - Encryption lookup
- `save()` - State persistence

**Test Cases Needed:**
```typescript
- ✅ State retrieved correctly
- ✅ Sessions added and retrieved
- ✅ Encryption added and retrieved
- ✅ State persisted to database
- ✅ Concurrent access handling
- ✅ Error handling for state operations
```

**Risk**: High - Core state management

---

## 10. Integration Points

### Critical Paths

#### 10.1 Message Queue System
**Status**: ✅ **HAS TESTS** (`packages/shared/src/MessageQueue.test.ts`)

#### 10.2 Socket Queue System
**Status**: ❌ **NO COVERAGE**

**Test Cases Needed:**
```typescript
- ✅ Messages queued correctly
- ✅ Messages dequeued in order
- ✅ Queue cleanup on disconnect
- ✅ Error handling for queue operations
```

**Risk**: Medium - Message delivery

---

## Priority Matrix

### P0 - Critical (Security & Core Functionality)
1. Server initialization (`src/nps_server.ts`, `src/mcots_server.ts`)
2. Connection handling (`packages/gateway/src/index.ts`)
3. Message routing (`packages/gateway/src/npsPortRouter.ts`)
4. Authentication (`packages/login/src/login.ts`)
5. Encryption/Decryption (`packages/transactions/src/internal.ts`)
6. Database operations (`packages/database/src/databaseService.ts`)

### P1 - High (Important Functionality)
1. Gateway server (`packages/gateway/src/GatewayServer.ts`)
2. MCOTS router (`packages/gateway/src/mcotsPortRouter.ts`)
3. Client connect (`packages/transactions/src/clientConnect.ts`)
4. Lobby handlers (`packages/lobby/src/internal.ts`)
5. Transaction handlers (`packages/transactions/src/internal.ts`)
6. State management (`packages/shared/src/State.ts`)

### P2 - Medium (Feature Completeness)
1. Persona handlers (`packages/persona/src/receivePersonaData.ts`)
2. Chat handlers (`src/chat/index.ts`)
3. UDP handling (`packages/gateway/src/index.ts::onUdpMessage`)
4. Database functions (`packages/database/src/functions/`)
5. Error handling consistency

---

## Testing Strategy Recommendations

### 1. Start with Entry Points
- Test server startup/shutdown first
- Ensures basic functionality works

### 2. Mock External Dependencies
- Database connections
- Network sockets
- File system operations
- Environment variables

### 3. Test Error Paths
- Database failures
- Network errors
- Invalid input
- Missing configuration

### 4. Integration Tests
- Full authentication flow
- Message routing end-to-end
- Encryption/decryption round-trip

### 5. Property-Based Testing
- Message serialization/deserialization
- Encryption/decryption symmetry
- Packet splitting/joining

---

## Brittleness Mitigation

### Patterns to Standardize

1. **Error Handling**: Choose one pattern (throw vs return empty) per message type
2. **Database Access**: Standardize on one database library pattern
3. **Message Routing**: Extract common routing logic
4. **Configuration**: Centralize all hardcoded values
5. **Logging**: Ensure all error paths log consistently

### Refactoring Opportunities

1. Extract port routing logic to shared utility
2. Create unified message handler interface
3. Standardize error response formats
4. Create configuration service
5. Extract common encryption patterns

---

## Coverage Goals

### Phase 1 (Critical Paths)
- **Target**: 80% coverage on P0 items
- **Timeline**: Immediate priority
- **Impact**: Prevents production failures

### Phase 2 (Important Functionality)
- **Target**: 70% coverage on P1 items
- **Timeline**: Next sprint
- **Impact**: Improves reliability

### Phase 3 (Feature Completeness)
- **Target**: 60% coverage on P2 items
- **Timeline**: Ongoing
- **Impact**: Better maintainability

---

## Notes

- **Existing Tests**: Good coverage for serialization, utilities, and some message types
- **Missing Tests**: Critical paths for server operation, routing, and security
- **Brittleness**: Multiple patterns for similar operations increase risk
- **Focus Areas**: Entry points, routing, authentication, encryption, database operations

---

## Quick Reference: Test File Locations

```
src/
  nps_server.test.ts                    ❌ MISSING
  mcots_server.test.ts                  ❌ MISSING

packages/gateway/src/
  GatewayServer.test.ts                 ❌ MISSING
  index.test.ts                         ❌ MISSING
  npsPortRouter.test.ts                 ❌ MISSING
  mcotsPortRouter.test.ts               ❌ MISSING

packages/login/src/
  login.test.ts                         ❌ MISSING
  handleLoginData.test.ts               ❌ MISSING

packages/transactions/src/
  clientConnect.test.ts                  ❌ MISSING
  internal.test.ts                      ❌ MISSING

packages/database/src/
  databaseService.test.ts               ❌ MISSING
  DatabaseManager.test.ts               ❌ MISSING

packages/lobby/src/
  internal.test.ts                      ⚠️  PARTIAL

packages/persona/src/
  receivePersonaData.test.ts            ❌ MISSING

src/chat/
  index.test.ts                         ❌ MISSING
```
