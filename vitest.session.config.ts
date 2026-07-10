import { defineConfig, coverageConfigDefaults, configDefaults } from "vitest/config";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { existsSync } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get project root and .env path
const projectRoot = resolve(__dirname, ".");
const envPath = resolve(projectRoot, ".env");

// Only include --env-file if .env exists (for CI compatibility)
const execArgv = ["--openssl-legacy-provider"];
if (existsSync(envPath)) {
	execArgv.push(`--env-file=${envPath}`);
}

export default defineConfig({
    resolve: {
        alias: {
            "rusty-motors-protocol": resolve(projectRoot, "packages/protocol"),
            "@rustymotors/binary": resolve(projectRoot, "libs/@rustymotors/binary"),
        },
    },
    test: {
        server: {
            deps: {
                inline: ["rusty-motors-protocol", "@rustymotors/binary"],
            },
        },
        setupFiles: ["./packages/gateway/vitest.setup.ts"],
        globals: true,
        environment: "node",
        poolOptions: {
            forks: {
                // Only include --env-file if .env exists (for CI compatibility)
                execArgv,
            }
        },
        coverage: {
            enabled: false, // Disabled by default, can be enabled via --coverage flag
            all: true,
            exclude: [
                "src/**/*.spec.ts",
                "src/**/*.test.ts",
                "bin/**/*.ts",
                "interfaces",
                "vite.config.ts",
                "commitlint.config.js",
                "packages/pklib-ts",
                "**/coverage/**",
                ...coverageConfigDefaults.exclude,
            ],
            reporter: ["lcov", "text-summary"],
        },
        // Include all tests, including session tests
        exclude: [
            "packages/pklib-ts",
            ...configDefaults.exclude
            // Note: session tests are NOT excluded here
        ],
        reporters: ["junit", "dot", "hanging-process"],
		outputFile: "mcos.junit.xml",
		pool: "forks",
    },
});
