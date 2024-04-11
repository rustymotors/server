import { sentryEsbuildPlugin } from "@sentry/esbuild-plugin";
import fs from "node:fs";
import esbuild from "esbuild";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const nativeNodeModulesPlugin = {
    name: "native-node-modules",
    setup(build) {
        // If a ".node" file is imported within a module in the "file" namespace, resolve
        // it to an absolute path and put it into the "node-file" virtual namespace.
        build.onResolve({ filter: /\.node$/, namespace: "file" }, (args) => ({
            path: require.resolve(args.path, { paths: [args.resolveDir] }),
            namespace: "node-file",
        }));

        // Files in the "node-file" virtual namespace call "require()" on the
        // path from esbuild of the ".node" file in the output directory.
        build.onLoad({ filter: /.*/, namespace: "node-file" }, (args) => ({
            contents: `
          import path from ${JSON.stringify(args.path)}
          try { module.exports = require(path) }
          catch {}
        `,
        }));

        // If a ".node" file is imported within a module in the "node-file" namespace, put
        // it in the "file" namespace where esbuild's default loading behavior will handle
        // it. It is already an absolute path since we resolved it to one above.
        build.onResolve(
            { filter: /\.node$/, namespace: "node-file" },
            (args) => ({
                path: args.path,
                namespace: "file",
            }),
        );

        // Tell esbuild's default loading behavior to use the "file" loader for
        // these ".node" files.
        let opts = build.initialOptions;
        opts.loader = opts.loader || {};
        opts.loader[".node"] = "file";
    },
};

esbuild
    .build({
        sourcemap: "external", // Source map generation must be turned on
        platform: "node",
        outdir: "dist",
        entryPoints: ["apps/server/server.ts"],
        format: "esm",
        metafile: true,
        bundle: true,
        packages: "external",
        banner: {
            js: "import * as path from 'node:path';import { createRequire } from 'module';import { fileURLToPath } from 'node:url';const require = createRequire(import.meta.url);const __dirname = path.dirname(fileURLToPath(import.meta.url));",
        },
        plugins: [
            nativeNodeModulesPlugin,
            // Put the Sentry esbuild plugin after all other plugins
            sentryEsbuildPlugin({
                authToken: process.env.SENTRY_AUTH_TOKEN,
                org: "drazisilcom",
                project: "rusty-motors-server",
            }),
        ],
    })
    .then((result) => {
        fs.writeFileSync("meta.json", JSON.stringify(result.metafile));
    })
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
