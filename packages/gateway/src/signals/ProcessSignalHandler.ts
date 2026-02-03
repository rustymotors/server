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

import type { ServerLogger } from "rusty-motors-shared";

/**
 * Interface for objects that can handle shutdown
 */
export interface ShutdownHandler {
	shutdown(): Promise<void>;
}

/**
 * Interface for process signal handling
 */
export interface ISignalHandler {
	registerShutdownHandler(handler: ShutdownHandler): void;
	unregisterShutdownHandler(): void;
}

/**
 * Handles process signals (SIGINT, exit) for graceful shutdown
 *
 * This class is decoupled from ConsoleThread and only handles process signals.
 * ConsoleThread handles keyboard input separately and emits events that Gateway
 * can listen to independently.
 *
 * Note: This handler only responds to process signals, not keyboard input events.
 */
export class ProcessSignalHandler implements ISignalHandler {
	private shutdownHandler: ShutdownHandler | null = null;
	private readonly log: ServerLogger;
	private sigintListener: (() => void) | null = null;
	private exitListener: ((code: number) => void) | null = null;

	constructor(log: ServerLogger) {
		this.log = log;
	}

	/**
	 * Registers a shutdown handler for process signals
	 *
	 * If a handler is already registered, it will be unregistered first.
	 *
	 * @param handler - The shutdown handler to call when SIGINT is received
	 */
	registerShutdownHandler(handler: ShutdownHandler): void {
		// Unregister existing handler if present
		if (this.shutdownHandler !== null) {
			this.unregisterShutdownHandler();
		}

		this.shutdownHandler = handler;

		// Create SIGINT listener
		this.sigintListener = async () => {
			this.log.info("Received SIGINT, initiating graceful shutdown");
			try {
				await handler.shutdown();
				process.exit(0);
			} catch (error) {
				this.log.error(
					`Error during shutdown: ${error instanceof Error ? error.message : String(error)}`,
				);
				process.exit(1);
			}
		};

		// Create exit listener for cleanup/logging
		this.exitListener = (code: number) => {
			this.log.debug(`Process exiting with code ${code}`);
		};

		// Register listeners
		process.on("SIGINT", this.sigintListener);
		process.on("exit", this.exitListener);
	}

	/**
	 * Unregisters the shutdown handler and removes signal listeners
	 */
	unregisterShutdownHandler(): void {
		if (this.sigintListener) {
			process.removeListener("SIGINT", this.sigintListener);
			this.sigintListener = null;
		}

		if (this.exitListener) {
			process.removeListener("exit", this.exitListener);
			this.exitListener = null;
		}

		this.shutdownHandler = null;
	}
}
