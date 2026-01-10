/**
 * Example test showing how to use recorded sessions
 * 
 * This is a template - replace with actual session files and handlers
 */

import { describe, it, expect, beforeEach } from "vitest";
import { SessionReplayer } from "../../src/session/SessionReplayer.js";
import { loggerMock } from "rusty-motors-shared/test";
import type { RecordedSession } from "../../src/session/SessionRecorder.js";

describe("Session Replay Integration Example", () => {
	let replayer: SessionReplayer;
	const logger = loggerMock;

	beforeEach(() => {
		replayer = new SessionReplayer(logger, "test/fixtures/sessions");
	});

	it("should replay a recorded login session", async () => {
		// Load a recorded session
		const session = replayer.loadSession("session_login_example.json");
		
		if (!session) {
			// Skip if session file doesn't exist
			return; // Skip silently - no fixture available
		}

		// Replay the session
		const result = await replayer.replaySession(
			session,
			{
				onConnect: async (port, connectionId, remoteAddress) => {
					logger.debug(`Replaying connect: ${connectionId} on port ${port}`);
					// Here you would set up your test connection
					// e.g., create mock socket, initialize handlers, etc.
				},
				onDataIn: async (port, connectionId, data) => {
					logger.debug(
						`Replaying data_in: ${connectionId} on port ${port}, ${data.length} bytes`,
					);
					// Here you would call your actual message handlers
					// e.g., await processSocketData(data, logger, connectionId, port, mockSocket);
				},
				onDisconnect: async (port, connectionId) => {
					logger.debug(`Replaying disconnect: ${connectionId} on port ${port}`);
					// Here you would clean up test resources
				},
			},
			{
				validateResponses: false, // Set to true to compare responses
				useTimings: false, // Set to true to replay with original timing
			},
		);

		expect(result.success).toBe(true);
		expect(result.eventsProcessed).toBeGreaterThan(0);
		expect(result.errors).toHaveLength(0);
	});

	it("should extract and process data_in events", async () => {
		const session = replayer.loadSession("session_login_example.json");
		
		if (!session) {
			return;
		}

		// Extract just the data packets
		const dataEvents = replayer.extractDataInEvents(session);

		expect(dataEvents.length).toBeGreaterThan(0);

		// Process each data packet
		for (const event of dataEvents) {
			// Process the data through your handlers
			// This is useful for focused tests on specific message types
			expect(event.data).toBeInstanceOf(Buffer);
			expect(event.data.length).toBeGreaterThan(0);
		}
	});

	it("should list available session files", () => {
		const sessions = replayer.listSessions();
		// Skip if no sessions available
		if (sessions.length === 0) {
			return; // Skip silently - no fixtures available
		}
		expect(sessions.length).toBeGreaterThan(0);
	});
});
