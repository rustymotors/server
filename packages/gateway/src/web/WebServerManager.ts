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

import http from "node:http";
import type { ServerLogger } from "rusty-motors-shared";

/**
 * Interface for web server management
 */
export interface IWebServerManager {
	start(port: number): Promise<void>;
	stop(): Promise<void>;
	isRunning(): boolean;
	getServer(): http.Server;
}

/**
 * Manages the HTTP web server lifecycle
 *
 * Note: This manager creates and manages the HTTP server, but the actual
 * TCP connection handling is done by NetworkServerManager. The web server
 * receives connections via `server.emit('connection', socket)` to support
 * both HTTP and raw packet handling on the same port.
 */
export class WebServerManager implements IWebServerManager {
	private server: http.Server | null = null;
	private readonly log: ServerLogger;
	private readonly requestHandler: http.RequestListener;
	private isServerReady: boolean = false;

	constructor(log: ServerLogger, requestHandler: http.RequestListener) {
		this.log = log;
		this.requestHandler = requestHandler;
		// Create the HTTP server immediately
		this.server = http.createServer(this.requestHandler);

		// Set up error handling
		this.server.on("error", (error: Error) => {
			this.log.error(`Web server error: ${error.message}`);
		});
	}

	/**
	 * Marks the web server as ready to receive connections
	 *
	 * Note: The actual TCP listening is handled by NetworkServerManager.
	 * This method just marks the server as ready. The server receives
	 * connections via `server.emit('connection', socket)` from the TCP server.
	 *
	 * @param port - The port number (for logging purposes)
	 */
	async start(port: number): Promise<void> {
		if (this.isServerReady) {
			throw new Error("Web server already running");
		}

		this.isServerReady = true;
		this.log.info(`Web server ready to receive connections on port ${port}`);
	}

	/**
	 * Stops the web server and closes all connections
	 *
	 * @returns A promise that resolves when the server is stopped
	 */
	async stop(): Promise<void> {
		if (!this.isServerReady || this.server === null) {
			return;
		}

		return new Promise((resolve) => {
			this.server!.close(() => {
				this.isServerReady = false;
				this.log.info("Web server stopped");
				resolve();
			});
		});
	}

	/**
	 * Checks if the web server is running
	 *
	 * @returns true if the server is ready to receive connections
	 */
	isRunning(): boolean {
		return this.isServerReady && this.server !== null;
	}

	/**
	 * Gets the HTTP server instance
	 *
	 * This is used by NetworkServerManager to emit connection events
	 * to the HTTP server. The server is always available after construction.
	 *
	 * @returns The HTTP server instance
	 */
	getServer(): http.Server {
		// Server is always created in constructor, so this should never be null
		return this.server!;
	}
}
