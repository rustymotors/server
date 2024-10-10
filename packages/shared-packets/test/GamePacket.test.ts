import { describe, it, expect } from "vitest";
import { Buffer } from "buffer";
import { GamePacket } from "../src/GamePacket.js";

describe("GamePacket", () => {
	it("should deserialize correctly v0 correctly", () => {
		const buffer = Buffer.alloc(11);
		buffer.writeUInt16BE(1234, 0); // Message ID
		buffer.writeUInt16BE(11, 2); // Length

		buffer.write("test da", 4); // Data

		const packet = new GamePacket();
		packet.deserialize(buffer);

		expect(packet.getMessageId()).toBe(1234);
		expect(packet.getDataBuffer().toString("hex")).equals(
			Buffer.from("test da").toString("hex"),
		);
	});

	it("should deserialize correctly v1 correctly", () => {
		const buffer = Buffer.alloc(26);
		buffer.writeUInt16BE(1234, 0); // Message ID
		buffer.writeUInt16BE(11, 2); // Length
		buffer.writeUInt16BE(0x101, 4); // Version
		buffer.writeUInt32BE(11, 8); // Checksum
		buffer.write("test data", 12); // Data

		const packet = new GamePacket();
		packet.deserialize(buffer);

		expect(packet.getMessageId()).toBe(1234);
		expect(packet.getDataBuffer().toString("hex")).equals(
			Buffer.from("test data\u0000\u0000\u0000\u0000\u0000").toString("hex"),
		);
	});

	it("should throw error if data is insufficient for header", () => {
		const buffer = Buffer.alloc(5); // Less than required for header

		const packet = new GamePacket();
		expect(() => packet.deserialize(buffer)).toThrow(
			"Data is too short. Expected at least 6 bytes, got 5 bytes",
		);
	});

	it("should throw error if data is insufficient for full packet", () => {
		const buffer = Buffer.alloc(10); // Less than required for full packet
		buffer.writeUInt16BE(0x101, 4); // Version

		const packet = new GamePacket();
		expect(() => packet.deserialize(buffer)).toThrow(
			"Data is too short. Expected at least 12 bytes, got 10 bytes",
		);
	});

	it("should identify version correctly", () => {
		const buffer = Buffer.alloc(15);
		buffer.writeUInt16BE(11, 0); // Length
		buffer.writeUInt16BE(0x101, 4); // Version
		buffer.writeUInt16BE(1234, 6); // Message ID
		buffer.write("test data", 8, "utf8"); // Data

		const packet = new GamePacket();
		packet.deserialize(buffer);

		expect(packet.getVersion()).toBe(257);
	});

	it("should handle version 0 correctly", () => {
		const buffer = Buffer.alloc(15);
		buffer.writeUInt16BE(1234, 0); // Message ID
		buffer.writeUInt16BE(11, 4); // Length
		buffer.writeUInt16BE(0x100, 4); // Version
		buffer.write("test data", 8, "utf8"); // Data

		const packet = new GamePacket();
		packet.deserialize(buffer);

		expect(packet.getVersion()).toBe(0);
	});
});
