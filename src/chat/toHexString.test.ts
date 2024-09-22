import { describe, it, expect } from "vitest";
import { bufferToHexString } from "./toHexString.js";

describe("bufferToHexString", () => {
	it("should convert a buffer to a hexadecimal string", () => {
		const buffer = Buffer.from([0x00, 0xff, 0x10, 0x20]);
		const hexString = bufferToHexString(buffer);
		expect(hexString).toBe("00ff1020");
	});

	it("should handle an empty buffer", () => {
		const buffer = Buffer.from([]);
		const hexString = bufferToHexString(buffer);
		expect(hexString).toBe("");
	});

	it("should pad single digit hex values with a leading zero", () => {
		const buffer = Buffer.from([0x1]);
		const hexString = bufferToHexString(buffer);
		expect(hexString).toBe("01");
	});

	it("should handle a buffer with multiple bytes", () => {
		const buffer = Buffer.from([
			0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0,
		]);
		const hexString = bufferToHexString(buffer);
		expect(hexString).toBe("123456789abcdef0");
	});
});
