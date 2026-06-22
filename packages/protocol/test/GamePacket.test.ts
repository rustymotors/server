import { describe, it, expect } from "vitest";
import { Buffer } from "buffer";
import { GamePacket } from "../src/GamePacket.js";

describe("GamePacket", () => {
	it("should deserialize v0 correctly", () => {
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

	it("should deserialize v1 correctly", () => {
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

	it("should be able to make a copy of the packet", () => {
		const buffer = Buffer.alloc(11);
		buffer.writeUInt16BE(1234, 0); // Message ID
		buffer.writeUInt16BE(11, 2); // Length
		buffer.write("test da", 4); // Data

		const packet = new GamePacket();
		packet.deserialize(buffer);

		const copy = GamePacket.copy(packet);
		expect(copy.serialize().toString("hex")).equals(packet.serialize().toString("hex"));
	});

	it("should be able to make a copy of the packet with new data", () => {
		const buffer = Buffer.alloc(11);
		buffer.writeUInt16BE(1234, 0); // Message ID
		buffer.writeUInt16BE(11, 2); // Length
		buffer.write("test da", 4); // Data

		const packet = new GamePacket();
		packet.deserialize(buffer);

		const copy = GamePacket.copy(packet, Buffer.from("new data"));
		expect(copy.serialize().toString("hex")).not.equals(packet.serialize().toString("hex"));
	});

	it("should throw error if data is insufficient for header", () => {
		const buffer = Buffer.alloc(3); // Less than required for header

		const packet = new GamePacket();
		expect(() => packet.deserialize(buffer)).toThrow(
			"Data is too short. Expected at least 4 bytes, got 3 bytes",
		);
	});

	it("should throw error if checksum is incorrect for v1 packet", () => {
		const buffer = Buffer.alloc(26);
		buffer.writeUInt16BE(1234, 0); // Message ID
		buffer.writeUInt16BE(11, 2); // Length
		buffer.writeUInt16BE(0x101, 4); // Version
		buffer.writeUInt32BE(26, 8); // Checksum
		buffer.write("test data", 12); // Data

		buffer.writeUInt32BE(0, 8); // Incorrect checksum

		const packet = new GamePacket();
		expect(() => packet.deserialize(buffer)).toThrow(
			"Checksum mismatch. Expected 11, got 0",
		);
	});

	it("should throw error if data is insufficient for full v1 packet", () => {
		const buffer = Buffer.alloc(25); // 1 byte less than required for v1 packet
		buffer.writeUInt16BE(1234, 0); // Message ID
		buffer.writeUInt16BE(26, 2);  // Length
		buffer.writeUInt16BE(0x101, 4); // Version
		buffer.writeUInt32BE(26, 8); // Checksum
	
		const packet = new GamePacket();
		expect(() => packet.deserialize(buffer)).toThrow(
			"Data is too short. Expected at least 26 bytes, got 25 bytes"
		);
	});

	it("should identify version v1 correctly", () => {
		const buffer = Buffer.alloc(15);
		buffer.writeUInt16BE(1234, 0); // Message ID
		buffer.writeUInt16BE(11, 2); // Length
		buffer.writeUInt16BE(0x101, 4); // Version
		buffer.writeUInt32BE(11, 8); // Checksum
		buffer.write("test data", 12, "utf8"); // Data

		const packet = new GamePacket();
		packet.deserialize(buffer);

		expect(packet.getVersion()).toBe(257);
	});

	it("should handle version v0 correctly", () => {
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

// Wire-format snapshots for GamePacket.
// v0 = 4-byte header [id:2 BE][length:2 BE]
// v257 = 12-byte header [id:2][length:2][0x0101:2][padding:2][checksum:4], checksum === length
describe("GamePacket wire snapshots", () => {
	it("v0: id=0x0201 length=6 payload=[aa bb] produces fixed hex", () => {
		const input = Buffer.from("020100 06aabb".replace(" ", ""), "hex");
		const packet = new GamePacket();
		packet.deserialize(input);
		// Wire layout (6 bytes):
		//   [02 01]   id=0x0201 as UInt16BE
		//   [00 06]   length=6 as UInt16BE
		//   [aa bb]   payload
		expect(packet.serialize().toString("hex")).toBe("020100 06aabb".replace(" ", ""));
	});

	it("v0: round-trips unchanged", () => {
		const original = "020100 06aabb".replace(" ", "");
		const packet = new GamePacket();
		packet.deserialize(Buffer.from(original, "hex"));
		expect(packet.serialize().toString("hex")).toBe(original);
	});

	it("v257: id=0x0201 length=14 payload=[aa bb] produces fixed hex", () => {
		// Build a valid v257 buffer: checksum (at offset 8) must equal length (at offset 2)
		const input = Buffer.alloc(14);
		input.writeUInt16BE(0x0201, 0); // id
		input.writeUInt16BE(14, 2);     // length=14 (12 header + 2 payload)
		input.writeUInt16BE(0x0101, 4); // version=257
		input.writeUInt16BE(0, 6);      // padding=0
		input.writeUInt32BE(14, 8);     // checksum=length
		input[12] = 0xaa;
		input[13] = 0xbb;

		const packet = new GamePacket();
		packet.deserialize(input);

		// Wire layout (14 bytes):
		//   [02 01]         id
		//   [00 0e]         length=14
		//   [01 01]         version=257
		//   [00 00]         padding=0
		//   [00 00 00 0e]   checksum=14
		//   [aa bb]         payload
		expect(packet.serialize().toString("hex")).toBe("0201000e010100000000000eaabb");
	});

	it("v257: round-trips unchanged", () => {
		const original = "0201000e010100000000000eaabb";
		const packet = new GamePacket();
		packet.deserialize(Buffer.from(original, "hex"));
		expect(packet.serialize().toString("hex")).toBe(original);
	});
});
