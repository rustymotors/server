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
		// During tests, ensure recording is disabled and use a test directory if needed
		const isTestEnv = process.env['NODE_ENV'] === "test" || process.env['VITEST'] === "true";
		
		// If in test environment and no output directory specified, use a test subdirectory
		// to prevent writing to main fixtures directory
		let safeOutputDirectory = outputDirectory;
		if (isTestEnv && !outputDirectory) {
			safeOutputDirectory = "test/fixtures/sessions/test";
		}
		
		globalRecorder = new SessionRecorder(log, safeOutputDirectory);
		
		// Enable recording if environment variable is set (but disabled in test env)
		const enabled = !isTestEnv && (
			process.env["RECORD_SESSIONS"] === "true" || 
			process.env["RECORD_SESSIONS"] === "1"
		);
		globalRecorder.setRecordingEnabled(enabled);
		
		// Only log if not in test environment to avoid log output during tests
		if (!isTestEnv) {
			log.info(
				`Session recorder initialized. Recording: ${enabled ? "enabled" : "disabled"}`,
			);
		}
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
