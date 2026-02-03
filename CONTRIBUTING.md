# Contributing to MCOS

Thank you for your interest in contributing to MCOS (Motor City Online Server)! This document provides guidelines for contributing to the project.

## Development Setup

### Prerequisites

- Node.js 20+ with npm
- PostgreSQL 14+
- Docker (optional, for development services)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/rustymotors/mcos.git
cd mcos

# Install dependencies
make install

# Start development services (PostgreSQL, etc.)
make up

# Run database migrations
make migration-up

# Start the server
make start
```

For detailed setup instructions, see [CLAUDE.md](CLAUDE.md).

## Code Style

### Formatting and Linting

This project uses [Biome](https://biomejs.dev/) for linting and formatting:

```bash
# Format all files
npm run format:all

# Lint all files
npm run lint:all

# Type check all packages
npm run check:all
```

### TypeScript Guidelines

- Use strict TypeScript compilation
- ES modules (`import`/`export`, not `require`)
- Explicit types for function parameters and return values
- Prefer interfaces over type aliases for object shapes

### Code Organization

- Each package has its own `tsconfig.json` extending `tsconfig.base.json`
- Use project references for cross-package dependencies
- Keep files focused on a single responsibility

## Project Structure

```
mcos/
├── packages/           # Service packages
│   ├── gateway/        # Main server orchestration
│   ├── lobby/          # Lobby management (port 7003)
│   ├── login/          # Authentication (port 8226)
│   ├── persona/        # Character profiles (port 8228)
│   ├── shared/         # Common utilities
│   └── transactions/   # MCOTS protocol (port 43300)
├── libs/               # Library packages
│   └── @rustymotors/
│       ├── binary/     # Serialization
│       ├── protocol/   # Protocol definitions
│       └── parser/     # Message parsing
├── docs/               # Documentation
│   ├── protocol/       # Protocol documentation
│   └── handlers/       # Handler guides
└── migrations/         # Database migrations
```

## Adding Features

### Adding a New Message Handler

See the detailed guide: [docs/handlers/ADDING_HANDLERS.md](docs/handlers/ADDING_HANDLERS.md)

Quick steps:
1. Create handler function in appropriate service package
2. Define packet structure with `setSerializeOrder()`
3. Implement handler logic
4. Register in service registry

### Working with Serialization

See: [docs/protocol/PACKET_SERIALIZATION.md](docs/protocol/PACKET_SERIALIZATION.md)

Key classes:
- `BytableMessage` - Main message class
- `BytableFieldTypes` - Available field types
- `MessageHandlerRegistry` - Handler registration

### Database Changes

1. Create migration in `migrations/` directory
2. Run `npm run migrate` to apply
3. Update types with `npm run types`

## Testing

### Running Tests

```bash
# Run all tests with coverage
npm run coverage

# Run tests without coverage
npm test

# Run session replay tests
npm run test:session

# Run package-specific tests
npm run test:packages
```

### Writing Tests

- Use [Vitest](https://vitest.dev/) for testing
- Place tests in `__tests__/` directories or `*.test.ts` files
- Mock external dependencies using `vi.mock()`
- Use `createTestContext()` for handler testing

### Session Recording

Record live traffic for replay testing:

```bash
RECORD_SESSIONS=true npm start
```

Sessions are saved to `test/fixtures/sessions/`.

## Pull Request Process

### Before Submitting

1. Ensure all tests pass: `npm test`
2. Ensure type checking passes: `npm run check:all`
3. Ensure linting passes: `npm run lint:all`
4. Format code: `npm run format:all`

### PR Guidelines

- Create a feature branch from `dev`
- Write clear commit messages
- Include tests for new functionality
- Update documentation as needed
- Keep PRs focused on a single change

### Commit Messages

Use clear, descriptive commit messages:

```
Add PT_OPEN_COMM_CHANNEL handler for lobby service

- Implement channel grant response
- Add user joined notification
- Register handler in lobby registry
```

## Architecture Principles

This project follows **SOLID principles**:

- **Single Responsibility**: Each class/module has one purpose
- **Open/Closed**: Use registries for extensibility
- **Liskov Substitution**: Handlers implement consistent interfaces
- **Interface Segregation**: Focused interfaces (ISessionStore, etc.)
- **Dependency Inversion**: Inject abstractions via DatabaseProvider

## Getting Help

- Check existing documentation in `docs/`
- Review [CLAUDE.md](CLAUDE.md) for project overview
- Open an issue for questions or bugs
- Join discussions in pull requests

## License

By contributing, you agree that your contributions will be licensed under the GNU AGPL v3 license.
