# Gateway Refactoring Guidelines

This document outlines the principles and practices to follow when refactoring the Gateway codebase.

## Test-Driven Development (TDD)

### Process
1. **Write tests first** - Before implementing any new component or feature
2. **Make tests fail** - Verify tests fail for the right reasons
3. **Write minimal code** - Implement just enough to make tests pass
4. **Refactor** - Improve code while keeping tests green
5. **Repeat** - Continue the cycle

### Test Coverage Requirements
- **Unit tests** for all extracted components
- **Integration tests** for component interactions
- **Edge cases** - Error handling, boundary conditions
- **Backward compatibility** - Ensure existing functionality works

### Test Structure
```typescript
describe("ComponentName", () => {
    let component: ComponentName;
    let mockDependencies: MockDependencies;

    beforeEach(() => {
        // Setup
    });

    afterEach(async () => {
        // Cleanup
    });

    describe("Feature Group", () => {
        it("should do something specific", async () => {
            // Arrange
            // Act
            // Assert
        });
    });
});
```

## SOLID Principles

### Single Responsibility Principle (SRP)
- **One class, one reason to change**
- Each class should have a single, well-defined responsibility
- If a class does multiple things, extract components

**Example**: 
- ❌ Bad: `Gateway` handles lifecycle, networking, routing, web server, signals
- ✅ Good: `Gateway` orchestrates `LifecycleManager`, `NetworkManager`, `RouterRegistry`, etc.

### Open/Closed Principle (OCP)
- **Open for extension, closed for modification**
- Add new features by extending, not modifying existing code
- Use interfaces and dependency injection

**Example**:
```typescript
interface NetworkServerManager {
    startTcpServer(port: number, handler: Handler): Promise<Server>;
}

// Can extend without modifying base class
class CustomNetworkManager implements NetworkServerManager {
    // Custom implementation
}
```

### Liskov Substitution Principle (LSP)
- **Subtypes must be substitutable for their base types**
- Derived classes must not break base class contracts
- Interface implementations must honor the contract

### Interface Segregation Principle (ISP)
- **Clients shouldn't depend on interfaces they don't use**
- Create focused, specific interfaces
- Avoid "god interfaces" with many methods

**Example**:
```typescript
// ❌ Bad: One large interface
interface ServerManager {
    startTcp(): void;
    startUdp(): void;
    startWeb(): void;
    startDatabase(): void;
}

// ✅ Good: Focused interfaces
interface NetworkServerManager {
    startTcp(): void;
    startUdp(): void;
}
```

### Dependency Inversion Principle (DIP)
- **Depend on abstractions, not concretions**
- High-level modules shouldn't depend on low-level modules
- Both should depend on abstractions (interfaces)

**Example**:
```typescript
// ❌ Bad: Direct dependency
class Gateway {
    private networkManager = new NetworkServerManager();
}

// ✅ Good: Dependency injection
class Gateway {
    constructor(
        private networkManager: INetworkServerManager
    ) {}
}
```

## Clean Code Principles

### Naming
- **Descriptive names** - Code should read like prose
- **Avoid abbreviations** - `mgr` → `manager`
- **Consistent conventions** - Follow project patterns
- **Searchable names** - Avoid magic numbers/strings

### Functions
- **Small** - Do one thing, do it well
- **Single level of abstraction** - Don't mix high and low level
- **No side effects** - Functions should do what their name says
- **Few parameters** - Prefer objects for 3+ parameters

### Classes
- **Small** - Single responsibility
- **Cohesion** - Methods should use class variables
- **Encapsulation** - Hide implementation details
- **Dependency injection** - Don't create dependencies internally

### Comments
- **Explain why, not what** - Code should be self-documenting
- **Avoid redundant comments** - Don't repeat what code says
- **Document complex logic** - Explain non-obvious decisions
- **Keep comments up to date** - Outdated comments are worse than none

### Error Handling
- **Use exceptions for exceptional cases** - Not for control flow
- **Provide context** - Include relevant information in errors
- **Don't ignore errors** - Handle or propagate, never swallow
- **Fail fast** - Detect errors early

