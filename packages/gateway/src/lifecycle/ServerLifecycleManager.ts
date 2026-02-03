import type { ServerLogger } from "rusty-motors-shared";

/**
 * Represents the possible states of a server lifecycle
 */
export enum ServerStatus {
	STOPPED = "stopped",
	STARTING = "starting",
	RUNNING = "running",
	STOPPING = "stopping",
	RESTARTING = "restarting",
}

/**
 * Interface for managing server lifecycle state
 */
export interface LifecycleManager {
	/**
	 * Gets the current server status
	 * @returns The current ServerStatus
	 */
	getStatus(): ServerStatus;

	/**
	 * Sets the server status
	 * @param status - The new status to set
	 */
	setStatus(status: ServerStatus): void;

	/**
	 * Checks if the server is currently running
	 * @returns true if status is RUNNING, false otherwise
	 */
	isRunning(): boolean;

	/**
	 * Checks if the server can be started
	 * @returns true if status is STOPPED, false otherwise
	 */
	canStart(): boolean;

	/**
	 * Checks if the server can be stopped
	 * @returns true if status is RUNNING, false otherwise
	 */
	canStop(): boolean;
}

/**
 * Manages the lifecycle state of a server
 *
 * This class provides type-safe status management with clear state transitions
 * and validation methods for server operations.
 */
export class ServerLifecycleManager implements LifecycleManager {
	private status: ServerStatus = ServerStatus.STOPPED;
	private readonly log: ServerLogger;

	/**
	 * Creates a new ServerLifecycleManager instance
	 * @param log - Logger instance for status change logging
	 */
	constructor(log: ServerLogger) {
		this.log = log;
	}

	/**
	 * Gets the current server status
	 * @returns The current ServerStatus
	 */
	getStatus(): ServerStatus {
		return this.status;
	}

	/**
	 * Sets the server status and logs the transition
	 * @param status - The new status to set
	 */
	setStatus(status: ServerStatus): void {
		const previousStatus = this.status;
		this.status = status;
		this.log.debug(
			`Status changed: ${previousStatus} -> ${status}`,
		);
	}

	/**
	 * Checks if the server is currently running
	 * @returns true if status is RUNNING, false otherwise
	 */
	isRunning(): boolean {
		return this.status === ServerStatus.RUNNING;
	}

	/**
	 * Checks if the server can be started
	 * Only returns true when status is STOPPED
	 * @returns true if status is STOPPED, false otherwise
	 */
	canStart(): boolean {
		return this.status === ServerStatus.STOPPED;
	}

	/**
	 * Checks if the server can be stopped
	 * Only returns true when status is RUNNING
	 * @returns true if status is RUNNING, false otherwise
	 */
	canStop(): boolean {
		return this.status === ServerStatus.RUNNING;
	}
}
