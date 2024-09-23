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

	it("should handle null input gracefully", () => {
		expect(() => bufferToHexString(null as any)).toThrow();
	});

	it("should handle undefined input gracefully", () => {
		expect(() => bufferToHexString(undefined as any)).toThrow();
	});

	it("should handle a very large buffer", () => {
		const largeBuffer = Buffer.alloc(10 ** 6, 0xff); // 1MB buffer filled with 0xff
		const hexString = bufferToHexString(largeBuffer);
		expect(hexString.length).toBe(2 * largeBuffer.length);
		expect(hexString).toMatch(/^ff+$/);
	});

	it("should handle a buffer with Unicode characters", () => {
		const buffer = Buffer.from("你好", "utf8");
		const hexString = bufferToHexString(buffer);
		expect(hexString).toBe(buffer.toString("hex"));
	});

	// Additional tests
	it("should handle a buffer with mixed byte values", () => {
		const buffer = Buffer.from([0x00, 0x7f, 0x80, 0xff]);
		const hexString = bufferToHexString(buffer);
		expect(hexString).toBe("007f80ff");
	});

	it("should handle a buffer with all possible byte values", () => {
		const buffer = Buffer.from(Array.from({ length: 256 }, (_, i) => i));
		const hexString = bufferToHexString(buffer);
		expect(hexString).toBe(
			"000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff"
		);
	});

	it("should handle a buffer with non-printable ASCII characters", () => {
		const buffer = Buffer.from([0x00, 0x1f, 0x7f, 0x80]);
		const hexString = bufferToHexString(buffer);
		expect(hexString).toBe("001f7f80");
	});
});
