# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCOS (Motor City Online Server) is a from-scratch implementation of a legacy game server for a defunct online racing game. This is a Node.js/TypeScript monorepo using npm workspaces that recreates the entire server infrastructure including authentication, lobby, persona management, and game protocol handling.

## Commands

### Development
```bash
# Install dependencies and run database migrations
npm run setup

# Start the server (development mode)
npm start

# Type checking (all packages)
npm run check:all

# Linting (all packages)
npm run lint:all

# Format code (all packages)
npm run format:all
```

### Testing
```bash
# Run all tests (unit + session)
npm run test:all

# Run unit tests only
npm test

# Run session tests specifically
npm run test:session

# Run tests with coverage
npm run coverage

# Run package-specific tests
npm run test:packages

# Clean session fixtures
npm run clean:sessions
```

### Building
```bash
# Build TypeScript
npm run build
```

### Database
```bash
# Generate database types from PostgreSQL schema
npm run types

# Run database migrations
npm run migrate
```

### Docker
```bash
# Start services (PostgreSQL, SSL gateway, etc.)
npm run docker:up

# Stop services
npm run docker:down
```

### SSL Certificates
```bash
# Generate development SSL certificates (RSA-1024 for XP compatibility)
npm run certs
```

## Architecture

### High-Level Structure

The server uses a **port-based routing architecture** where different game services listen on different TCP/UDP ports:

- **8226**: Login service (authentication, session management)
- **7003**: Lobby service (game lobby, user lists)
- **8228**: Persona service (character profiles, persona data)
- **8227**: Chat service (messaging)
- **9000-9020**: Room services (game rooms, races)
- **43300**: MCOTS service (legacy transaction protocol)
- **3000**: Web server (Fastify HTTP API for diagnostics)

### Request Flow

```
Client connects to port (e.g., 7003)
  ↓
Gateway creates TaggedSocket (UUID tracking)
  ↓
getPortRouter(port) retrieves appropriate handler
  ↓
npsPortRouter() or mcotsPortRouter() processes connection
  ↓
MessageQueue handles async packet processing
  ↓
Packet validation → Parsing → Handler routing
  ↓
Handler processes and returns responses
  ↓
Responses serialized and sent via MessageQueue
```

### Key Components

**Entry Point**: `src/nps_server.ts`
- Initializes database connection
- Creates Gateway instance with all port configurations
- Starts TCP/UDP servers and web server

**Gateway** (`packages/gateway/src/GatewayServer.ts`)
- Manages server lifecycle
- Handles graceful shutdown
- Coordinates network servers

**Port Routers** (`packages/gateway/src/npsPortRouter.ts`)
- Create receive/send MessageQueues for each connection
- Route packets to appropriate service handlers
- Manage socket lifecycle and error handling

**Message Queue System** (`packages/shared/MessageQueue.ts`)
- Async processing with configurable tick intervals (typically 10ms)
- Sequential ordering within each queue
- Non-blocking architecture prevents I/O bottlenecks

**Protocol Layer** (`libs/@rustymotors/protocol`)
- Binary packet serialization/deserialization
- GamePacket abstraction
- BytableMessage format handling
- Message validation (valid IDs: 0x100-0x1301, invalid: 0x902-0x1000)

**Database Layer** (`packages/database`)
- **SQLite** (better-sqlite3): Local session cache, login credentials (bcrypt hashed)
- **PostgreSQL** (Sentry/Sequelize): Persistent game data (vehicles, parts, brands, players)
- Demo user: `admin/admin`

### Package Organization

The codebase is organized into two distinct categories:

