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

import * as Sentry from "@sentry/node";
import { Gateway } from "rusty-motors-gateway";
import {
    getServerLogger,
    verifyLegacyCipherSupport,
    getServerConfiguration,
    databaseProvider,
} from "rusty-motors-shared";
import { createDatabaseServices } from "rusty-motors-database";

function main() {
    const coreLogger = getServerLogger("mcots/core");

    try {
        verifyLegacyCipherSupport();

        // Initialize database services from environment (12-factor app pattern)
        const databaseUrl = process.env['DATABASE_URL'];
        const sqlitePath = process.env['SQLITE_PATH'] ?? 'data/lotus.db';

        if (!databaseUrl) {
            coreLogger.error('DATABASE_URL environment variable is required');
            process.exit(1);
        }

        // Create and register injectable database services
        const dbServices = createDatabaseServices({
            postgresUrl: databaseUrl,
            sqlitePath,
            logger: coreLogger,
        });
        databaseProvider.register(dbServices);

        // Verify connection
        if (!dbServices.auth.isDatabaseConnected) {
            coreLogger.error("Database connection failed. Exiting.");
            process.exit(1);
        }

        coreLogger.info('Database services initialized');
    } catch (err) {
        coreLogger.error(`Error in core server: ${String(err)}`);
        process.exitCode = 1;
        return;
    }

    try {
        const config = getServerConfiguration();
        const sanitizedConfig = {
            ...config,
            certificateFile: "[REDACTED]",
            privateKeyFile: "[REDACTED]",
            publicKeyFile: "[REDACTED]",
        };
        coreLogger.debug(
            `Pre-flight checks passed. Starting server with config: ${JSON.stringify(sanitizedConfig)}`,
        );

        const listeningPortList = [
            43200, 43300, 43400,
            53303,
        ];

        const gatewayServer = new Gateway({
            config,
            tcpListeningPortList: listeningPortList,
        });

        gatewayServer.start();
    } catch (err) {
        Sentry.captureException(err);
        coreLogger.error(`Error in core server: ${String(err)}`);
        process.exitCode = 1;
        return;
    }
}

main();
