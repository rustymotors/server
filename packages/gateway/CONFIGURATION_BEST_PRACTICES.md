# Configuration Best Practices

This document outlines best practices for configuration management in the Gateway and related services, following SOLID principles, volatility-based composition taxonomy, and the 12 Factor App methodology.

## Principles

### 1. Separation of Concerns

Configuration should be organized by concern and volatility:

- **Shared Configuration** (`Configuration` in `rusty-motors-shared`)
  - Database settings
  - Logging configuration
  - Certificate/key paths
  - Host addresses
  - **Volatility**: Low (rarely changes)

- **Gateway-Specific Configuration** (`GatewayConfiguration`)
  - Port assignments
  - Routing configuration
  - Server lifecycle settings
  - **Volatility**: Medium (changes with deployment needs)

- **Service-Specific Configuration** (in service packages)
  - Service-specific settings
  - Business logic parameters
  - **Volatility**: High (changes with feature development)

### 2. Configuration Provider Pattern

Use the `ConfigurationProvider` pattern for cross-package access:

**Benefits**:
- No tight coupling between packages
- Services can access Gateway configuration without depending on Gateway package
- Graceful fallback if provider not registered
- Single source of truth when Gateway is running

**Usage**:
```typescript
import { configurationProvider } from "rusty-motors-shared";

// Get shared configuration (uses GatewayConfiguration if available)
const config = configurationProvider.getSharedConfiguration();

// Access Gateway-specific values if needed
const provider = configurationProvider.getGatewayConfigurationProvider();
if (provider) {
    const loginPort = provider.getLoginServerPort();
}
```

### 3. Configuration Hierarchy

```
GatewayConfiguration (Gateway-specific)
├── Wraps: Configuration (Shared server config)
│   ├── Database settings
│   ├── Logging config
│   ├── Certificate paths
│   └── Host addresses
├── Adds: Gateway-specific values
│   ├── TCP/UDP ports
│   ├── Web port
│   ├── Login server port
│   ├── Lobby server port
│   └── Diagnostic server port
└── Registers with: ConfigurationProvider
    └── Services access via provider
```

### 4. Access Patterns

#### Within Gateway Package
```typescript
// Use GatewayConfiguration directly
const config = this.gatewayConfig.getSharedConfig();
const loginPort = this.gatewayConfig.getLoginServerPort();
```

#### From Service Packages
```typescript
// Use ConfigurationProvider (no dependency on Gateway)
import { configurationProvider } from "rusty-motors-shared";

const config = configurationProvider.getSharedConfiguration();
// Use config as before
```

#### For Gateway-Specific Values
```typescript
// Optional: Access Gateway-specific configuration
const provider = configurationProvider.getGatewayConfigurationProvider();
if (provider) {
    const loginPort = provider.getLoginServerPort();
    const lobbyPort = provider.getLobbyServerPort();
}
```

### 5. Configuration Sources (Priority Order)

1. **Constructor Parameters** (Highest Priority)
   - Explicit configuration passed to constructor
   - Allows runtime configuration
   - Enables dependency injection

2. **Default Values**
   - Sensible defaults for all configuration values
   - Maintains backward compatibility
   - Documented in code and documentation

3. **Environment Variables** (Future)
   - External configuration for deployment
   - Allows configuration without code changes
   - Useful for containerized deployments

4. **Config Files** (Future)
   - Persistent configuration storage
   - Version-controlled configuration
   - Allows complex configuration structures

### 6. Type Safety

- **Use TypeScript interfaces** for configuration contracts
- **Validate at construction time** - Fail fast on invalid configuration
- **Provide clear error messages** - Help developers fix configuration issues
- **Use readonly properties** - Prevent accidental modification

Example:
```typescript
export interface GatewayConfigOptions {
    sharedConfig: Configuration;
    tcpPorts?: number[];
    udpPorts?: number[];
    webPort?: number;
    loginServerPort?: number;
    // ... other options
}

export class GatewayConfiguration {
    private readonly sharedConfig: Configuration;
    private readonly tcpPorts: number[];
    private readonly loginServerPort: number;

    constructor(options: GatewayConfigOptions) {
        // Validate
        if (!options.sharedConfig) {
            throw new Error("sharedConfig is required");
        }

        // Set with defaults
        this.sharedConfig = options.sharedConfig;
        this.tcpPorts = options.tcpPorts ?? [];
        this.loginServerPort = options.loginServerPort ?? 8226;
    }
}
```

### 7. Immutability

Configuration should be immutable after construction:

- Use `readonly` properties
- Don't provide setters
- Create new instances for configuration changes
- Prevents accidental runtime modification

### 8. Documentation

Document all configuration options:

