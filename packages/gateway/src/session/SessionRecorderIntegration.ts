import type { ServerLogger } from "rusty-motors-shared";
import { SessionRecorder } from "./SessionRecorder.js";

/**
 * Global session recorder instance
 * Can be enabled/disabled via environment variable or API
 */
let globalRecorder: SessionRecorder | null = null;

/**
 * Initialize the global session recorder
 */
export function initializeSessionRecorder(
	log: ServerLogger,
	outputDirectory?: string,
): SessionRecorder {
	if (globalRecorder === null) {
		globalRecorder = new SessionRecorder(log, outputDirectory);
		
		// Enable recording if environment variable is set
		const enabled = process.env["RECORD_SESSIONS"] === "true" || 
		                process.env["RECORD_SESSIONS"] === "1";
		globalRecorder.setRecordingEnabled(enabled);
		
		log.info(
			`Session recorder initialized. Recording: ${enabled ? "enabled" : "disabled"}`,
		);
	}
	return globalRecorder;
}

/**
 * Get the global session recorder instance
 */
export function getSessionRecorder(): SessionRecorder | null {
	return globalRecorder;
}

/**
 * Enable or disable session recording
 */
export function setRecordingEnabled(enabled: boolean): void {
	if (globalRecorder) {
		globalRecorder.setRecordingEnabled(enabled);
	}
}

/**
 * Save all active sessions
 */
export function saveAllSessions(description?: string): string[] {
	if (!globalRecorder) {
		return [];
	}
	return globalRecorder.saveAllSessions(description);
}
