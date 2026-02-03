// This file is run before tests to set up the environment
// Node's built-in --env-file support is configured in vitest.config.ts
// via execArgv, so .env is automatically loaded by Node itself.
// However, if running from root, we need a fallback.

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

// CRITICAL: Set test environment flags FIRST, before loading .env
// This ensures test environment is detected even if .env has RECORD_SESSIONS=true
process.env.NODE_ENV = "test";
process.env.VITEST = "true";
process.env.RECORD_SESSIONS = "false";
// Suppress all logger output during tests by setting log level to 'error' (only errors will show)
// This prevents verbose/info/debug logs from other packages (database, lobby, login, etc.)
process.env.MCO_LOG_LEVEL = "error";
process.env.LOG_LEVEL = "error";

// CRITICAL: Warn about potential live database usage
// Only block if STRICT_DB_CHECK is set to "true"
if (!process.env.TEST_DATABASE_URL && process.env.DATABASE_URL) {
	const originalDbUrl = process.env.DATABASE_URL;
	// Check if it looks like a production/live database (not a test database)
	const isTestDb = originalDbUrl.includes("test") || 
	                 originalDbUrl.includes("_test") ||
	                 (originalDbUrl.includes("localhost") && originalDbUrl.includes("5432"));
	
	if (!isTestDb) {
		console.warn("⚠️  WARNING: DATABASE_URL may point to a non-test database!");
		console.warn(`   Database: ${originalDbUrl.replace(/:[^:@]+@/, ":****@")}`);
		console.warn("   Consider using TEST_DATABASE_URL or a database with 'test' in the name");
		
		// Only block if explicitly requested
		if (process.env.STRICT_DB_CHECK === "true") {
			console.warn("   STRICT_DB_CHECK=true: Unsetting DATABASE_URL to prevent accidental writes");
			delete process.env.DATABASE_URL;
		}
	}
}

// Fallback: Manually load .env if not already loaded by Node's --env-file
if (!process.env.DATABASE_URL && !process.env.TEST_DATABASE_URL) {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);
	
	// Try project root (two levels up from packages/gateway)
	const projectRoot = resolve(__dirname, "../..");
	const envPath = resolve(projectRoot, ".env");
	
	if (existsSync(envPath)) {
		console.log(`Loading .env from ${envPath} (fallback)`);
		const envContent = readFileSync(envPath, "utf-8");
		const lines = envContent.split("\n");
		
		for (const line of lines) {
			const trimmed = line.trim();
			if (trimmed && !trimmed.startsWith("#")) {
				const [key, ...valueParts] = trimmed.split("=");
				if (key) {
					const value = valueParts.join("=").trim();
					// Remove quotes if present
					const cleanValue = value.replace(/^["']|["']$/g, "");
					// IMPORTANT: Don't override test environment variables
					// Warn about DATABASE_URL from .env if it doesn't look like a test database
					if (key === "DATABASE_URL") {
						const isTestDb = cleanValue.includes("test") || 
						               cleanValue.includes("_test") ||
						               (cleanValue.includes("localhost") && cleanValue.includes("5432"));
						if (!isTestDb && process.env.STRICT_DB_CHECK === "true") {
							console.warn(`⚠️  Skipping DATABASE_URL from .env (not a test database, STRICT_DB_CHECK=true)`);
							continue;
						}
					}
					if (!process.env[key] || (key !== "RECORD_SESSIONS" && key !== "NODE_ENV" && key !== "VITEST")) {
						process.env[key] = cleanValue;
					}
				}
			}
		}
	} else {
		// In CI, .env file may not exist - provide test defaults
		if (process.env.CI || !process.env.DATABASE_URL) {
			console.log("ℹ️  .env file not found - using test defaults for CI");
			
			// Provide defaults for required test environment variables
			// These are safe defaults that won't cause tests to fail
			if (!process.env.CERTIFICATE_FILE) {
				process.env.CERTIFICATE_FILE = "data/mcouniverse.pem";
			}
			if (!process.env.PRIVATE_KEY_FILE) {
				process.env.PRIVATE_KEY_FILE = "data/private_key.pem";
			}
			if (!process.env.PUBLIC_KEY_FILE) {
				process.env.PUBLIC_KEY_FILE = "data/pub.key";
			}
			// DATABASE_URL is optional for most tests (only needed for integration tests)
			// If required, CI should set it via environment variables
		} else {
			console.warn(`Warning: .env file not found at ${envPath}`);
			console.warn("Tests may fail if environment variables are required.");
		}
	}
}

// Import instrument.mjs for Sentry initialization (if needed)
// Note: This is optional and may not be needed for all tests
(async () => {
	try {
		// Only import if SENTRY_DSN is set to avoid errors in tests
		if (process.env.SENTRY_DSN) {
			await import("../../instrument.mjs");
		}
	} catch (error) {
		// Silently ignore if instrument.mjs can't be loaded
		// This is fine for tests that don't need Sentry
	}
})();

// Ensure session recording is DISABLED during tests (final override)
// Tests should only READ session files, never create/modify them
process.env.RECORD_SESSIONS = "false";

// Final check: If TEST_DATABASE_URL is set, use it as DATABASE_URL
if (process.env.TEST_DATABASE_URL && !process.env.DATABASE_URL) {
	process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
	console.log("✅ Using TEST_DATABASE_URL for tests");
}
