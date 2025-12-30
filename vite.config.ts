import { defineConfig, coverageConfigDefaults, configDefaults } from "vitest/config";

export default defineConfig({

    test: {
        poolOptions: {
            forks: {
                execArgv: ["--openssl-legacy-provider"],
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
