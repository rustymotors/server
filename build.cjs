const { sentryEsbuildPlugin } = require("@sentry/esbuild-plugin");

require("esbuild").build({
    sourcemap: "external", // Source map generation must be turned on
    platform: "node",
    outfile: "dist/index.js",
    entryPoints: ["apps/main/server.ts"],
    format: "esm",
    plugins: [
        // Put the Sentry esbuild plugin after all other plugins
        sentryEsbuildPlugin({
            authToken: process.env.SENTRY_AUTH_TOKEN,
            org: "drazisilcom",
            project: "rusty-motors-server",
        }),
    ],
});
