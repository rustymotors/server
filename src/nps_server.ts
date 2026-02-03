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

import * as Sentry from '@sentry/node';
import { Gateway, initializeServiceRegistry } from 'rusty-motors-gateway';
import {
    getServerLogger,
    verifyLegacyCipherSupport,
    getServerConfiguration,
    ServerLogger,
    databaseProvider,
} from 'rusty-motors-shared';
import { createDatabaseServices } from 'rusty-motors-database';

function main() {
    const coreLogger = getServerLogger('npx/core');
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
            coreLogger.error('Database connection failed. Exiting.');
            process.exit(1);
        }

        coreLogger.info('Database services initialized');

        // Initialize the service registry with default services
        initializeServiceRegistry();
        coreLogger.info('Service registry initialized');
    } catch (err) {
        coreLogger.error(`Error in core server: ${String(err)}`);
        process.exitCode = 1;
        return;
    }

    try {
        const config = getServerConfiguration();
        const sanitizedConfig = {
            ...config,
            certificateFile: '[REDACTED]',
            privateKeyFile: '[REDACTED]',
            publicKeyFile: '[REDACTED]',
        };
        coreLogger.debug(
            `Pre-flight checks passed. Starting server with config: ${JSON.stringify(sanitizedConfig)}`,
        );

        const tcpListeningPortList = [
            6660, 7003, 8228, 8226, 8227, 9000, 9001, 9002, 9003, 9004, 9005,
            9006, 9007, 9008, 9009, 9010, 9011, 9012, 9013, 9014, 9015, 9016,
            9017, 9018, 9019, 9020, 10001, 43200, 43300, 43400, 53303,
        ];

        const udpListeningPortList = [
            6660, 7003, 8228, 8226, 8227, 9000, 9001, 9002, 9003, 9004, 9005,
            9006, 9007, 9008, 9009, 9010, 9011, 9012, 9013, 9014, 9015, 9016,
            9017, 9018, 9019, 9020, 10001, 43200, 43300, 43400, 53303,
        ];

        const gatewayServer = new Gateway({
            config,
            tcpListeningPortList,
            udpListeningPortList,
        });

        coreLogger.info('Starting server');
        gatewayServer.start();
    } catch (err) {
        return captureAndLogErrorAndSetNotZeroExitCode(err, coreLogger);
    }
}

main();
function captureAndLogErrorAndSetNotZeroExitCode(err: unknown, coreLogger: ServerLogger) {
    Sentry.captureException(err);
    coreLogger.error(`Error in core server: ${String(err)}`);
    process.exitCode = 1;
    return;
}