- **JSDoc comments** on interfaces and classes
- **Default values** clearly stated
- **Rationale** for defaults explained
- **Examples** of valid configuration
- **Migration guides** when configuration changes

## Volatility-Based Organization

Configuration should be organized by volatility (how frequently it changes):

### Low Volatility (Rarely Changes)
- Configuration structure/interfaces
- Provider patterns
- Core abstractions

### Medium Volatility (Changes Occasionally)
- Port assignments
- Server settings
- Infrastructure configuration

### High Volatility (Changes Frequently)
- Feature flags
- Business logic parameters
- Service-specific settings

**Principle**: Stable configuration structure should not depend on volatile configuration values.

## Best Practices Checklist

### General Principles
- [ ] Configuration is separated by concern
- [ ] Type-safe interfaces are used
- [ ] Configuration is validated at construction
- [ ] Sensible defaults are provided
- [ ] Configuration is immutable after construction
- [ ] Documentation is complete
- [ ] Services use ConfigurationProvider pattern
- [ ] No tight coupling between packages
- [ ] Graceful fallback if provider not registered
- [ ] Configuration follows volatility-based organization

### 12 Factor App Compliance
- [ ] Configuration stored in environment variables (Factor III)
- [ ] Services export via port binding (Factor VII)
- [ ] Fast startup and graceful shutdown (Factor IX)
- [ ] Structured logging configuration (Factor XI)
- [ ] Stateless configuration (Factor VI)
- [ ] Dev/prod parity maintained (Factor X)

## Migration Path

When adding new configuration:

1. **Identify volatility** - How often will this change?
2. **Choose location** - Shared, Gateway-specific, or service-specific?
3. **Define interface** - Type-safe contract
4. **Add to constructor** - With sensible defaults
5. **Update provider** - If cross-package access needed
6. **Document** - JSDoc and migration guide
7. **Test** - Unit tests for configuration

## Examples

### Adding Gateway-Specific Configuration

```typescript
// 1. Add to interface
export interface GatewayConfigOptions {
    // ... existing options
    newFeaturePort?: number;  // New option
}

// 2. Add to class
export class GatewayConfiguration {
    private readonly newFeaturePort: number;

    constructor(options: GatewayConfigOptions) {
        // ... existing initialization
        this.newFeaturePort = options.newFeaturePort ?? 9000;  // Default
    }

    getNewFeaturePort(): number {
        return this.newFeaturePort;
    }
}

// 3. Update GatewayConfigurationProvider interface if needed
export interface GatewayConfigurationProvider {
    // ... existing methods
    getNewFeaturePort(): number;  // Add to interface
}
```

### Service Accessing Configuration

```typescript
import { configurationProvider } from "rusty-motors-shared";

// Get shared configuration
const config = configurationProvider.getSharedConfiguration();
const privateKey = loadPrivateKey(config.privateKeyFile);

// Optionally get Gateway-specific values
const provider = configurationProvider.getGatewayConfigurationProvider();
if (provider) {
    const loginPort = provider.getLoginServerPort();
    // Use loginPort...
}
```

## 12 Factor App Principles

The following 12 Factor App principles apply to configuration management:

### Factor III: Config

**Store config in the environment**

Configuration that varies between deployments (staging, production, developer environments) should be stored in environment variables, not in code.

**Current Implementation**:
- ✅ Configuration is separated from code
- ✅ Constructor parameters allow runtime configuration
- ✅ Sensible defaults provided
- ⚠️ Environment variable support planned (see Future Enhancements)

**Best Practices**:
```typescript
// ❌ Bad: Hardcoded configuration
const dbUrl = "postgresql://localhost:5432/mydb";

// ✅ Good: Environment variable with fallback
const dbUrl = process.env.DATABASE_URL ?? "postgresql://localhost:5432/mydb";

// ✅ Better: Type-safe configuration with validation
export class Configuration {
    private readonly databaseUrl: string;

    constructor() {
        this.databaseUrl = process.env.DATABASE_URL ?? 
            this.getDefaultDatabaseUrl();
        
        if (!this.isValidDatabaseUrl(this.databaseUrl)) {
            throw new Error("Invalid DATABASE_URL format");
        }
    }
}
```

**What Should Be in Environment Variables**:
- Database connection strings
- API keys and secrets
- Certificate paths
- Port numbers (when they vary by environment)
- Host addresses
- Feature flags
- Log levels

