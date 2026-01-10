# Environment Variable Setup for Tests

## Solution

Updated to use **Node's built-in `.env` file support** (Node 20.6+) instead of the `dotenv` package, matching your production setup.

## Files Updated

1. **`vitest.config.ts`** - Configures vitest to:
   - Use Node's `--env-file` flag via `execArgv`
   - Enable `--openssl-legacy-provider` for legacy crypto support
   - Load `.env` from project root automatically

2. **`vitest.setup.ts`** - Optional setup for Sentry initialization

## How It Works

When you run `npm test`, vitest:
1. Passes `--openssl-legacy-provider` to Node (for legacy crypto)
2. Passes `--env-file=/data/Code/server/.env` to Node (loads .env automatically)
3. Node loads all environment variables from `.env` into `process.env`
4. Your tests can access all environment variables

## Required Environment Variables

Your `.env` file at `/data/Code/server/.env` should include:

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost/dbname

# Certificates (paths relative to project root or absolute)
CERTIFICATE_FILE=data/mcouniverse.pem
PRIVATE_KEY_FILE=data/private_key.pem
PUBLIC_KEY_FILE=data/pub.key

# Optional
EXTERNAL_HOST=localhost
MCO_LOG_LEVEL=debug
SENTRY_DSN=...  # Optional, for Sentry integration
```

## Verification

Run a test to verify:

```bash
cd packages/gateway
npm test
```

The `.env` file should be automatically loaded by Node, and legacy crypto support should be enabled.

## Troubleshooting

### "Could not load .env file"

- Check that `.env` exists at `/data/Code/server/.env`
- Check file permissions
- Verify Node version is 20.6+ (for `--env-file` support)

### "Legacy ciphers not available"

- The `--openssl-legacy-provider` flag should be automatically passed
- Check that your Node version supports this flag

### "Missing required environment variable"

- Check your `.env` file has all required variables
- See `packages/shared/src/Configuration.ts` for required variables

## Alternative: Set Variables Directly

If `.env` file isn't working, set variables directly:

```bash
DATABASE_URL=... CERTIFICATE_FILE=... npm test
```

## Notes

- Uses Node's built-in `.env` support (no `dotenv` package needed)
- Matches your production setup (`--env-file=.env`)
- Legacy crypto support enabled automatically
- Works with Node 20.6+ (when `--env-file` was introduced)
