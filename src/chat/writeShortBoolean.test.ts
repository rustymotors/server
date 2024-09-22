import { describe, it, expect } from "vitest";
import { writeShortBooleanBE } from "./writeShortBoolean.js";

describe("writeShortBooleanBE", () => {
	it("should write 1 for true at the specified offset", () => {
		const buffer = Buffer.alloc(4);
		writeShortBooleanBE(buffer, 2, true);
		expect(buffer.readUInt16BE(2)).toBe(1);
	});

	it("should write 0 for false at the specified offset", () => {
		const buffer = Buffer.alloc(4);
		writeShortBooleanBE(buffer, 2, false);
		expect(buffer.readUInt16BE(2)).toBe(0);
	});

	it("should not affect other parts of the buffer", () => {
		const buffer = Buffer.alloc(4);
		buffer.writeUInt16BE(0x1234, 0);
		writeShortBooleanBE(buffer, 2, true);
		expect(buffer.readUInt16BE(0)).toBe(0x1234);
	});

	it("should throw an error if the offset is out of bounds", () => {
		const buffer = Buffer.alloc(2);
		expect(() => writeShortBooleanBE(buffer, 2, true)).toThrow();
	});
});
