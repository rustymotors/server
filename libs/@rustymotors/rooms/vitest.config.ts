import { defineConfig } from "vitest/config";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    test: {
        setupFiles: [resolve(__dirname, "../../../vitest.setup.mjs")],
        globals: true,
        environment: "node",
    },
});
