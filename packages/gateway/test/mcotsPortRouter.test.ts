import { describe, it, expect, vi, beforeEach } from "vitest";
import { mcotsPortRouter } from "../src/mcotsPortRouter.js";
import type { TaggedSocket } from "../src/socketUtility.js";
import { ServerPacket } from "rusty-motors-shared-packets";

describe("mcotsPortRouter", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

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

		await mcotsPortRouter({ taggedSocket, log: mockLogger });

		expect(mockLogger.error).toHaveBeenCalledWith(
			"[test-id] Local port is undefined",
		);
		expect(mockSocket.end).toHaveBeenCalled();
	});

	it("should handle data event and route initial message", async () => {
		const mockSocket = {
			localPort: 43300,
			write: vi.fn(),
			on: vi.fn((event, callback) => {
				if (event === "data") {
					callback(Buffer.from([0x74, 0x65, 0x73, 0x74, 0x2d, 0x64, 0x61, 0x74, 0x61]));
				}
			}),
		};
		const mockLog = {
			debug: vi.fn(),
			error: vi.fn(),
		};
		const taggedSocket: TaggedSocket = { socket: mockSocket, id: "test-id-mcots" };

		const mockServerPacket = {
			deserialize: vi.fn(),
			toHexString: vi.fn().mockReturnValue("746573742d64617461"),
		};
		vi.spyOn(ServerPacket.prototype, "deserialize").mockImplementation(
			mockServerPacket.deserialize,
		);
		vi.spyOn(ServerPacket.prototype, "toHexString").mockImplementation(
			mockServerPacket.toHexString,
		);

		await mcotsPortRouter({ taggedSocket, log: mockLog });

		expect(mockLog.debug).toHaveBeenCalledWith(
			"[test-id-mcots] Received data: 746573742d64617461",
		);
		expect(mockLog.debug).toHaveBeenCalledWith(
			"[test-id-mcots] Initial packet(str): ServerPacket {length: 0, sequence: 0, messageId: 0}",
		);
		expect(mockLog.debug).toHaveBeenCalledWith(
			"[test-id-mcots] initial Packet(hex): 746573742d64617461",
		);
	});

	it("should log socket end event", async () => {
		const mockSocket = {
			localPort: 43300,
			on: vi.fn((event, callback) => {
				if (event === "end") {
					callback();
				}
			}),
		};
		const mockLogger = {
			error: vi.fn(),
			debug: vi.fn(),
		};
		const taggedSocket: TaggedSocket = { socket: mockSocket, id: "test-id" };

		await mcotsPortRouter({ taggedSocket, log: mockLogger });

		expect(mockLogger.debug).toHaveBeenCalledWith("[test-id] Socket closed");
	});

	it("should log socket error event", async () => {
		const mockSocket = {
			localPort: 43300,
			on: vi.fn((event, callback) => {
				if (event === "error") {
					callback(new Error("test-error"));
				}
			}),
		};
		const mockLogger = {
			error: vi.fn(),
			debug: vi.fn(),
		};
		const taggedSocket: TaggedSocket = { socket: mockSocket, id: "test-id" };

		await mcotsPortRouter({ taggedSocket, log: mockLogger });

		expect(mockLogger.error).toHaveBeenCalledWith(
			"[test-id] Socket error: Error: test-error",
		);
	});
});
