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
				"ecosystem.config.js",
				"migrate.ts",
				"packages/**/*.d.ts",
			],
			reporter: ["lcov", "text", "cobertura"],
		},
		reporters: ["junit", "default", "hanging-process"],
		outputFile: "mcos.junit.xml",
		pool: "forks",
	},
});