### Formatting
- **Consistent style** - Use project formatter (Biome)
- **Vertical formatting** - Group related concepts
- **Horizontal formatting** - Reasonable line length
- **Team standards** - Follow established conventions

## Refactoring Checklist

### Before Starting
- [ ] Understand current implementation
- [ ] Identify responsibilities to extract
- [ ] Review refactoring plan document
- [ ] Check for existing tests

### During Refactoring
- [ ] Write tests first (TDD)
- [ ] Create interface/type definitions
- [ ] Implement component following SOLID
- [ ] Update Gateway to use new component
- [ ] Ensure backward compatibility
- [ ] Update tests to use new component
- [ ] Run all tests

### After Refactoring
- [ ] All tests pass
- [ ] No linter errors
- [ ] Code review checklist
- [ ] Update documentation
- [ ] Create migration document
- [ ] Verify with real client (if applicable)

## Component Extraction Pattern

### 1. Create Interface
```typescript
export interface IComponentName {
    method1(): Promise<void>;
    method2(): ReturnType;
}
```

### 2. Create Implementation
```typescript
export class ComponentName implements IComponentName {
    constructor(
        private readonly log: ServerLogger,
        private readonly dependency: DependencyType
    ) {}

    async method1(): Promise<void> {
        // Implementation
    }
}
```

### 3. Create Tests
```typescript
describe("ComponentName", () => {
    let component: ComponentName;
    let mockLogger: ServerLogger;

    beforeEach(() => {
        mockLogger = createMockLogger();
        component = new ComponentName(mockLogger, mockDependency);
    });

    // Tests...
});
```

### 4. Update Gateway
```typescript
export class Gateway {
    private readonly component: IComponentName;

    constructor(options: GatewayOptions) {
        this.component = new ComponentName(this.log, dependency);
    }
}
```

## Testing Best Practices

### Test Organization
- **One test file per component**
- **Group related tests** with `describe` blocks
- **Clear test names** - Describe what is being tested
- **Arrange-Act-Assert** pattern

### Test Quality
- **Fast** - Tests should run quickly
- **Independent** - Tests shouldn't depend on each other
- **Repeatable** - Same results every time
- **Self-validating** - Clear pass/fail
- **Timely** - Written before implementation

### Mocking
- **Mock external dependencies** - Database, network, file system
- **Don't mock the class under test**
- **Use interfaces** for easy mocking
- **Verify interactions** when needed

### Coverage
- **Aim for high coverage** - But quality over quantity
- **Test edge cases** - Boundary conditions, errors
- **Test happy path** - Normal operation
- **Test error paths** - Failure scenarios

## Code Smells to Avoid

### Long Methods
- Extract smaller methods
- Use descriptive names
- Single level of abstraction

### Large Classes
- Extract responsibilities
- Use composition over inheritance
- Follow SRP