- **libs/@rustymotors/**: Low-volatility technical infrastructure (binary, network, parser, protocol, rooms)
- **packages/**: Higher-volatility domain services (gateway, authentication, lobby, transactions, etc.)

See [Package Structure Guide](docs/architecture/PACKAGE_STRUCTURE.md) for detailed documentation on the libs/ vs packages/ distinction.

**Service Packages**:
- `packages/authentication`: User authentication on port 8226
- `packages/lobby`: Lobby management on port 7003
- `packages/gateway`: Main server orchestration
- `packages/shared`: Config, logging, message queues, utilities
- `packages/database`: Database connections, migrations, and schema

**Library Packages**:
- `libs/@rustymotors/protocol`: Protocol definitions
- `libs/@rustymotors/network`: Network utilities
- `libs/@rustymotors/parser`: Message parsing
- `libs/@rustymotors/binary`: Binary data handling
- `libs/@rustymotors/rooms`: Room/race management

### TypeScript Configuration

This is a **composite TypeScript project** with project references. Each package has its own `tsconfig.json` that extends the root `tsconfig.base.json`. Use `tsc --build` for efficient incremental compilation across packages.

### Protocol Details

**Message Format**:
- First 2 bytes = Message ID
- Header format varies by protocol (NPS vs MCOTS)
- Packet separator: `0x1101`
- Encrypted messages use custom cipher (requires OpenSSL legacy provider)

**Common Message IDs**:
- `0x0230`: NPS_OK_TO_LOGIN
- `0x0100`: User login
- `0x0106`: Open comm channel (PT_OPEN_COMM_CHANNEL)
- `0x0217`: Tracking ping
- `0x1101`: Encrypted commands

**TOMC Protocol**: Used for lobby/persona communication with sequence numbers and encryption flags

## Development Notes

### Running the Server

1. Copy `.env.example` to `.env` and configure:
   - `EXTERNAL_HOST`: Server hostname/IP
   - `DATABASE_URL`: PostgreSQL connection string
   - `CERTIFICATE_FILE`, `PRIVATE_KEY_FILE`, `PUBLIC_KEY_FILE`: SSL cert paths
   - `MCO_LOG_LEVEL`: Logging verbosity (debug, verbose, info, warn, error)

2. Generate certificates: `npm run certs` (development only, RSA-1024 for Windows XP compatibility)

3. Start database services: `npm run docker:up`

4. Run migrations: `npm run migrate`

5. Start server: `npm start` (requires `--openssl-legacy-provider` flag for legacy ciphers)

### OpenSSL Legacy Provider

The server requires Node.js to be started with `--openssl-legacy-provider` to support legacy encryption used by the original game client. This is handled automatically in the npm scripts.

### Session Recording

Set `RECORD_SESSIONS=true` environment variable to record all socket traffic to `test/fixtures/sessions/` for debugging and replay testing.

### Logging

The project uses multiple logging systems:
- **Roarr**: Primary structured logging
- **Pino**: Fastify web server logging
- **Sentry**: Error tracking and monitoring (configured via `SENTRY_DSN`)

### Testing Strategy

Tests use Vitest with two configurations:
- Default (`vitest.config.ts` - not present in root, uses package-level configs)
- Session tests (`vitest.session.config.ts` - includes session replay tests)

Session tests replay recorded traffic through handlers to verify protocol correctness.

### Code Style

- **Biome** for linting and formatting
- ES modules (`"type": "module"` in package.json)
- Strict TypeScript compilation

### Port Management

The server binds to many ports. Privileged ports (80, 443) are handled by the nginx Docker container, so no special permissions are needed for Node.js.

### Message Handler Pattern

When adding new protocol handlers:
1. Define handler function in appropriate service package (e.g., `packages/lobby/src/handlers/`)
2. Register handler with message ID in service's `internal.ts`
3. Handler receives `GamePacket`, returns array of response messages
4. Responses automatically queued and sent via MessageQueue

### Working with Protocol Messages

1. All messages extend `BytableMessage` from `@rustymotors/binary`
2. Implement `serialize()` and `deserialize()` methods
3. Use `Buffer` for binary data
4. Message IDs defined as constants (e.g., `NPS_USER_LOGIN = 0x0100`)

### Database Migrations

Migrations use goose format and are stored in `packages/database/migrations/`. Run with `npm run migrate` (requires environment variables via dotenvx).

## Important Constraints

- **Legacy Protocol Compatibility**: Must maintain wire-format compatibility with original game client
- **Windows XP Support**: Certificates must use RSA-1024 (weak by modern standards)
- **Port Requirements**: Many ports needed; ensure firewall allows all required ports
- **OpenSSL Legacy**: Required for legacy cipher support; server won't work without it
- **Database Dependency**: Server requires both SQLite (local) and PostgreSQL (networked) to be available

## Developer Documentation

For detailed guides on extending the server:

- [Documentation Index](docs/README.md) - Full documentation listing
- [Packet Serialization](docs/protocol/PACKET_SERIALIZATION.md) - Binary protocol and message formats
- [Adding Handlers](docs/handlers/ADDING_HANDLERS.md) - Step-by-step handler implementation guide
- [Package Structure](docs/architecture/PACKAGE_STRUCTURE.md) - libs/ vs packages/ organization
- [Architecture](docs/architecture/MASTER_DESIGN.md) - Design decisions and patterns
- [Contributing](CONTRIBUTING.md) - Contribution guidelines and code style

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **server** (7290 symbols, 17063 relationships, 300 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/server/context` | Codebase overview, check index freshness |
| `gitnexus://repo/server/clusters` | All functional areas |
| `gitnexus://repo/server/processes` | All execution flows |
| `gitnexus://repo/server/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
