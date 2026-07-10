// This file is run before tests to set up the environment.
// Node's built-in --env-file support is configured in vitest.config.ts
// via execArgv, so .env is automatically loaded by Node itself. The
// fallback loader below covers cases where that path didn't fire.

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

// CRITICAL: Set test environment flags FIRST, before loading .env.
// This ensures the test environment is detected even if .env has
// RECORD_SESSIONS=true or a verbose log level.
process.env.NODE_ENV = "test";
process.env.VITEST = "true";
process.env.RECORD_SESSIONS = "false";
// Suppress logger output during tests by setting log level to 'error'.
process.env.MCO_LOG_LEVEL = "error";
process.env.LOG_LEVEL = "error";

// Warn about potential live database usage. Only block if STRICT_DB_CHECK
// is set to "true".
if (!process.env.TEST_DATABASE_URL && process.env.DATABASE_URL) {
	const originalDbUrl = process.env.DATABASE_URL;
	const isTestDb =
		originalDbUrl.includes("test") ||
		originalDbUrl.includes("_test") ||
		(originalDbUrl.includes("localhost") && originalDbUrl.includes("5432"));

	if (!isTestDb) {
		console.warn(
			"⚠️  WARNING: DATABASE_URL may point to a non-test database!",
		);
		console.warn(
			`   Database: ${originalDbUrl.replace(/:[^:@]+@/, ":****@")}`,
		);
		console.warn(
			"   Consider using TEST_DATABASE_URL or a database with 'test' in the name",
		);

		if (process.env.STRICT_DB_CHECK === "true") {
			console.warn(
				"   STRICT_DB_CHECK=true: Unsetting DATABASE_URL to prevent accidental writes",
			);
			delete process.env.DATABASE_URL;
		}
	}
}

// Fallback: manually load .env if not already loaded by Node's --env-file.
if (!process.env.DATABASE_URL && !process.env.TEST_DATABASE_URL) {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);

	const projectRoot = __dirname;
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
					const cleanValue = value.replace(/^["']|["']$/g, "");
					if (key === "DATABASE_URL") {
						const isTestDb =
							cleanValue.includes("test") ||
							cleanValue.includes("_test") ||
							(cleanValue.includes("localhost") &&
								cleanValue.includes("5432"));
						if (!isTestDb && process.env.STRICT_DB_CHECK === "true") {
							console.warn(
								`⚠️  Skipping DATABASE_URL from .env (not a test database, STRICT_DB_CHECK=true)`,
							);
							continue;
						}
					}
					if (
						!process.env[key] ||
						(key !== "RECORD_SESSIONS" &&
							key !== "NODE_ENV" &&
							key !== "VITEST")
					) {
						process.env[key] = cleanValue;
					}
				}
			}
		}
	} else {
		// In CI, .env may not exist - provide test defaults.
		if (process.env.CI || !process.env.DATABASE_URL) {
			console.log("ℹ️  .env file not found - using test defaults for CI");

			if (!process.env.CERTIFICATE_FILE) {
				process.env.CERTIFICATE_FILE = "data/mcouniverse.pem";
			}
			if (!process.env.PRIVATE_KEY_FILE) {
				process.env.PRIVATE_KEY_FILE = "data/private_key.pem";
			}
			if (!process.env.PUBLIC_KEY_FILE) {
				process.env.PUBLIC_KEY_FILE = "data/pub.key";
			}
		} else {
			console.warn(`Warning: .env file not found at ${envPath}`);
			console.warn("Tests may fail if environment variables are required.");
		}
	}
}

// Final override: ensure session recording stays disabled for tests.
process.env.RECORD_SESSIONS = "false";

// Final fallback: alias TEST_DATABASE_URL to DATABASE_URL if needed.
if (process.env.TEST_DATABASE_URL && !process.env.DATABASE_URL) {
	process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
	console.log("✅ Using TEST_DATABASE_URL for tests");
}
