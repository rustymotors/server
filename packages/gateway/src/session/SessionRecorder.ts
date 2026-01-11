import type { ServerLogger } from "rusty-motors-shared";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Represents a single event in a recorded session
 */
export interface SessionEvent {
	timestamp: number;
	type: "connect" | "data_in" | "data_out" | "disconnect" | "error";
	port?: number;
	connectionId?: string;
	data?: string; // hex string
	remoteAddress?: string;
	error?: string;
}

/**
 * Represents a complete recorded session
 */
export interface RecordedSession {
	metadata: {
		recordedAt: string;
		recordedBy: string;
		description?: string;
		ports: number[];
		connectionIds: string[];
	};
	events: SessionEvent[];
}

/**
 * Records client-server communication sessions for use as test fixtures
 */
export class SessionRecorder {
	private readonly sessions: Map<string, RecordedSession> = new Map();
	private readonly log: ServerLogger;
	private readonly outputDirectory: string;
	private recordingEnabled: boolean = false;

	constructor(
		log: ServerLogger,
		outputDirectory: string = "test/fixtures/sessions",
	) {
		this.log = log;
		this.outputDirectory = outputDirectory;

		// Only create output directory if not in test environment
		// (Tests that need directories will create them explicitly)
		const isTestEnv = process.env['NODE_ENV'] === "test" || process.env['VITEST'] === "true";
		if (!isTestEnv) {
			// Create output directory if it doesn't exist
			try {
				mkdirSync(this.outputDirectory, { recursive: true });
			} catch (error) {
				// Directory might already exist, ignore
			}
		}
	}

	/**
	 * Enable or disable recording
	 */
	setRecordingEnabled(enabled: boolean): void {
		this.recordingEnabled = enabled;
		this.log.info(`Session recording ${enabled ? "enabled" : "disabled"}`);
	}

	/**
	 * Check if recording is enabled
	 */
	isRecordingEnabled(): boolean {
		return this.recordingEnabled;
	}

	/**
	 * Start recording a new session
	 */
	startSession(connectionId: string, port: number, remoteAddress: string): void {
		if (!this.recordingEnabled) {
			return;
		}

		const session: RecordedSession = {
			metadata: {
				recordedAt: new Date().toISOString(),
				recordedBy: "SessionRecorder",
				ports: [port],
				connectionIds: [connectionId],
			},
			events: [
				{
					timestamp: Date.now(),
					type: "connect",
					port,
					connectionId,
					remoteAddress,
				},
			],
		};

		this.sessions.set(connectionId, session);
		this.log.debug(`Started recording session: ${connectionId}`);
	}

	/**
	 * Record incoming data from client
	 */
	recordDataIn(
		connectionId: string,
		port: number,
		data: Buffer,
	): void {
		if (!this.recordingEnabled) {
			return;
		}

		const session = this.sessions.get(connectionId);
		if (!session) {
			this.log.warn(
				`Attempted to record data_in for unknown session: ${connectionId}`,
			);
			return;
		}

		session.events.push({
			timestamp: Date.now(),
			type: "data_in",
			port,
			connectionId,
			data: data.toString("hex"),
		});
	}

	/**
	 * Record outgoing data to client
	 */
	recordDataOut(
		connectionId: string,
		port: number,
		data: Buffer,
	): void {
		if (!this.recordingEnabled) {
			return;
		}

		const session = this.sessions.get(connectionId);
		if (!session) {
			this.log.warn(
				`Attempted to record data_out for unknown session: ${connectionId}`,
			);
			return;
		}

		session.events.push({
			timestamp: Date.now(),
			type: "data_out",
			port,
			connectionId,
			data: data.toString("hex"),
		});
	}

	/**
	 * Record session disconnect
	 */
	recordDisconnect(connectionId: string, port: number): void {
		if (!this.recordingEnabled) {
			return;
		}

		const session = this.sessions.get(connectionId);
		if (!session) {
			return;
		}

		session.events.push({
			timestamp: Date.now(),
			type: "disconnect",
			port,
			connectionId,
		});
	}

	/**
	 * Record an error event
	 */
	recordError(
		connectionId: string,
		port: number,
		error: string,
	): void {
		if (!this.recordingEnabled) {
			return;
		}

		const session = this.sessions.get(connectionId);
		if (!session) {
			return;
		}

		session.events.push({
			timestamp: Date.now(),
			type: "error",
			port,
			connectionId,
			error,
		});
	}

	/**
	 * Save a session to disk
	 */
	saveSession(connectionId: string, description?: string): string | null {
		const session = this.sessions.get(connectionId);
		if (!session) {
			this.log.warn(`No session found to save: ${connectionId}`);
			return null;
		}

		// Prevent saving sessions to main fixtures directory during tests
		// Allow saving to test subdirectories (e.g., test/fixtures/sessions/test/)
		const isTestEnv = process.env['NODE_ENV'] === "test" || process.env['VITEST'] === "true";
		const isMainFixturesDir = this.outputDirectory.endsWith("test/fixtures/sessions") ||
		                          this.outputDirectory.endsWith("test\\fixtures\\sessions");
		
		if (isTestEnv && isMainFixturesDir) {
			this.log.warn(
				`Session recording disabled during tests. Would have saved to: ${this.outputDirectory}`,
			);
			return null;
		}

		if (description) {
			session.metadata.description = description;
		}

		// Generate filename from connectionId and timestamp
		const timestamp = new Date()
			.toISOString()
			.replace(/[:.]/g, "-")
			.slice(0, -5);
		const sanitizedConnectionId = connectionId.replace(/[^a-zA-Z0-9]/g, "_");
		const filename = `session_${sanitizedConnectionId}_${timestamp}.json`;
		const filepath = join(this.outputDirectory, filename);

		try {
			writeFileSync(filepath, JSON.stringify(session, null, 2), "utf-8");
			this.log.info(`Saved session to: ${filepath}`);
			return filepath;
		} catch (error) {
			this.log.error(`Failed to save session: ${error}`);
			return null;
		}
	}

	/**
	 * Save all active sessions
	 */
	saveAllSessions(description?: string): string[] {
		const saved: string[] = [];

		for (const connectionId of this.sessions.keys()) {
			const filepath = this.saveSession(connectionId, description);
			if (filepath) {
				saved.push(filepath);
			}
		}

		return saved;
	}

	/**
	 * Get a session (for inspection)
	 */
	getSession(connectionId: string): RecordedSession | undefined {
		return this.sessions.get(connectionId);
	}

	/**
	 * Clear a session from memory
	 */
	clearSession(connectionId: string): void {
		this.sessions.delete(connectionId);
	}

	/**
	 * Clear all sessions from memory
	 */
	clearAllSessions(): void {
		this.sessions.clear();
	}
}
