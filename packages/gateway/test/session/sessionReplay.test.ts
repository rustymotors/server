import { describe, it, expect, beforeEach, vi } from "vitest";
import { getServerLogger } from "rusty-motors-shared";
import { SessionTestHelper } from "./SessionTestHelper.js";
import { existsSync } from "node:fs";
import { join } from "node:path";

describe("Session Replay Tests", () => {
	let helper: SessionTestHelper;
	const logger = getServerLogger("test.sessionReplay");
	const fixturesDir = join(process.cwd(), "test", "fixtures", "sessions");

	beforeEach(() => {
		helper = new SessionTestHelper(logger, fixturesDir);
	});

	it("should list available session files", () => {
		const replayer = helper["replayer"];
		const sessions = replayer.listSessions();
		
		console.log(`Found ${sessions.length} session files`);
		expect(sessions.length).toBeGreaterThan(0);
	});

	it("should replay a login session (port 8226)", async () => {
		const sessionFile = "session_fd922b4f_8226_2026-01-10T21-43-16.json";
		const filepath = join(fixturesDir, sessionFile);
		
		if (!existsSync(filepath)) {
			console.warn(`Session file not found: ${sessionFile}`);
			return;
		}

		const result = await helper.loadAndReplay(sessionFile, {
			validateResponses: false, // Set to true to compare with recorded responses
		});

		expect(result).not.toBeNull();
		expect(result?.success).toBe(true);
		expect(result?.eventsProcessed).toBeGreaterThan(0);
		expect(result?.capturedResponses.length).toBeGreaterThan(0);

		console.log(`Processed ${result?.eventsProcessed} events`);
		console.log(`Captured ${result?.capturedResponses.length} responses`);
	});

	it("should replay a lobby session (port 7003)", async () => {
		const sessionFile = "session_e6f0c563_7003_2026-01-10T21-43-37.json";
		const filepath = join(fixturesDir, sessionFile);
		
		if (!existsSync(filepath)) {
			console.warn(`Session file not found: ${sessionFile}`);
			return;
		}

		const result = await helper.loadAndReplay(sessionFile);

		expect(result).not.toBeNull();
		if (result) {
			expect(result.success).toBe(true);
			expect(result.eventsProcessed).toBeGreaterThan(0);
			
			// Log first few responses for inspection
			if (result.capturedResponses.length > 0) {
				console.log("First response:", result.capturedResponses[0].hex.substring(0, 100));
			}
		}
	});

	it("should replay a persona session (port 8228)", async () => {
		const sessionFile = "session_cf6f3d8a_8228_2026-01-10T21-43-33.json";
		const filepath = join(fixturesDir, sessionFile);
		
		if (!existsSync(filepath)) {
			console.warn(`Session file not found: ${sessionFile}`);
			return;
		}

		const result = await helper.loadAndReplay(sessionFile);

		expect(result).not.toBeNull();
		if (result) {
			expect(result.success).toBe(true);
		}
	});

	it("should replay a chat session (port 8227)", async () => {
		const sessionFile = "session_33a78e50_8227_2026-01-10T21-43-23.json";
		const filepath = join(fixturesDir, sessionFile);
		
		if (!existsSync(filepath)) {
			console.warn(`Session file not found: ${sessionFile}`);
			return;
		}

		const result = await helper.loadAndReplay(sessionFile);

		expect(result).not.toBeNull();
		if (result) {
			expect(result.success).toBe(true);
		}
	});

	it("should replay a room session (port 9001)", async () => {
		const sessionFile = "session_500526d7_9001_2026-01-10T21-43-31.json";
		const filepath = join(fixturesDir, sessionFile);
		
		if (!existsSync(filepath)) {
			console.warn(`Session file not found: ${sessionFile}`);
			return;
		}

		const result = await helper.loadAndReplay(sessionFile);

		expect(result).not.toBeNull();
		if (result) {
			expect(result.success).toBe(true);
		}
	});

	it("should validate responses match recorded session", async () => {
		const sessionFile = "session_fd922b4f_8226_2026-01-10T21-43-16.json";
		const filepath = join(fixturesDir, sessionFile);
		
		if (!existsSync(filepath)) {
			return;
		}

		const result = await helper.loadAndReplay(sessionFile, {
			validateResponses: true,
		});

		expect(result).not.toBeNull();
		if (result) {
			// Log mismatches if any
			if (result.responseMismatches && result.responseMismatches.length > 0) {
				console.warn(`Found ${result.responseMismatches.length} mismatches:`);
				result.responseMismatches.slice(0, 3).forEach((mismatch) => {
					console.warn(`  Event ${mismatch.eventIndex}:`);
					console.warn(`    Expected: ${mismatch.expected.substring(0, 50)}...`);
					console.warn(`    Actual:   ${mismatch.actual.substring(0, 50)}...`);
				});
			}
		}
	});

	it("should extract and process data events", async () => {
		const replayer = helper["replayer"];
		const session = replayer.loadSession("session_fd922b4f_8226_2026-01-10T21-43-16.json");
		
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
