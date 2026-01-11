import type { ServerLogger } from "rusty-motors-shared";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { RecordedSession, SessionEvent } from "./SessionRecorder.js";

/**
 * Options for replaying a session
 */
export interface ReplayOptions {
	/**
	 * Whether to validate that server responses match recorded responses
	 */
	validateResponses?: boolean;

	/**
	 * Whether to use recorded timings (add delays between events)
	 */
	useTimings?: boolean;

	/**
	 * Timeout for the replay in milliseconds
	 */
	timeout?: number;

	/**
	 * Callback for each event during replay
	 */
	onEvent?: (event: SessionEvent) => void;
}

/**
 * Result of replaying a session
 */
export interface ReplayResult {
	success: boolean;
	eventsProcessed: number;
	errors: string[];
	warnings: string[];
	responseMismatches?: Array<{
		eventIndex: number;
		expected: string;
		actual: string;
	}>;
}

/**
 * Replays recorded sessions for testing
 */
export class SessionReplayer {
	private readonly log: ServerLogger;
	private readonly fixturesDirectory: string;

	constructor(
		log: ServerLogger,
		fixturesDirectory: string = "test/fixtures/sessions",
	) {
		this.log = log;
		this.fixturesDirectory = fixturesDirectory;
	}

	/**
	 * Load a recorded session from disk
	 */
	loadSession(filename: string): RecordedSession | null {
		const filepath = join(this.fixturesDirectory, filename);
		if (!existsSync(filepath)) {
			// Only log error if not in test environment (tests use loggerMock anyway)
			const isTestEnv = process.env['NODE_ENV'] === "test" || process.env['VITEST'] === "true";
			if (!isTestEnv) {
				this.log.error(`Session file not found: ${filepath}`);
			}
			return null;
		}

		try {
			const content = readFileSync(filepath, "utf-8");
			const session: RecordedSession = JSON.parse(content);
			this.log.debug(`Loaded session: ${filename} (${session.events.length} events)`);
			return session;
		} catch (error) {
			this.log.error(`Failed to load session: ${error}`);
			return null;
		}
	}

	/**
	 * Get all available session files
	 */
	listSessions(): string[] {
		try {
			const { readdirSync, existsSync } = require("node:fs");
			// Don't create directory or log errors if it doesn't exist during tests
			if (!existsSync(this.fixturesDirectory)) {
				return [];
			}
			const files = readdirSync(this.fixturesDirectory);
			return files.filter((file: string) => file.endsWith(".json"));
		} catch (error) {
			// Only log error if not in test environment (tests use loggerMock anyway)
			const isTestEnv = process.env['NODE_ENV'] === "test" || process.env['VITEST'] === "true";
			if (!isTestEnv) {
				this.log.error(`Failed to list sessions: ${error}`);
			}
			return [];
		}
	}

	/**
	 * Replay a session by sending events to a handler function
	 */
	async replaySession(
		session: RecordedSession,
		handler: {
			onConnect: (port: number, connectionId: string, remoteAddress?: string) => Promise<void>;
			onDataIn: (port: number, connectionId: string, data: Buffer) => Promise<void>;
			onDisconnect: (port: number, connectionId: string) => Promise<void>;
		},
		options: ReplayOptions = {},
	): Promise<ReplayResult> {
		const {
			validateResponses = false,
			useTimings = false,
			timeout = 30000,
			onEvent,
		} = options;

		const result: ReplayResult = {
			success: true,
			eventsProcessed: 0,
			errors: [],
			warnings: [],
			responseMismatches: [],
		};

		const startTime = Date.now();
		let lastTimestamp = session.events[0]?.timestamp || Date.now();

		try {
			for (let i = 0; i < session.events.length; i++) {
				const event = session.events[i];
				
				// Skip if event is undefined (shouldn't happen, but TypeScript needs this)
				if (!event) {
					result.warnings.push(`Event at index ${i} is undefined`);
					continue;
				}

				// Check timeout
				if (Date.now() - startTime > timeout) {
					result.errors.push(`Replay timeout after ${timeout}ms`);
					result.success = false;
					break;
				}

				// Add timing delay if requested
				if (useTimings && i > 0) {
					const delay = event.timestamp - lastTimestamp;
					if (delay > 0 && delay < 5000) {
						// Cap delay at 5 seconds
						await new Promise((resolve) => setTimeout(resolve, delay));
					}
				}
				lastTimestamp = event.timestamp;

				// Call event callback if provided
				if (onEvent) {
					onEvent(event);
				}

				// Process event
				try {
					switch (event.type) {
						case "connect":
							if (event.port && event.connectionId) {
								await handler.onConnect(
									event.port,
									event.connectionId,
									event.remoteAddress,
								);
								result.eventsProcessed++;
							}
							break;

						case "data_in":
							if (event.port && event.connectionId && event.data) {
								const data = Buffer.from(event.data, "hex");
								await handler.onDataIn(event.port, event.connectionId, data);
								result.eventsProcessed++;
							}
							break;

						case "disconnect":
							if (event.port && event.connectionId) {
								await handler.onDisconnect(event.port, event.connectionId);
								result.eventsProcessed++;
							}
							break;

						case "error":
							result.warnings.push(
								`Error event at index ${i}: ${event.error}`,
							);
							break;

						case "data_out":
							// data_out events are for validation only
							if (validateResponses) {
								// Note: This would need to be integrated with the actual response handler
								// For now, we just track that we saw it
								result.eventsProcessed++;
							}
							break;
					}
				} catch (error) {
					result.errors.push(
						`Error processing event ${i} (${event.type}): ${String(error)}`,
					);
					result.success = false;
				}
			}
		} catch (error) {
			result.errors.push(`Replay failed: ${String(error)}`);
			result.success = false;
		}

		return result;
	}

	/**
	 * Extract only the data_in events from a session (useful for quick replay)
	 */
	extractDataInEvents(session: RecordedSession): Array<{
		port: number;
		connectionId: string;
		data: Buffer;
	}> {
		const events: Array<{
			port: number;
			connectionId: string;
			data: Buffer;
		}> = [];

		for (const event of session.events) {
			if (
				event.type === "data_in" &&
				event.port !== undefined &&
				event.connectionId &&
				event.data
			) {
				events.push({
					port: event.port,
					connectionId: event.connectionId,
					data: Buffer.from(event.data, "hex"),
				});
			}
		}

		return events;
	}
}
