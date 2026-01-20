import { describe, it, expect, beforeEach, vi } from "vitest";
import type { ServerLogger } from "rusty-motors-shared";
import { SessionRecorder } from "../../src/session/SessionRecorder.js";
import { SessionReplayer } from "../../src/session/SessionReplayer.js";
import { mkdirSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";

describe("SessionRecorder", () => {
	let mockLogger: ServerLogger;
	let recorder: SessionRecorder;
	let testOutputDir: string;

	beforeEach(() => {
		mockLogger = {
			debug: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
		} as unknown as ServerLogger;

		// Use a temp directory that won't create parent fixtures directory
		testOutputDir = join(process.cwd(), "test", "fixtures", "sessions", ".test-temp");
		// Clean up test directory
		if (existsSync(testOutputDir)) {
			rmSync(testOutputDir, { recursive: true, force: true });
		}
		mkdirSync(testOutputDir, { recursive: true });

		recorder = new SessionRecorder(mockLogger, testOutputDir);
	});

	it("should start with recording disabled", () => {
		expect(recorder.isRecordingEnabled()).toBe(false);
	});

	it("should enable/disable recording", () => {
		recorder.setRecordingEnabled(true);
		expect(recorder.isRecordingEnabled()).toBe(true);

		recorder.setRecordingEnabled(false);
		expect(recorder.isRecordingEnabled()).toBe(false);
	});

	it("should record connection events", () => {
		recorder.setRecordingEnabled(true);
		recorder.startSession("test-123", 7003, "127.0.0.1");

		const session = recorder.getSession("test-123");
		expect(session).toBeDefined();
		expect(session?.events).toHaveLength(1);
		expect(session?.events[0]?.type).toBe("connect");
		expect(session?.events[0]?.port).toBe(7003);
		expect(session?.events[0]?.connectionId).toBe("test-123");
	});

	it("should record data_in events", () => {
		recorder.setRecordingEnabled(true);
		recorder.startSession("test-123", 7003, "127.0.0.1");

		const data = Buffer.from([0x01, 0x02, 0x03, 0x04]);
		recorder.recordDataIn("test-123", 7003, data);

		const session = recorder.getSession("test-123");
		expect(session?.events).toHaveLength(2);
		expect(session?.events[1]?.type).toBe("data_in");
		expect(session?.events[1]?.data).toBe("01020304");
	});

	it("should record data_out events", () => {
		recorder.setRecordingEnabled(true);
		recorder.startSession("test-123", 7003, "127.0.0.1");

		const data = Buffer.from([0x05, 0x06, 0x07, 0x08]);
		recorder.recordDataOut("test-123", 7003, data);

		const session = recorder.getSession("test-123");
		expect(session?.events).toHaveLength(2);
		expect(session?.events[1]?.type).toBe("data_out");
		expect(session?.events[1]?.data).toBe("05060708");
	});

	it("should record disconnect events", () => {
		recorder.setRecordingEnabled(true);
		recorder.startSession("test-123", 7003, "127.0.0.1");
		recorder.recordDisconnect("test-123", 7003);

		const session = recorder.getSession("test-123");
		expect(session?.events).toHaveLength(2);
		expect(session?.events[1]?.type).toBe("disconnect");
	});

	it("should not record when disabled", () => {
		recorder.setRecordingEnabled(false);
		recorder.startSession("test-123", 7003, "127.0.0.1");

		const session = recorder.getSession("test-123");
		expect(session).toBeUndefined();
	});

	it("should save session to disk", () => {
		recorder.setRecordingEnabled(true);
		recorder.startSession("test-123", 7003, "127.0.0.1");
		recorder.recordDataIn("test-123", 7003, Buffer.from([0x01, 0x02]));

		const filepath = recorder.saveSession("test-123", "Test session");
		expect(filepath).toBeTruthy();
		expect(existsSync(filepath!)).toBe(true);
	});

	it("should save all sessions", () => {
		recorder.setRecordingEnabled(true);
		recorder.startSession("test-1", 7003, "127.0.0.1");
		recorder.startSession("test-2", 8226, "127.0.0.1");

		const saved = recorder.saveAllSessions("Batch save");
		expect(saved).toHaveLength(2);
	});
});

describe("SessionReplayer", () => {
	let mockLogger: ServerLogger;
	let replayer: SessionReplayer;
	let testFixturesDir: string;

	beforeEach(() => {
		mockLogger = {
			debug: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
		} as unknown as ServerLogger;

		// Use a temp directory that won't create parent fixtures directory
		// Create in a location that won't interfere with main fixtures
		testFixturesDir = join(process.cwd(), "test", "fixtures", "sessions", ".test-temp");
		// Clean up if it exists
		if (existsSync(testFixturesDir)) {
			rmSync(testFixturesDir, { recursive: true, force: true });
		}
		mkdirSync(testFixturesDir, { recursive: true });

		replayer = new SessionReplayer(mockLogger, testFixturesDir);
	});

	it("should load a session from disk", () => {
		// Create a test session file
		const testSession = {
			metadata: {
				recordedAt: new Date().toISOString(),
				recordedBy: "test",
				ports: [7003],
				connectionIds: ["test-123"],
			},
			events: [
				{
					timestamp: Date.now(),
					type: "connect",
					port: 7003,
					connectionId: "test-123",
					remoteAddress: "127.0.0.1",
				},
			],
		};

		const { writeFileSync } = require("node:fs");
		const filepath = join(testFixturesDir, "test_session.json");
		writeFileSync(filepath, JSON.stringify(testSession, null, 2));

		const loaded = replayer.loadSession("test_session.json");
		expect(loaded).toBeDefined();
		expect(loaded?.events).toHaveLength(1);
	});

	it("should extract data_in events", () => {
		const session = {
			metadata: {
				recordedAt: new Date().toISOString(),
				recordedBy: "test",
				ports: [7003],
				connectionIds: ["test-123"],
			},
			events: [
				{
					timestamp: Date.now(),
					type: "connect",
					port: 7003,
					connectionId: "test-123",
				},
				{
					timestamp: Date.now() + 100,
					type: "data_in",
					port: 7003,
					connectionId: "test-123",
					data: "01020304",
				},
				{
					timestamp: Date.now() + 200,
					type: "data_in",
					port: 7003,
					connectionId: "test-123",
					data: "05060708",
				},
			],
		};

		const dataEvents = replayer.extractDataInEvents(session);
		expect(dataEvents).toHaveLength(2);
		expect(dataEvents[0]?.data.toString("hex")).toBe("01020304");
		expect(dataEvents[1]?.data.toString("hex")).toBe("05060708");
	});

	it("should replay a session", async () => {
		const session = {
			metadata: {
				recordedAt: new Date().toISOString(),
				recordedBy: "test",
				ports: [7003],
				connectionIds: ["test-123"],
			},
			events: [
				{
					timestamp: Date.now(),
					type: "connect",
					port: 7003,
					connectionId: "test-123",
					remoteAddress: "127.0.0.1",
				},
				{
					timestamp: Date.now() + 100,
					type: "data_in",
					port: 7003,
					connectionId: "test-123",
					data: "01020304",
				},
				{
					timestamp: Date.now() + 200,
					type: "disconnect",
					port: 7003,
					connectionId: "test-123",
				},
			],
		};

		const connectHandler = vi.fn().mockResolvedValue(undefined);
		const dataInHandler = vi.fn().mockResolvedValue(undefined);
		const disconnectHandler = vi.fn().mockResolvedValue(undefined);

		const result = await replayer.replaySession(session, {
			onConnect: connectHandler,
			onDataIn: dataInHandler,
			onDisconnect: disconnectHandler,
		});

		expect(result.success).toBe(true);
		expect(result.eventsProcessed).toBe(3);
		expect(connectHandler).toHaveBeenCalledTimes(1);
		expect(dataInHandler).toHaveBeenCalledTimes(1);
		expect(disconnectHandler).toHaveBeenCalledTimes(1);
	});
});
