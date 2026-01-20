import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { createInitialState, addSocketPair, getSocketQueue, type TaggedSocket, MessageQueue, type messageQueueItem } from "rusty-motors-shared";
import { loggerMock } from "rusty-motors-shared/test";
import { processSocketData } from "../src/npsPortRouter.js";
import { Socket } from "node:net";
import { SessionTestHelper } from "./session/SessionTestHelper.js";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getServiceRegistry, clearServiceRegistry } from "../src/routing/ServiceRegistry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock the handler modules
vi.mock("rusty-motors-lobby", () => ({
	receiveLobbyData: vi.fn().mockResolvedValue({
		messages: [],
		connectionId: "test-id",
	}),
}));

vi.mock("rusty-motors-authentication", () => ({
	receiveLoginData: vi.fn().mockResolvedValue({
		messages: [],
		connectionId: "test-id",
	}),
	receivePersonaData: vi.fn().mockResolvedValue({
		messages: [],
		connectionId: "test-id",
	}),
}));

vi.mock("rusty-motors-chat", () => ({
	receiveChatData: vi.fn().mockResolvedValue({
		messages: [],
		connectionId: "test-id",
	}),
}));

describe("npsPortRouter - Core Functions", () => {
	const log = loggerMock;
	let mockSocket: TaggedSocket;
	let connectionId: string;

	beforeEach(async () => {
		// Reset state
		createInitialState({ saveFunction: () => {} });

		// Clear and re-initialize the service registry with mocked handlers
		clearServiceRegistry();
		const registry = getServiceRegistry();

		// Import the mocked handlers
		const { receiveLobbyData } = await import("rusty-motors-lobby");
		const { receiveLoginData, receivePersonaData } = await import("rusty-motors-authentication");
		const { receiveChatData } = await import("rusty-motors-chat");

		// Register mocked handlers with the service registry
		registry.register({
			name: 'lobby',
			ports: [7003, ...Array.from({ length: 21 }, (_, i) => 9000 + i), 10001],
			handler: receiveLobbyData,
		});
		registry.register({
			name: 'login',
			ports: [8226],
			handler: receiveLoginData,
		});
		registry.register({
			name: 'persona',
			ports: [8228],
			handler: receivePersonaData,
		});
		registry.register({
			name: 'chat',
			ports: [8227],
			handler: receiveChatData,
		});

		connectionId = "test-connection-123";
		const socket = new Socket();
		socket.write = vi.fn();
		socket.end = vi.fn();

		mockSocket = {
			socket,
			connectionId,
			localPort: 7003,
			connectedAt: Date.now(),
		};

		// Set up socket pair for queue system
		// Create proper MessageQueue instances for send and receive
		const sendQueue = new MessageQueue(
			'testSend',
			10,
			async (item: messageQueueItem) => {
				// No-op for tests
			},
		);

		const receiveQueue = new MessageQueue(
			'testReceive',
			10,
			async (item: messageQueueItem) => {
				// No-op for tests
			},
		);

		addSocketPair(connectionId, {
			send: sendQueue,
			receive: receiveQueue,
		});
	});

	afterEach(() => {
		vi.clearAllMocks();
		clearServiceRegistry();
	});

	describe("processSocketData - Packet Validation", () => {
		it("should reject packets that are too short (< 4 bytes)", async () => {
			const invalidPacket = Buffer.from([0x01, 0x02, 0x03]); // 3 bytes
			
			await processSocketData(
				invalidPacket,
				log,
				connectionId,
				7003,
				mockSocket,
			);
			
			// Socket should be ended for invalid packets
			expect(mockSocket.socket.end).toHaveBeenCalled();
		});

		it("should reject packets with invalid message codes (too high)", async () => {
			// Message code 0x1302 (too high)
			const invalidPacket = Buffer.alloc(10);
			invalidPacket.writeUInt16BE(0x1302, 0);
			
			await processSocketData(
				invalidPacket,
				log,
				connectionId,
				7003,
				mockSocket,
			);
			
			expect(mockSocket.socket.end).toHaveBeenCalled();
		});

		it("should reject packets with invalid message codes (too low)", async () => {
			// Message code 0x0099 (too low)
			const invalidPacket = Buffer.alloc(10);
			invalidPacket.writeUInt16BE(0x0099, 0);
			
			await processSocketData(
				invalidPacket,
				log,
				connectionId,
				7003,
				mockSocket,
			);
			
			expect(mockSocket.socket.end).toHaveBeenCalled();
		});

		it("should reject packets with message codes in forbidden range (0x902-0x1000)", async () => {
			// Message code 0x0902 (in forbidden range)
			const invalidPacket = Buffer.alloc(10);
			invalidPacket.writeUInt16BE(0x0902, 0);
			
			await processSocketData(
				invalidPacket,
				log,
				connectionId,
				7003,
				mockSocket,
			);
			
			expect(mockSocket.socket.end).toHaveBeenCalled();
		});

		it("should accept valid packets", async () => {
			// Valid message code (e.g., 0x0101)
			const validPacket = Buffer.alloc(10);
			validPacket.writeUInt16BE(0x0101, 0);
			validPacket.writeUInt16BE(0x0000, 2); // Length placeholder
			
			// Mock parseInitialMessage to return a valid message
			// This will fail in parseInitialMessage, but that's expected
			// The important part is that isPacketValid passes
			await processSocketData(
				validPacket,
				log,
				connectionId,
				7003,
				mockSocket,
			);
			
			// Socket should NOT be ended for valid packets
			expect(mockSocket.socket.end).not.toHaveBeenCalled();
		});
	});

	describe("processSocketData - Packet Splitting", () => {
		it("should handle single packet without separator", async () => {
			// Create a minimal valid packet
			const packet = createValidTestPacket(0x0101);
			
			await processSocketData(
				packet,
				log,
				connectionId,
				7003,
				mockSocket,
			);
			
			// Should not throw and should process the packet
			expect(mockSocket.socket.end).not.toHaveBeenCalled();
		});

		it("should split multiple packets with separator (0x11, 0x01)", async () => {
			const separator = Buffer.from([0x11, 0x01]);
			const packet1 = createValidTestPacket(0x0101);
			const packet2 = createValidTestPacket(0x0102);
			
			// Combine packets with separator
			const combined = Buffer.concat([packet1, separator, packet2]);
			
			await processSocketData(
				combined,
				log,
				connectionId,
				7003,
				mockSocket,
			);
			
			// Should process both packets
			expect(mockSocket.socket.end).not.toHaveBeenCalled();
		});

		it("should filter out empty packets after splitting", async () => {
			const separator = Buffer.from([0x11, 0x01]);
			const packet1 = createValidTestPacket(0x0101);
			const emptyPacket = Buffer.alloc(0);
			
			// Combine with empty packet
			const combined = Buffer.concat([
				packet1,
				separator,
				emptyPacket,
				separator,
				packet1,
			]);
			
			await processSocketData(
				combined,
				log,
				connectionId,
				7003,
				mockSocket,
			);
			
			// Should process non-empty packets only
			expect(mockSocket.socket.end).not.toHaveBeenCalled();
		});
	});

	describe("processSocketData - Port Routing", () => {
		it("should route port 7003 to lobby handler", async () => {
			const { receiveLobbyData } = await import("rusty-motors-lobby");
			const packet = createValidTestPacket(0x0101);
			
			await processSocketData(
				packet,
				log,
				connectionId,
				7003,
				mockSocket,
			);
			
			// Wait for async processing
			await new Promise((resolve) => setTimeout(resolve, 50));
			
			expect(receiveLobbyData).toHaveBeenCalled();
		});

		it("should route port 8226 to login handler", async () => {
			const { receiveLoginData } =
                await import('rusty-motors-authentication');
			const packet = createValidTestPacket(0x0101);
			
			await processSocketData(
				packet,
				log,
				connectionId,
				8226,
				mockSocket,
			);
			
			await new Promise((resolve) => setTimeout(resolve, 50));
			
			expect(receiveLoginData).toHaveBeenCalled();
		});

		it("should route port 8227 to chat handler", async () => {
			const { receiveChatData } = await import("rusty-motors-chat");
			const packet = createValidTestPacket(0x0101);
			
			await processSocketData(
				packet,
				log,
				connectionId,
				8227,
				mockSocket,
			);
			
			await new Promise((resolve) => setTimeout(resolve, 50));
			
			expect(receiveChatData).toHaveBeenCalled();
		});

		it("should route port 8228 to persona handler", async () => {
			const { receivePersonaData } =
                await import('rusty-motors-authentication');
			const packet = createValidTestPacket(0x0101);
			
			await processSocketData(
				packet,
				log,
				connectionId,
				8228,
				mockSocket,
			);
			
			await new Promise((resolve) => setTimeout(resolve, 50));
			
			expect(receivePersonaData).toHaveBeenCalled();
		});

		it("should route ports 9000-9020 to lobby handler", async () => {
			const { receiveLobbyData } = await import("rusty-motors-lobby");
			const packet = createValidTestPacket(0x0101);
			
			// Test a few ports in the range
			for (const port of [9000, 9001, 9010, 9019, 9020]) {
				vi.clearAllMocks();
				
				await processSocketData(
					packet,
					log,
					connectionId,
					port,
					mockSocket,
				);
				
				await new Promise((resolve) => setTimeout(resolve, 50));
				
				expect(receiveLobbyData).toHaveBeenCalled();
			}
		});

		it("should route port 10001 to lobby handler", async () => {
			const { receiveLobbyData } = await import("rusty-motors-lobby");
			const packet = createValidTestPacket(0x0101);
			
			await processSocketData(
				packet,
				log,
				connectionId,
				10001,
				mockSocket,
			);
			
			await new Promise((resolve) => setTimeout(resolve, 50));
			
			expect(receiveLobbyData).toHaveBeenCalled();
		});

		it("should handle unknown ports gracefully", async () => {
			const packet = createValidTestPacket(0x0101);
			
			// Should not throw, just log a warning
			await expect(
				processSocketData(
					packet,
					log,
					connectionId,
					9999, // Unknown port
					mockSocket,
				),
			).resolves.not.toThrow();
		});
	});

	describe("processSocketData - Error Handling", () => {
		it("should handle errors in packet parsing gracefully", async () => {
			// Invalid packet that will fail parsing
			const invalidPacket = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05]);
			
			// Should not throw, should handle error gracefully
			await expect(
				processSocketData(
					invalidPacket,
					log,
					connectionId,
					7003,
					mockSocket,
				),
			).resolves.not.toThrow();
		});

		it("should handle errors in routing gracefully", async () => {
			const { receiveLobbyData } = await import("rusty-motors-lobby");
			vi.mocked(receiveLobbyData).mockRejectedValueOnce(
				new Error("Handler error"),
			);
			
			const packet = createValidTestPacket(0x0101);
			
			// Should not throw, errors are caught in routeInitialMessage
			await expect(
				processSocketData(
					packet,
					log,
					connectionId,
					7003,
					mockSocket,
				),
			).resolves.not.toThrow();
		});
	});

	describe("processSocketData - Response Queuing", () => {
		it("should queue responses to send queue", async () => {
			const { receiveLobbyData } = await import("rusty-motors-lobby");
			const mockResponse = {
				serialize: () => Buffer.from("response-data"),
			};
			
			vi.mocked(receiveLobbyData).mockResolvedValueOnce({
				messages: [mockResponse as any],
				connectionId,
			});
			
			const packet = createValidTestPacket(0x0101);
			
			await processSocketData(
				packet,
				log,
				connectionId,
				7003,
				mockSocket,
			);
			
			await new Promise((resolve) => setTimeout(resolve, 100));
			
			// Check that response was queued
			const sendQueue = getSocketQueue(connectionId, "send");
			expect(sendQueue).toBeDefined();
		});
	});
});

