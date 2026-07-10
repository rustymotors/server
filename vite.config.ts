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
        poolOptions: {
            forks: {
                // Only include --env-file if .env exists (for CI compatibility)
                execArgv,
            }
        },
        coverage: {
            enabled: true,
            all: true,
            clean: true,
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
            reporter: ["lcov", "text"],
        },
        exclude: [
            "packages/pklib-ts",
            "**/session/sessionReplay.test.ts",
            "**/session/integration.example.test.ts",
            "**/session/SessionRecorder.test.ts",
            ...configDefaults.exclude

        ],
        reporters: ["junit", "tap", "hanging-process"],
		outputFile: "mcos.junit.xml",
		pool: "forks",
    },
});
