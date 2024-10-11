import { describe, it, expect, vi } from "vitest";
import { npsPortRouter } from "../src/npsPortRouter.js";
import type { TaggedSocket } from "../src/socketUtility.js";
import { GamePacket } from "rusty-motors-shared-packets";
import { write } from "fs";

describe("npsPortRouter", () => {
	it("should log an error and close the socket if local port is undefined", async () => {
		const mockSocket = {
			localPort: undefined,
			end: vi.fn(),
			on: vi.fn(),
		};
		const mockLogger = {
			error: vi.fn(),
			debug: vi.fn(),
		};
		const taggedSocket: TaggedSocket = { socket: mockSocket, id: "test-id" };

		await npsPortRouter({ taggedSocket, log: mockLogger });

		expect(mockLogger.error).toHaveBeenCalledWith(
			"[test-id] Local port is undefined",
		);
		expect(mockSocket.end).toHaveBeenCalled();
	});

	it("should log the start of the router and send ok to login packet for port 7003", async () => {
		const mockSocket = {
			localPort: 7003,
			write: vi.fn(),
			on: vi.fn(),
		};
		const mockLogger = {
			error: vi.fn(),
			debug: vi.fn(),
		};
		const taggedSocket: TaggedSocket = { socket: mockSocket, id: "test-id" };

		await npsPortRouter({ taggedSocket, log: mockLogger });

		expect(mockLogger.debug).toHaveBeenCalledWith(
			"[test-id] NPS port router started for port 7003",
		);
		expect(mockLogger.debug).toHaveBeenCalledWith(
			"[test-id] Sending ok to login packet",
		);
		expect(mockSocket.write).toHaveBeenCalledWith(
			Buffer.from([0x02, 0x30, 0x00, 0x00]),
		);
	});

	it("should handle data event and route initial message", async () => {
		const mockSocket = {
			localPort: 7003,
			write: vi.fn(),
			on: vi.fn((event, callback) => {
				if (event === "data") {
					callback(Buffer.from([0x01, 0x02, 0x03]));
				}
			}),
		};
		const mockLogger = {
			error: vi.fn(),
			debug: vi.fn(),
		};
		const taggedSocket: TaggedSocket = { socket: mockSocket, id: "test-id" };

		const mockGamePacket = {
			deserialize: vi.fn(),
			toHexString: vi.fn().mockReturnValue("010203"),
		};
		vi.spyOn(GamePacket.prototype, "deserialize").mockImplementation(
			mockGamePacket.deserialize,
		);
		vi.spyOn(GamePacket.prototype, "toHexString").mockImplementation(
			mockGamePacket.toHexString,
		);

		await npsPortRouter({ taggedSocket, log: mockLogger });

		expect(mockLogger.debug).toHaveBeenCalledWith(
			"[test-id] Received data: 010203",
		);
		expect(mockLogger.debug).toHaveBeenCalledWith(
			"[test-id] Initial packet(str): GamePacket {length: 0, messageId: 0}",
		);
		expect(mockLogger.debug).toHaveBeenCalledWith(
			"[test-id] initial Packet(hex): 010203",
		);
	});

	it("should log socket end event", async () => {
		const mockSocket = {
			localPort: 7003,
			on: vi.fn((event, callback) => {
				if (event === "end") {
					callback();
				}
			}),
			write: vi.fn(),
		};
		const mockLogger = {
			error: vi.fn(),
			debug: vi.fn(),
		};
		const taggedSocket: TaggedSocket = { socket: mockSocket, id: "test-id" };

		await npsPortRouter({ taggedSocket, log: mockLogger });

		expect(mockLogger.debug).toHaveBeenCalledWith("[test-id] Socket closed");
	});

	it("should log socket error event", async () => {
		const mockSocket = {
			localPort: 7003,
			on: vi.fn((event, callback) => {
				if (event === "error") {
					callback(new Error("Test error"));
				}
			}),
			write: vi.fn(),
		};
		const mockLogger = {
			error: vi.fn(),
			debug: vi.fn(),
		};
		const taggedSocket: TaggedSocket = { socket: mockSocket, id: "test-id" };

		await npsPortRouter({ taggedSocket, log: mockLogger });

		expect(mockLogger.error).toHaveBeenCalledWith(
			"[test-id] Socket error: Error: Test error",
		);
	});
});
