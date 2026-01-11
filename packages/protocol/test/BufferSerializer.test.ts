import { describe, it, expect, beforeEach } from "vitest";
import { BufferSerializer } from "../src/BufferSerializer.js";

describe("BufferSerializer", () => {
	let bufferSerializer: BufferSerializer;

	beforeEach(() => {
		bufferSerializer = new BufferSerializer();
	});

	it("should initialize with a buffer of length 4", () => {
		expect(bufferSerializer.getByteSize()).toBe(4);
	});

	it("should serialize data to a buffer", () => {
		const serializedData = bufferSerializer.serialize();
		expect(serializedData).toBeInstanceOf(Buffer);
		expect(serializedData.length).toBe(4);
	});

	it("should deserialize data from a buffer", () => {
		const newData = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);
		bufferSerializer.deserialize(newData);
		expect(bufferSerializer.getByteSize()).toBe(newData.length);
		expect(bufferSerializer.serialize()).toEqual(newData);
	});

	it("should throw an error if data is too short in _assertEnoughData", () => {
		const shortData = Buffer.from([1, 2]);
		expect(() => bufferSerializer["_assertEnoughData"](shortData, 4)).toThrow(
			RangeError,
		);
	});

	it("should not throw an error if data is sufficient in _assertEnoughData", () => {
		const sufficientData = Buffer.from([1, 2, 3, 4]);
		expect(() =>
			bufferSerializer["_assertEnoughData"](sufficientData, 4),
		).not.toThrow();
	});

	it("should return the correct byte size of the data", () => {
		const newData = Buffer.from([1, 2, 3, 4, 5]);
		bufferSerializer.deserialize(newData);
		expect(bufferSerializer.getByteSize()).toBe(5);
	});

	it("should convert serialized data to a hexadecimal string", () => {
		const newData = Buffer.from([0x1, 0x2, 0x3, 0x4]);
		bufferSerializer.deserialize(newData);
		expect(bufferSerializer.toHexString()).toBe("01020304");
	});

	it("should add a leading zero if the hex string length is odd", () => {
		const newData = Buffer.from([0x1, 0x2, 0x3]);
		bufferSerializer.deserialize(newData);
		expect(bufferSerializer.toHexString()).toBe("010203");
	});
});
