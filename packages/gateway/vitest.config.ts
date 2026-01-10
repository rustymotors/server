import { defineConfig } from "vitest/config";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get project root (two levels up from packages/gateway)
const projectRoot = resolve(__dirname, "../..");
const envPath = resolve(projectRoot, ".env");

export default defineConfig({
	test: {
		setupFiles: ["./vitest.setup.ts"],
		globals: true,
		environment: "node",
		// Enable Node's built-in .env file support and legacy crypto
		poolOptions: {
			forks: {
				// Use Node's built-in --env-file support (Node 20.6+)
				execArgv: [
					"--openssl-legacy-provider",
					`--env-file=${envPath}`,
				],
			},
		},
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
		},
	},
});