**What Should NOT Be in Environment Variables**:
- Internal constants (that don't vary by deployment)
- Business logic configuration (should be in code or database)
- Default values (can be in code as fallback)

### Factor VII: Port Binding

**Export services via port binding**

The application should be self-contained and export services via port binding, not rely on external web servers.

**Current Implementation**:
- ✅ Gateway binds to ports directly (TCP/UDP/HTTP)
- ✅ Port configuration is externalized
- ✅ Ports can be configured via constructor or environment variables

**Best Practices**:
```typescript
// ✅ Good: Port binding with configuration
export class GatewayConfiguration {
    private readonly webPort: number;

    constructor(options: GatewayConfigOptions) {
        // Environment variable takes precedence
        this.webPort = process.env.WEB_PORT 
            ? parseInt(process.env.WEB_PORT, 10)
            : options.webPort ?? 3000;
    }
}
```

### Factor IX: Disposability

**Maximize robustness with fast startup and graceful shutdown**

Configuration should support fast startup and graceful shutdown.

**Current Implementation**:
- ✅ Configuration is loaded at startup (fast)
- ✅ Graceful shutdown via ProcessSignalHandler
- ✅ Configuration is immutable (no runtime changes needed)

**Best Practices**:
- Load configuration synchronously at startup
- Validate configuration early (fail fast)
- Don't reload configuration during runtime
- Support graceful shutdown with cleanup

### Factor XI: Logs

**Treat logs as event streams**

Configuration should support structured logging and log levels.

**Current Implementation**:
- ✅ Logging configuration in shared Configuration
- ✅ Log levels configurable
- ✅ Structured logging via ServerLogger

**Best Practices**:
```typescript
// ✅ Good: Log level from environment
const logLevel = process.env.LOG_LEVEL ?? "info";

// ✅ Good: Structured logging configuration
export interface LoggingConfig {
    level: "debug" | "info" | "warn" | "error";
    format: "json" | "text";
    destination: "stdout" | "file" | "both";
}
```

### Factor VI: Processes

**Execute the app as one or more stateless processes**

Configuration should not include process-specific state.

**Current Implementation**:
- ✅ Configuration is stateless
- ✅ No process-specific configuration stored
- ✅ Configuration is immutable

**Best Practices**:
- Store state in backing services (database, cache)
- Configuration should be process-agnostic
- Multiple processes can share same configuration

### Factor X: Dev/Prod Parity

**Keep development, staging, and production as similar as possible**

Configuration should use the same structure across environments, with only values differing.

**Current Implementation**:
- ✅ Same configuration structure across environments
- ✅ Environment-specific values via environment variables
- ✅ Defaults allow development without configuration

**Best Practices**:
```typescript
// ✅ Good: Same structure, different values
// Development: DATABASE_URL=postgresql://localhost:5432/devdb
// Production: DATABASE_URL=postgresql://prod-server:5432/proddb

// ❌ Bad: Different code paths for different environments
if (process.env.NODE_ENV === "production") {
    // Different logic
}
```

### Implementation Roadmap

**Phase 1: Environment Variable Support** (Current Priority)
- [ ] Load configuration from environment variables
- [ ] Priority: Environment variables > Constructor > Defaults
- [ ] Document all environment variables
- [ ] Validate environment variable formats

**Phase 2: Configuration Validation**
- [ ] Schema validation for environment variables
- [ ] Range checking for numeric values
- [ ] Format validation for URLs, paths, etc.
- [ ] Clear error messages for invalid configuration

**Phase 3: Configuration Documentation**
- [ ] Document all environment variables
- [ ] Provide example .env files
- [ ] Document required vs optional variables
- [ ] Document default values and their rationale

**Phase 4: Configuration Monitoring**
- [ ] Log configuration on startup (sanitized)
- [ ] Track configuration changes
- [ ] Alert on invalid configuration
- [ ] Support configuration validation in tests

## Future Enhancements

1. **Environment Variable Support** (12 Factor App - Factor III)
   - Load configuration from environment variables
   - Priority order: Environment variables > Constructor > Defaults
   - Override defaults with env vars
   - Document required vs optional env vars
   - Example: `DATABASE_URL`, `LOG_LEVEL`, `WEB_PORT`, `LOGIN_PORT`

2. **Configuration Files**
   - JSON/YAML configuration files (for complex structures)
   - Validation against schema
   - Hot-reload capability (optional, for development)
   - Priority: Environment variables > Config files > Defaults

3. **Configuration Validation** (12 Factor App - Factor IX)
   - Schema validation
   - Range checking for numeric values
   - Format validation for strings (URLs, paths, etc.)
   - Fail fast on invalid configuration

4. **Configuration Monitoring** (12 Factor App - Factor XI)
   - Track configuration changes
   - Log configuration on startup (sanitized - no secrets)
   - Alert on invalid configuration
   - Support configuration validation in tests

5. **Port Binding** (12 Factor App - Factor VII)
   - All services export via port binding
   - Port configuration via environment variables
   - Self-contained services (no external web server dependency)
