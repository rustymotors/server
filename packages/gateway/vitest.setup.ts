// This file is run before tests to set up the environment
// Node's built-in --env-file support is configured in vitest.config.ts
// via execArgv, so .env is automatically loaded by Node itself.
// However, if running from root, we need a fallback.

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

// Fallback: Manually load .env if not already loaded by Node's --env-file
if (!process.env.DATABASE_URL) {
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
					if (!process.env[key]) {
						process.env[key] = cleanValue;
					}
				}
			}
		}
	} else {
		console.warn(`Warning: .env file not found at ${envPath}`);
		console.warn("Tests may fail if environment variables are required.");
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
