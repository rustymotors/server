import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        coverage: {
            enabled: true,
            all: true,
            exclude: [
                "src/**/*.spec.ts",
                "src/**/*.test.ts",
                "bin/**/*.ts",
                "interfaces",
            ],
            reporter: ["lcov", "text", "cobertura"],
        },
        reporters: ["junit"],
        outputFile: "mcos.junit.xml"
    },
});
