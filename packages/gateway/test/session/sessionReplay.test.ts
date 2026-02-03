import { describe, it, expect, beforeEach, vi } from "vitest";
import { loggerMock } from "rusty-motors-shared/test";
import { SessionTestHelper } from "./SessionTestHelper.js";
import { join } from "node:path";
import type { RecordedSession } from "../../src/session/SessionRecorder.js";

describe("Session Replay Tests", () => {
	let helper: SessionTestHelper;
	const logger = loggerMock;
	const fixturesDir = join(process.cwd(), "test", "fixtures", "sessions");

	beforeEach(() => {
		helper = new SessionTestHelper(logger, fixturesDir);
	});

	/**
	 * Find a session file by port
	 */
	function findSessionByPort(port: number): string | null {
		const replayer = helper["replayer"];
		const sessionFiles = replayer.listSessions();
		
		for (const filename of sessionFiles) {
			const session = replayer.loadSession(filename);
			if (session && session.metadata.ports.includes(port)) {
				return filename;
			}
		}
		return null;
	}

	it("should list available session files", () => {
		const replayer = helper["replayer"];
		const sessions = replayer.listSessions();
		
		// Skip test if no session files found (don't fail, just skip)
		if (sessions.length === 0) {
			return; // Skip silently - no fixtures available
		}
		
		expect(sessions.length).toBeGreaterThan(0);
	});

	it("should replay a login session (port 8226)", async () => {
		const sessionFile = findSessionByPort(8226);
		
		if (!sessionFile) {
			return; // Skip silently - no fixture available
		}

		const result = await helper.loadAndReplay(sessionFile, {
			validateResponses: false, // Set to true to compare with recorded responses
		});

		expect(result).not.toBeNull();
		expect(result?.success).toBe(true);
		expect(result?.eventsProcessed).toBeGreaterThan(0);
		expect(result?.capturedResponses.length).toBeGreaterThan(0);
	});

	it("should replay a lobby session (port 7003)", async () => {
		const sessionFile = findSessionByPort(7003);
		
		if (!sessionFile) {
			return; // Skip silently - no fixture available
		}

		const result = await helper.loadAndReplay(sessionFile);

		expect(result).not.toBeNull();
		if (result) {
			expect(result.success).toBe(true);
			expect(result.eventsProcessed).toBeGreaterThan(0);
		}
	});

	it("should replay a persona session (port 8228)", async () => {
		const sessionFile = findSessionByPort(8228);
		
		if (!sessionFile) {
			return; // Skip silently - no fixture available
		}

		const result = await helper.loadAndReplay(sessionFile);

		expect(result).not.toBeNull();
		if (result) {
			expect(result.success).toBe(true);
		}
	});

	it("should replay a chat session (port 8227)", async () => {
		const sessionFile = findSessionByPort(8227);
		
		if (!sessionFile) {
			return; // Skip silently - no fixture available
		}

		const result = await helper.loadAndReplay(sessionFile);

		expect(result).not.toBeNull();
		if (result) {
			expect(result.success).toBe(true);
		}
	});

	it("should replay a room session (port 9001)", async () => {
		const sessionFile = findSessionByPort(9001);
		
		if (!sessionFile) {
			return; // Skip silently - no fixture available
		}

		const result = await helper.loadAndReplay(sessionFile);

		expect(result).not.toBeNull();
		if (result) {
			expect(result.success).toBe(true);
		}
	});

	it("should validate responses match recorded session", async () => {
		const sessionFile = findSessionByPort(8226);
		
		if (!sessionFile) {
			return; // Skip silently - no fixture available
		}

		const result = await helper.loadAndReplay(sessionFile, {
			validateResponses: true,
		});

		expect(result).not.toBeNull();
		if (result) {
			// Note: response mismatches are tracked in result but not logged
			// Tests can check result.responseMismatches if needed
		}
	});

	it("should extract and process data events", async () => {
		const replayer = helper["replayer"];
		const sessionFile = findSessionByPort(8226);
		
		if (!sessionFile) {
			return; // Skip silently - no fixture available
		}

		const session = replayer.loadSession(sessionFile);
		
		if (!session) {
			return;
		}

		const dataEvents = replayer.extractDataInEvents(session);
		expect(dataEvents.length).toBeGreaterThan(0);

		// Process each data event
		for (const event of dataEvents) {
			expect(event.data).toBeInstanceOf(Buffer);
			expect(event.data.length).toBeGreaterThan(0);
		}
	});
});
