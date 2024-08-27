import { defineConfig, coverageConfigDefaults } from "vitest/config";

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
				"vite.config.ts",
				...coverageConfigDefaults.exclude
			],
			reporter: ["lcov", "text", "cobertura"],
		},
	},
});
