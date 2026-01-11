import { defineConfig } from "vitest/config";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { existsSync } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get project root (two levels up from packages/gateway)
const projectRoot = resolve(__dirname, "../..");
const envPath = resolve(projectRoot, ".env");

// Only include --env-file if .env exists (for CI compatibility)
const execArgv = ["--openssl-legacy-provider"];
if (existsSync(envPath)) {
	execArgv.push(`--env-file=${envPath}`);
}

export default defineConfig({
	test: {
		setupFiles: ["./vitest.setup.ts"],
		globals: true,
		environment: "node",
		// Exclude session replay tests from default test run
		exclude: [
			"**/node_modules/**",
			"**/dist/**",
			"**/cypress/**",
			"**/.{idea,git,cache,output,temp}/**",
			"**/session/sessionReplay.test.ts",
			"**/session/integration.example.test.ts",
			"**/session/SessionRecorder.test.ts",
		],
		// Enable Node's built-in .env file support and legacy crypto
		poolOptions: {
			forks: {
				// Use Node's built-in --env-file support (Node 20.6+)
				// Only include if .env file exists (for CI compatibility)
				execArgv,
			},
		},
		server: {
			deps: {
				inline: ["rusty-motors-protocol", "@rustymotors/binary"],
			},
		},
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
			"rusty-motors-protocol": resolve(projectRoot, "packages/protocol"),
			"@rustymotors/binary": resolve(projectRoot, "libs/@rustymotors/binary"),
		},
	},
});