### Duplicate Code
- Extract common functionality
- Use helper functions/utilities
- DRY (Don't Repeat Yourself)

### Magic Numbers/Strings
- Use named constants
- Configuration objects
- Enums for status values

### Feature Envy
- Methods that use another object's data more than their own
- Move method to appropriate class

### Data Clumps
- Groups of data that travel together
- Extract to objects/classes

## Migration Strategy

### Phase 1: Extract (Non-Breaking)
1. Create new component alongside existing code
2. Write comprehensive tests
3. Implement component
4. Keep old code for backward compatibility

### Phase 2: Integrate
1. Update Gateway to use new component
2. Run all tests
3. Verify functionality
4. Update documentation

### Phase 3: Cleanup
1. Remove old code
2. Remove unused fields
3. Update all references
4. Final test run

## Documentation Requirements

### For Each Extracted Component
1. **Migration document** - What changed, why, how to use
2. **Interface documentation** - JSDoc comments
3. **Usage examples** - How to use the component
4. **Test documentation** - What is tested, how to run

## Configuration Best Practices

### Principles

1. **Separation of Concerns**
   - Shared configuration (database, logging, certificates) → `Configuration` in shared package
   - Gateway-specific configuration (ports, routing) → `GatewayConfiguration`
   - Service-specific configuration → Service packages

2. **Configuration Provider Pattern**
   - Use `ConfigurationProvider` for cross-package access
   - Services access configuration via provider, not direct imports
   - Falls back gracefully if provider not registered
   - No tight coupling between packages

3. **Configuration Hierarchy**
   ```
   GatewayConfiguration (Gateway-specific)
   ├── Wraps: Configuration (Shared server config)
   ├── Adds: Port configuration, routing config
   └── Registers with: ConfigurationProvider
   ```

4. **Access Patterns**
   - **Within Gateway**: Use `GatewayConfiguration` directly
   - **From Services**: Use `configurationProvider.getSharedConfiguration()`
   - **For Gateway-specific values**: Use `configurationProvider.getGatewayConfigurationProvider()`

5. **Configuration Sources**
   - **Defaults**: Sensible defaults for all configuration values
   - **Constructor options**: Allow override via constructor parameters
   - **Environment variables**: Consider for future externalization
   - **Config files**: Consider for future externalization

6. **Type Safety**
   - Use TypeScript interfaces for configuration contracts
   - Validate configuration at construction time
   - Provide clear error messages for invalid configuration

7. **Immutability**
   - Configuration should be immutable after construction
   - Use `readonly` properties where possible
   - Prevent runtime modification

8. **Documentation**
   - Document all configuration options
   - Explain defaults and their rationale
   - Provide examples of valid configuration

### Example Pattern

```typescript
// Gateway-specific configuration
export class GatewayConfiguration implements IGatewayConfiguration {
    private readonly sharedConfig: Configuration;
    private readonly tcpPorts: number[];
    private readonly loginServerPort: number;

    constructor(options: GatewayConfigOptions) {
        // Validate and set values
        this.sharedConfig = options.sharedConfig;
        this.tcpPorts = options.tcpPorts ?? [];
        this.loginServerPort = options.loginServerPort ?? 8226;

        // Register with provider for service access
        configurationProvider.register(this);
    }

    getSharedConfig(): Configuration {
        return this.sharedConfig;
    }

    getLoginServerPort(): number {
        return this.loginServerPort;
    }
}

// Service usage
import { configurationProvider } from "rusty-motors-shared";

const config = configurationProvider.getSharedConfiguration();
// Use config...
```

## Architecture Vision: Volatility-Based Composition Taxonomy

### End Goal

The ultimate architectural goal is to organize components using a **volatility-based composition taxonomy**. This means grouping components based on how frequently they change, ensuring that:

1. **Stable components** (rarely change) are separated from **volatile components** (frequently change)
2. **Components that change together** are grouped together
3. **Dependencies flow from volatile to stable** (stable components don't depend on volatile ones)
4. **Changes are isolated** to minimize impact across the system

### Volatility Categories

#### High Volatility (Change Frequently)
- **Business Logic**: Game rules, transaction processing, lobby handlers
- **Protocol Handlers**: Message parsing, packet routing
- **Service Implementations**: Login, lobby, transaction services
- **Configuration Values**: Ports, timeouts, feature flags

#### Medium Volatility (Change Occasionally)
- **Infrastructure Components**: Network managers, server managers
- **Integration Points**: Database adapters, external API clients
- **Gateway Orchestration**: Component coordination, lifecycle management

#### Low Volatility (Rarely Change)
- **Core Abstractions**: Interfaces, base classes, type definitions
- **Shared Utilities**: Logging, serialization, error handling
- **Configuration Structure**: Configuration interfaces, provider patterns

### Benefits

1. **Reduced Change Impact**: Changes to volatile components don't affect stable ones
2. **Easier Testing**: Stable components can be tested independently
3. **Better Maintainability**: Clear boundaries between change frequencies
4. **Scalability**: Easy to add new volatile components without affecting stable infrastructure

### Current Progress Toward Taxonomy

#### Extracted Components (Moving Toward Taxonomy)

**Stable (Low Volatility)**:
- `PortRouterRegistry` - Port routing abstraction (rarely changes)
- `GatewayConfiguration` - Configuration structure (rarely changes)
- `ConfigurationProvider` - Provider pattern (rarely changes)

**Medium Volatility**:
- `NetworkServerManager` - Infrastructure (changes with networking needs)
- `WebServerManager` - Infrastructure (changes with web server needs)
- `ServerLifecycleManager` - Orchestration (changes with lifecycle needs)
- `ProcessSignalHandler` - Infrastructure (changes with signal handling needs)

**Volatile (High Volatility)**:
- Service handlers (login, lobby, transaction) - Business logic
- Port routers (npsPortRouter, mcotsPortRouter) - Protocol handling
- Message processors - Business logic

### Future Refactoring Toward Taxonomy

1. **Identify Volatility**: Analyze change frequency of each component
2. **Group by Volatility**: Organize components into volatility categories
3. **Establish Boundaries**: Create clear interfaces between volatility levels
4. **Enforce Dependency Rules**: Ensure dependencies flow from volatile to stable
5. **Isolate Changes**: Design so changes in volatile components don't ripple to stable ones

### Example: Volatility-Based Organization

```
Stable Layer (Low Volatility)
├── ConfigurationProvider (interface)
├── PortRouterRegistry (interface)
└── Core Abstractions

Infrastructure Layer (Medium Volatility)
├── NetworkServerManager
├── WebServerManager
├── ServerLifecycleManager
└── ProcessSignalHandler

Business Logic Layer (High Volatility)
├── Login Service
├── Lobby Service
├── Transaction Service
└── Protocol Handlers
```

**Dependency Flow**: Business Logic → Infrastructure → Stable

This ensures that:
- Changes to business logic don't affect infrastructure
- Changes to infrastructure don't affect stable abstractions
- Stable abstractions provide a solid foundation for all layers

## 12 Factor App Principles

Where applicable, the Gateway refactoring follows the [12 Factor App](https://12factor.net/) methodology:

### Factor III: Config
- **Store config in the environment** - Configuration varies by deployment
- Environment variables for deployment-specific values
- Sensible defaults for development
- See `CONFIGURATION_BEST_PRACTICES.md` for details

### Factor VII: Port Binding
- **Export services via port binding** - Self-contained services
- Port configuration externalized
- No dependency on external web servers

### Factor IX: Disposability
- **Fast startup and graceful shutdown** - Configuration loaded at startup
- Early validation (fail fast)
- Graceful shutdown with cleanup

### Factor XI: Logs
- **Treat logs as event streams** - Structured logging
- Log levels configurable
- Logging configuration externalized

### Factor VI: Processes
- **Stateless processes** - Configuration is stateless
- No process-specific state in configuration
- State stored in backing services

### Factor X: Dev/Prod Parity
- **Keep environments similar** - Same configuration structure
- Only values differ between environments
- Environment variables for differences

See `CONFIGURATION_BEST_PRACTICES.md` for detailed 12 Factor App implementation guidelines.

## Volatility Analysis

See `VOLATILITY_ANALYSIS.md` for a detailed analysis of component volatility in the Gateway package. This analysis identifies:

- **High Volatility Components**: Business logic, protocol handlers (npsPortRouter, mcotsPortRouter, web.ts)
- **Medium Volatility Components**: Infrastructure (NetworkServerManager, WebServerManager, etc.)
- **Low Volatility Components**: Abstractions (PortRouterRegistry, GatewayConfiguration, interfaces)

The analysis provides a roadmap for further refactoring to achieve the volatility-based composition taxonomy.

## References

- **SOLID Principles**: Robert C. Martin (Uncle Bob)
- **Clean Code**: Robert C. Martin
- **Refactoring**: Martin Fowler
- **Test-Driven Development**: Kent Beck
- **Volatility-Based Design**: Component design based on change frequency
- **12 Factor App**: https://12factor.net/
