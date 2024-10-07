import { describe, it, expect } from "vitest";
import { ServerMessageHeader } from "./ServerMessageHeader.js";

describe("ServerMessageHeader", () => {
	it("should serialize correctly", () => {
		const header = new ServerMessageHeader();
		header.setLength(1234);
		header.setSignature("TOMC");
		header.setSequence(5678);
		header.setPayloadEncryption(true);

		const buffer = header.serialize();
		expect(buffer.length).toBe(header.getByteSize());
		expect(buffer.readUInt16LE(0)).toBe(1234);
		expect(buffer.toString("ascii", 2, 6)).toBe("TOMC");
		expect(buffer.readUInt32LE(6)).toBe(5678);
		expect(buffer.readUInt8(10)).toBe(0x08);
	});

	it("should deserialize correctly", () => {
		const buffer = Buffer.alloc(11);
		buffer.writeUInt16LE(1234, 0);
		buffer.write("TOMC", 2, 4, "ascii");
		buffer.writeUInt32LE(5678, 6);
		buffer.writeUInt8(0x08, 10);

		const header = new ServerMessageHeader();
		header.deserialize(buffer);

		expect(header.getLength()).toBe(1234);
		expect(header.isValidSignature()).toBe(true);
		expect(header.getSequence()).toBe(5678);
		expect(header.isPayloadEncrypted()).toBe(true);
	});

	it("should validate signature correctly", () => {
		const header = new ServerMessageHeader();
		header.setSignature("TOMC");
		expect(header.isValidSignature()).toBe(true);

		header.setSignature("INVALID");
		expect(header.isValidSignature()).toBe(false);
	});

	it("should set and get payload encryption correctly", () => {
		const header = new ServerMessageHeader();
		header.setPayloadEncryption(true);
		expect(header.isPayloadEncrypted()).toBe(true);

		header.setPayloadEncryption(false);
		expect(header.isPayloadEncrypted()).toBe(false);
	});

	it("should convert to string correctly", () => {
		const header = new ServerMessageHeader();
		header.setLength(1234);
		header.setSignature("TOMC");
		header.setSequence(5678);
		header.setPayloadEncryption(true);

		const str = header.toString();
		expect(str).toBe(
			"ServerMessageHeader {length: 1234, signature: TOMC, sequence: 5678, flags: 8}",
		);
	});

	it("should convert to hex string correctly", () => {
		const header = new ServerMessageHeader();
		header.setLength(1234);
		header.setSignature("TOMC");
		header.setSequence(5678);
		header.setPayloadEncryption(true);

		const hexStr = header.toHexString();
		expect(hexStr).toBe(header.serialize().toString("hex"));
	});
});
