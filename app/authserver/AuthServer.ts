// detroit is a game server, written from scratch, for an old game
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

import "./instrument.cjs";

import * as Sentry from "@sentry/node";

import {
	getServerLogger,
} from "rusty-motors-shared";
import { authDB } from "./db.ts";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { handleAuthLogin } from "./handleAuthLogin.ts";
import { AuthServerConfig, getConfig } from "./config.ts";
import { handleShardList } from "./handleShardList.ts";

const APP_NAME = "auth-server";
const coreLogger = getServerLogger(APP_NAME);

async function main() {
	coreLogger.info("Starting Auth Server...");
	try {
		if (!authDB.isDatabaseConnected) {
			coreLogger.fatal("Database connection failed. Exiting.");
			process.exit(1);
		}
	} catch (err) {
		coreLogger.fatal(`Error in core server: ${String(err)}`);
		process.exitCode = 1;
		return;
	}

	try {
		const authServer = new AuthServer(getConfig(), coreLogger);

		authServer.start();

	} catch (err) {
		Sentry.captureException(err);
		coreLogger.fatal(`Error in core server: ${String(err)}`);
		process.exitCode = 1;
		return;
	}

}

class AuthServer {

	constructor(private config: AuthServerConfig, private log: ReturnType<typeof getServerLogger>) {
		this.log = log.child({ name: "auth-server" });
		this.config = config;
	}

	handleRequest(req: IncomingMessage, res: ServerResponse) {
		if (!req.url || !req.method) {
			res.writeHead(400, { 'Content-Type': 'text/plain' });
			res.end('Bad Request\n');
			return;
		}

		// Handle incoming requests here
		this.log.info(`Received request: ${req.method} ${new URL(req.url, `http://${req.headers.host}`).pathname}`);

		if (req.url.startsWith("/AuthLogin")) {
			// Handle AuthLogin request
			handleAuthLogin.call(this, req, res);
		} else if (req.url === "/ShardList/") {
			// Handle ShardList request
			this.log.info("Handling ShardList request");
			// Implement shard list retrieval logic here
			handleShardList.call(this, req, res);
		}
		else {
			res.writeHead(404, { 'Content-Type': 'text/plain' });
			res.end('Not Found\n');
			return;
		}
	}
	
	public start() {
		this.log.info("AuthServer started successfully.");
		// Initialize server components here (e.g., HTTP server, routes, etc.)
		const server = createServer((this.handleRequest).bind(this));
		
		const port = parseInt(this.config["port"] || "3000", 10);
		server.listen(port, '0.0.0.0', () => {
			this.log.info(`AuthServer listening on port ${port}`);
		});
		
		process.on('SIGINT', () => {
			this.log.info('Received SIGINT. Shutting down gracefully...');
			server.close(() => {
				this.stop();
				process.exit(0);
			});
		});
		
		process.on('SIGTERM', () => {
			this.log.info('Received SIGTERM. Shutting down gracefully...');
			server.close(() => {
				this.stop();
				process.exit(0);
			});
		});
	}
	public stop() {
		this.log.info("AuthServer stopped successfully.");
		// Clean up resources here
	}
	
}

main().catch((err) => {
	const coreLogger = getServerLogger("core");
	coreLogger.fatal(`Unhandled exception in core server: ${String(err)}`);
	Sentry.captureException(err);
	Sentry.flush(2000).finally(() => {
		process.exit(1);
	});
});

