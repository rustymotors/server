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
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { getServerLogger } from "rusty-shared";
import { verifyLegacyCipherSupport } from "rusty-shared";
import { getServerConfiguration } from "rusty-shared";
import { getGatewayServer } from "rusty-gateway";
import process from "process";
import console from "console";

const coreLogger = getServerLogger({
    level: "info",
});
try {
    verifyLegacyCipherSupport();
}
catch (err) {
    coreLogger.fatal(`Error in core server: ${String(err)}`);
    throw err;
}
Sentry.init({
    dsn: "https://f4c0126e2fc35876c860dd72fc056db9@o1413557.ingest.sentry.io/4506787875061760",
    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0, // Profiling sample rate is relative to tracesSampleRate
    integrations: [nodeProfilingIntegration()],
});
try {
    if (typeof process.env["EXTERNAL_HOST"] === "undefined") {
        console.error("Please set EXTERNAL_HOST");
        process.exit(1);
    }
    if (typeof process.env["CERTIFICATE_FILE"] === "undefined") {
        console.error("Please set CERTIFICATE_FILE");
        process.exit(1);
    }
    if (typeof process.env["PRIVATE_KEY_FILE"] === "undefined") {
        console.error("Please set PRIVATE_KEY_FILE");
        process.exit(1);
    }
    if (typeof process.env["PUBLIC_KEY_FILE"] === "undefined") {
        console.error("Please set PUBLIC_KEY_FILE");
        process.exit(1);
    }
    const config = getServerConfiguration({
        host: process.env["EXTERNAL_HOST"],
        certificateFile: process.env["CERTIFICATE_FILE"],
        privateKeyFile: process.env["PRIVATE_KEY_FILE"],
        publicKeyFile: process.env["PUBLIC_KEY_FILE"],
    });
    const appLog = getServerLogger();
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
    await gatewayServer.start();
}
catch (err) {
    Sentry.captureException(err);
    coreLogger.fatal(`Error in core server: ${String(err)}`);
    throw err;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLCtEQUErRDtBQUMvRCwyQ0FBMkM7QUFDM0MsRUFBRTtBQUNGLHVFQUF1RTtBQUN2RSwyRUFBMkU7QUFDM0UsdUVBQXVFO0FBQ3ZFLHNDQUFzQztBQUN0QyxFQUFFO0FBQ0Ysa0VBQWtFO0FBQ2xFLGlFQUFpRTtBQUNqRSxnRUFBZ0U7QUFDaEUsc0RBQXNEO0FBQ3RELEVBQUU7QUFDRiwyRUFBMkU7QUFDM0UseUVBQXlFO0FBRXpFLE9BQU8sTUFBTSxNQUFNLGNBQWMsQ0FBQztBQUNsQyxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNsRSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQy9DLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUN6RCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDdEQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRWpELE1BQU0sVUFBVSxHQUFHLGVBQWUsQ0FBQztJQUMvQixLQUFLLEVBQUUsTUFBTTtDQUNoQixDQUFDLENBQUM7QUFFSCxJQUFJLENBQUM7SUFDRCx5QkFBeUIsRUFBRSxDQUFDO0FBQ2hDLENBQUM7QUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ1gsVUFBVSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN6RCxNQUFNLEdBQUcsQ0FBQztBQUNkLENBQUM7QUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ1IsR0FBRyxFQUFFLHFGQUFxRjtJQUUxRiwwRUFBMEU7SUFDMUUsb0JBQW9CO0lBQ3BCLGdCQUFnQixFQUFFLEdBQUc7SUFDckIsa0JBQWtCLEVBQUUsR0FBRyxFQUFFLHdEQUF3RDtJQUNq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