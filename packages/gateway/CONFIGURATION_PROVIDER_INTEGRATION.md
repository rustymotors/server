# ConfigurationProvider Integration

## Overview

The `ConfigurationProvider` allows services (login, lobby, transaction) to access GatewayConfiguration without creating tight coupling between packages. Services can access both shared server configuration and Gateway-specific configuration values.

## Architecture

```
Gateway
  └── GatewayConfiguration (registers with provider)
       └── ConfigurationProvider (in shared package)
            └── Services (login, lobby, transaction, nps)
                 └── Access via configurationProvider.getSharedConfiguration()
```

## Implementation

### ConfigurationProvider (in shared package)

Located at: `packages/shared/src/ConfigurationProvider.ts`

- **Singleton pattern**: Single global instance
- **GatewayConfigurationProvider interface**: Defines what services can access
- **Fallback**: Falls back to `getServerConfiguration()` if provider not registered
- **Non-breaking**: Services can use it without breaking changes

### GatewayConfiguration Registration

GatewayConfiguration automatically registers itself when constructed:

```typescript
constructor(options: GatewayConfigOptions) {
    // ... initialization ...
    
    // Register with global provider so services can access it
    configurationProvider.register(this);
}
```

### Service Usage

Services can now access configuration via the provider:

```typescript
import { configurationProvider } from "rusty-motors-shared";

// Get shared Configuration (uses GatewayConfiguration if available)
const config = configurationProvider.getSharedConfiguration();

// Use config as before
const privateKey = loadPrivateKey(config.privateKeyFile);
```

## Updated Services

### Login Service
- **File**: `packages/login/src/login.ts`
- **Change**: Uses `configurationProvider.getSharedConfiguration()` instead of `getServerConfiguration()`
- **Benefit**: Gets configuration from GatewayConfiguration if available

### NPS Game Login
- **File**: `packages/nps/gameMessageProcessors/processGameLogin.ts`
- **Change**: Uses `configurationProvider.getSharedConfiguration()` instead of `getServerConfiguration()`
- **Benefit**: Gets configuration from GatewayConfiguration if available

### Protocol Handler
- **File**: `libs/@rustymotors/protocol/src/serverLoginMessageHandler.ts`
- **Change**: Uses `configurationProvider.getSharedConfiguration()` instead of `getServerConfiguration()`
- **Benefit**: Gets configuration from GatewayConfiguration if available

## Benefits

1. **No Tight Coupling**: Services don't depend on Gateway package
2. **Backward Compatible**: Falls back to `getServerConfiguration()` if provider not registered
3. **Single Source of Truth**: GatewayConfiguration is the source when available
4. **Easy to Test**: Can register mock providers for testing
5. **Future Extensible**: Services can access Gateway-specific config if needed

## Accessing Gateway-Specific Configuration

If services need Gateway-specific values (ports, etc.), they can:

```typescript
import { configurationProvider } from "rusty-motors-shared";

const provider = configurationProvider.getGatewayConfigurationProvider();
if (provider) {
    const loginPort = provider.getLoginServerPort();
    const lobbyPort = provider.getLobbyServerPort();
    // etc.
}
```

## Future Enhancements

Services that need Gateway-specific configuration can:
1. Check if provider is registered
2. Access Gateway-specific values via `getGatewayConfigurationProvider()`
3. Fall back to defaults if not available

This allows services to use Gateway configuration values when available, while maintaining backward compatibility.
