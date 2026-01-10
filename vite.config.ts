import { defineConfig, coverageConfigDefaults, configDefaults } from "vitest/config";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get project root and .env path
const projectRoot = resolve(__dirname, ".");
const envPath = resolve(projectRoot, ".env");

export default defineConfig({

    test: {
        poolOptions: {
            forks: {
                execArgv: [
                    "--openssl-legacy-provider",
                    `--env-file=${envPath}`,
                ],
            }
        },
        coverage: {
            enabled: true,
            all: true,
            exclude: [
                "src/**/*.spec.ts",
                "src/**/*.test.ts",
                "bin/**/*.ts",
                "interfaces",
                "vite.config.ts",
                "instrument.mjs",
                "commitlint.config.js",
                "packages/pklib-ts",
                "**/coverage/**",
                ...coverageConfigDefaults.exclude,
            ],
            reporter: ["lcov", "text-summary"],
        },
        exclude: [
            "packages/pklib-ts",
            ...configDefaults.exclude

        ],
        reporters: ["junit", "dot", "hanging-process"],
		outputFile: "mcos.junit.xml",
		pool: "forks",
    },
});
