// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017>  <Drazi Crendraven>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import Sentry from "@sentry/node";
import { getServerLogger } from "./packages/shared/log.js";
import { verifyLegacyCipherSupport } from "./packages/gateway/src/encryption.js";
import { getServerConfiguration } from "./packages/shared/Configuration.js";
import { getGatewayServer } from "./packages/gateway/src/GatewayServer.js";
import { exit } from "node:process";

const coreLogger = getServerLogger({
    module: "core",
});

try {
    verifyLegacyCipherSupport();
} catch (err) {
    coreLogger.fatal(`Error in core server: ${String(err)}`);
    exit(1);
}

Sentry.init({
    dsn: process.env.SENTRY_DSN,

    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0, // Profiling sample rate is relative to tracesSampleRate
});

try {
    if (typeof process.env.EXTERNAL_HOST === "undefined") {
        console.error("Please set EXTERNAL_HOST");
        process.exit(1);
    }
    if (typeof process.env.CERTIFICATE_FILE === "undefined") {
        console.error("Please set CERTIFICATE_FILE");
        process.exit(1);
    }
    if (typeof process.env.PRIVATE_KEY_FILE === "undefined") {
        console.error("Please set PRIVATE_KEY_FILE");
        process.exit(1);
    }
    if (typeof process.env.PUBLIC_KEY_FILE === "undefined") {
        console.error("Please set PUBLIC_KEY_FILE");
        process.exit(1);
    }
    const config = getServerConfiguration({
        host: process.env.EXTERNAL_HOST,
        certificateFile: process.env.CERTIFICATE_FILE,
        privateKeyFile: process.env.PRIVATE_KEY_FILE,
        publicKeyFile: process.env.PUBLIC_KEY_FILE,
        logLevel: process.env.LOG_LEVEL,
    });

    const appLog = getServerLogger({
        level: config.logLevel,
        module: "app",
    });

    const listeningPortList = [
        6660, 7003, 8228, 8226, 8227, 9000, 9001, 9002, 9003, 9004, 9005, 9006,
        9007, 9008, 9009, 9010, 9011, 9012, 9013, 9014, 43200, 43300, 43400,
        53303,
    ];

    const gatewayServer = getGatewayServer({
        config,
        log: appLog,
        listeningPortList,
    });

    gatewayServer.start();
} catch (err) {
    Sentry.captureException(err);
    coreLogger.fatal(`Error in core server: ${String(err)}`);
    process.exit(1);
}