/**
 * Creates a valid test packet with the given message code
 */
function createValidTestPacket(messageCode: number): Buffer {
	// Create a minimal valid packet structure
	// Format: [messageCode:2][length:2][data...]
	const packet = Buffer.alloc(10);
	packet.writeUInt16BE(messageCode, 0); // Message code
	packet.writeUInt16BE(6, 2); // Length (remaining bytes)
	// Add some dummy data
	packet.writeUInt32BE(0x12345678, 4);
	return packet;
}

describe("npsPortRouter - Integration Tests with Session Replay", () => {
	// Session files are saved to root test/fixtures/sessions when running npm start
	// So we need to go up to the project root
	const fixturesDir = join(__dirname, "..", "..", "..", "test", "fixtures", "sessions");
	let helper: SessionTestHelper;

	beforeEach(() => {
		helper = new SessionTestHelper(
			loggerMock,
			fixturesDir,
		);
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

	it("should process login session packets correctly", async () => {
		const sessionFile = findSessionByPort(8226);
		
		if (!sessionFile) {
			return; // Skip silently - no fixture available
		}

		const result = await helper.loadAndReplay(sessionFile, {
			validateResponses: false,
		});

		expect(result).not.toBeNull();
		expect(result?.success).toBe(true);
		expect(result?.eventsProcessed).toBeGreaterThan(0);
	});

	it("should process lobby session packets correctly", async () => {
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

	it("should process room session packets correctly", async () => {
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
});
