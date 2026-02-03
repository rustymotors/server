import { describe, it, expect } from "vitest";
import { GameMessageHeader } from "../src/GameMessageHeader.js";

describe("GameMessageHeader", () => {
	it("should serialize and deserialize correctly for version 0", () => {
		const header = new GameMessageHeader();
		header.setId(1234);
		header.setLength(5678);
		header.setVersion(0);

		const buffer = header.serialize();
		expect(buffer.length).toBe(4);
		expect(buffer.readUInt16BE(0)).toBe(1234);
		expect(buffer.readUInt16BE(2)).toBe(5678);

		const newHeader = new GameMessageHeader();
		newHeader.setVersion(0);
		newHeader.deserialize(buffer);

		expect(newHeader.getId()).toBe(1234);
		expect(newHeader.getLength()).toBe(5678);
	});

	it("should serialize and deserialize correctly for version 257", () => {
		const header = new GameMessageHeader();
		header.setId(1234);
		header.setLength(5678);
		header.setVersion(257);

		const buffer = header.serialize();
		expect(buffer.length).toBe(12);
		expect(buffer.readUInt16BE(0)).toBe(1234);
		expect(buffer.readUInt16BE(2)).toBe(5678);
		expect(buffer.readUInt16BE(4)).toBe(257);
		expect(buffer.readUInt32BE(8)).toBe(5678);

		const newHeader = new GameMessageHeader();
		newHeader.setVersion(257);
		newHeader.deserialize(buffer);

		expect(newHeader.getId()).toBe(1234);
		expect(newHeader.getLength()).toBe(5678);
		expect(newHeader.getVersion()).toBe(257);
	});

	it("should throw error if data is too short during deserialization", () => {
		const header = new GameMessageHeader();
		const buffer = Buffer.alloc(2);

		expect(() => header.deserialize(buffer)).toThrow(
			"Data is too short. Expected at least 4 bytes, got 2 bytes",
		);
	});

	it("should set and get payload encryption status correctly", () => {
		const header = new GameMessageHeader();
		header.setPayloadEncryption(true);
		expect(header.isPayloadEncrypted()).toBe(true);

		header.setPayloadEncryption(false);
		expect(header.isPayloadEncrypted()).toBe(false);
	});

	it("should convert to string correctly", () => {
		const header = new GameMessageHeader();
		header.setId(1234);
		header.setLength(5678);
		header.setVersion(257);

		const str = header.toString();
		expect(str).toBe(
			"GameMessageHeader {id: 1234, length: 5678, version: 257}",
		);
	});

	it("should copy correctly", () => {
		const header = new GameMessageHeader();
		header.setId(1234);
		header.setLength(5678);
		header.setVersion(257);

		const copiedHeader = GameMessageHeader.copy(header);
		expect(copiedHeader.getId()).toBe(1234);
		expect(copiedHeader.getLength()).toBe(5678);
		expect(copiedHeader.getVersion()).toBe(257);
	});
});
