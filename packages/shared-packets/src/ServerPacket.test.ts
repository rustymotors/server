import { describe, it, expect } from "vitest";
import { Buffer } from "buffer";
import { ServerMessagePayload } from "./ServerMessagePayload.js";
import { ServerPacket } from "./ServerPacket.js";

describe("ServerMessagePayload", () => {
	it("should serialize correctly", () => {
		const payload = new ServerMessagePayload();
		payload.setMessageId(1234);
		payload["_data"] = Buffer.from("test data");

		const buffer = payload.serialize();
		expect(buffer.length).toBe(payload.getByteSize());
		expect(buffer.readUInt16LE(0)).toBe(1234);
		expect(buffer.toString("utf8", 2)).toBe("test data");
	});

	it("should deserialize correctly", () => {
		const buffer = Buffer.alloc(11);
		buffer.writeUInt16LE(1234, 0);
		buffer.write("test data", 2, "utf8");

		const payload = new ServerMessagePayload();
		payload.deserialize(buffer);

		expect(payload.getMessageId()).toBe(1234);
		expect(payload["_data"].toString("utf8")).toBe("test data");
	});

	it("should get and set messageId correctly", () => {
		const payload = new ServerMessagePayload();
		payload.setMessageId(1234);
		expect(payload.getMessageId()).toBe(1234);

		payload.setMessageId(5678);
		expect(payload.getMessageId()).toBe(5678);
	});

	describe("ServerPacket", () => {
		it("should serialize correctly", () => {
			const packet = new ServerPacket(1234);
			packet.setLength(11);
			packet.setSignature("TOMC");
			packet.setSequence(5678);
			packet.setPayloadEncryption(true);

			const buffer = packet.serialize();
			expect(buffer.length).toBe(packet.getByteSize());
			expect(buffer.readUInt16LE(0)).toBe(11);
			expect(buffer.toString("ascii", 2, 6)).toBe("TOMC");
			expect(buffer.readUInt32LE(6)).toBe(5678);
			expect(buffer.readUInt8(10)).toBe(0x08);
			expect(buffer.readUInt16LE(11)).toBe(1234);
		});

		it("should deserialize correctly", () => {
			const buffer = Buffer.alloc(13);
			buffer.writeUInt16LE(11, 0);
			buffer.write("TOMC", 2, 4, "ascii");
			buffer.writeUInt32LE(5678, 6);
			buffer.writeUInt8(0x08, 10);
			buffer.writeUInt16LE(1234, 11);

			const packet = new ServerPacket(0);
			packet.deserialize(buffer);

			expect(packet.getLength()).toBe(11);
			expect(packet.isValidSignature()).toBe(true);
			expect(packet.getSequence()).toBe(5678);
			expect(packet.isPayloadEncrypted()).toBe(true);
			expect(packet.getMessageId()).toBe(1234);
		});

		it("should throw error if signature is invalid during serialization", () => {
			const packet = new ServerPacket(1234);
			packet.setLength(11);
			packet.setSignature("INVALID");
			packet.setSequence(5678);
			packet.setPayloadEncryption(true);

			expect(() => packet.serialize()).toThrow(
				"ServerMessage signature is invalid, it must be set to 'TOMC' before serializing",
			);
		});

		it("should throw error if sequence is zero during serialization", () => {
			const packet = new ServerPacket(1234);
			packet.setLength(11);
			packet.setSignature("TOMC");
			packet.setSequence(0);
			packet.setPayloadEncryption(true);

			expect(() => packet.serialize()).toThrow(
				"ServerPacket sequence is 0, it must be set to a non-zero value before serializing",
			);
		});

		it("should convert to string correctly", () => {
			const packet = new ServerPacket(1234);
			packet.setLength(11);
			packet.setSignature("TOMC");
			packet.setSequence(5678);
			packet.setPayloadEncryption(true);

			const str = packet.toString();
			expect(str).toBe("ServerPacket {length: 11, sequence: 5678, messageId: 1234}");
		});
	});
});
