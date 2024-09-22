import { describe, it, expect } from "vitest";
import { writeZeroTerminatedString } from "./writeZeroTerminatedString.js";

describe("writeZeroTerminatedString", () => {
	it("should write a zero-terminated string to the buffer at the specified offset", () => {
		const buffer = Buffer.alloc(20);
		const offset = 5;
		const value = "hello";

		const newOffset = writeZeroTerminatedString(buffer, offset, value);

		expect(buffer.toString("utf8", offset, offset + value.length)).toBe(value);
		expect(buffer.readUInt8(offset + value.length)).toBe(0);
		expect(newOffset).toBe(offset + value.length + 1);
	});

	it("should handle an empty string correctly", () => {
		const buffer = Buffer.alloc(10);
		const offset = 2;
		const value = "";

		const newOffset = writeZeroTerminatedString(buffer, offset, value);

		expect(buffer.readUInt8(offset)).toBe(0);
		expect(newOffset).toBe(offset + 1);
	});

	it("should overwrite existing data in the buffer", () => {
		const buffer = Buffer.from("abcdefghij");
		const offset = 3;
		const value = "xyz";

		const newOffset = writeZeroTerminatedString(buffer, offset, value);

		expect(buffer.toString("utf8", 0, 10)).toBe("abcxyz\0hij");
		expect(newOffset).toBe(offset + value.length + 1);
	});

	it("should handle writing at the start of the buffer", () => {
		const buffer = Buffer.alloc(10);
		const offset = 0;
		const value = "start";

		const newOffset = writeZeroTerminatedString(buffer, offset, value);

		expect(buffer.toString("utf8", 0, value.length)).toBe(value);
		expect(buffer.readUInt8(value.length)).toBe(0);
		expect(newOffset).toBe(value.length + 1);
	});

	it("should handle writing at the end of the buffer", () => {
		const buffer = Buffer.alloc(10);
		const offset = 5;
		const value = "end";

		const newOffset = writeZeroTerminatedString(buffer, offset, value);

		expect(buffer.toString("utf8", offset, offset + value.length)).toBe(value);
		expect(buffer.readUInt8(offset + value.length)).toBe(0);
		expect(newOffset).toBe(offset + value.length + 1);
	});
});
