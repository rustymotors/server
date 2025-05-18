# Configuration System for Rusty Motors Server

This project uses the [`config`](https://www.npmjs.com/package/config) and [`dotenv`](https://www.npmjs.com/package/dotenv) packages for secure, flexible, and environment-based configuration management.

## How It Works

- **Config Directory:** All configuration files are located in the root-level `config/` directory.
- **Default Values:** The main configuration is in `config/default.json`.
- **Environment Variables:** You can override any config value using environment variables, as mapped in `config/custom-environment-variables.json`.
- **.env Support:** You can also use a `.env` file in the project root to set environment variables for local development.
- **Environment-Specific Config:** You can add files like `config/production.json` or `config/development.json` for environment-specific overrides.

## How to Use

1. **Edit `config/default.json`** to set project-wide defaults (see example below).
2. **Override with environment variables** (e.g., in your shell, CI/CD, or `.env` file):
    - Example: `export CERTIFICATE_FILE=/path/to/cert.pem`
3. **(Optional) Add a `.env` file** in the project root for local development:
    ```env
    CERTIFICATE_FILE=./data/mcouniverse.crt
    PRIVATE_KEY_FILE=./data/private_key.pem
    PUBLIC_KEY_FILE=./data/pub.key
    EXTERNAL_HOST=localhost
    MCO_LOG_LEVEL=debug
    ```
4. **(Optional) Add `production.json`, `test.json`, etc.** for environment-specific config.

## Example: `config/default.json`

```json
{
    "host": "localhost",
    "logLevel": "debug",
    "certificateFile": "./data/mcouniverse.crt",
    "privateKeyFile": "./data/private_key.pem",
    "publicKeyFile": "./data/pub.key"
}
```

## Example: `config/custom-environment-variables.json`

```json
{
    "host": "EXTERNAL_HOST",
    "logLevel": "MCO_LOG_LEVEL",
    "certificateFile": "CERTIFICATE_FILE",
    "privateKeyFile": "PRIVATE_KEY_FILE",
    "publicKeyFile": "PUBLIC_KEY_FILE"
}
```

## How the Code Loads Config

The code uses the `config` package to load settings. For example:

```typescript
import config from 'config';
const host = config.get<string>('host');
```

Or, using the provided helper:

```typescript
import { getServerConfiguration } from 'rusty-motors-shared';
const config = getServerConfiguration();
console.log(config.host);
```

## Best Practices

- **Never commit secrets** (like private keys) directly to config files. Use environment variables or a secure secrets manager.
- **Document any required config values** for new developers.
- **Check the config/ directory** for all available options and mappings.

## Further Reading

- [node-config documentation](https://github.com/node-config/node-config/wiki/Configuration-Files)
- [dotenv documentation](https://github.com/motdotla/dotenv)

---

For questions, see the project README or ask in the project chat.
