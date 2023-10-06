import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      all: true,
      exclude: ["src/**/*.spec.ts", "src/**/*.test.ts", "bin/**/*.ts"],
      reporter: ["lcov", "text", "cobertura"],
    },
  },
});
