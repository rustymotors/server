import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        coverage: {
            all: true,
            reporter: ["cobertura", "html", "text", "lcov"]
        },
    },
});
