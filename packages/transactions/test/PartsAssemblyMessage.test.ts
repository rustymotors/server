import { describe, expect, it } from "vitest";
import { Part, PartsAssemblyMessage } from "../src/PartsAssemblyMessage.js";

describe("PartsAssemblyMessage", () => {
	it("should serialize", () => {
		// Arrange
		const message = new PartsAssemblyMessage(100);
		message._msgNo = 100;

		// Act
		const buffer = message.serialize();

		// Assert — 8-byte header: WORD msgNo + DWORD ownerId + WORD noParts
		expect(buffer).toEqual(
			Buffer.from([0x64, 0x00, 0x64, 0x00, 0x00, 0x00, 0x00, 0x00]),
		);
	});
});

describe("PartsAssemblyMessage wire format", () => {
	it("header is exactly 8 bytes: WORD msgNo + DWORD ownerId + WORD noParts", () => {
		const message = new PartsAssemblyMessage(0);
		expect(message.serialize().length).toBe(8);
	});

	it("each part adds exactly 26 bytes", () => {
		const message = new PartsAssemblyMessage(0);
		message._partList = [new Part(), new Part(), new Part()];
		message._numberOfParts = 3;
		expect(message.serialize().length).toBe(8 + 3 * 26);
	});

	it("part bytes follow immediately after the 8-byte header", () => {
		const part = new Part();
		part._partId = 0xdeadbeef;

		const message = new PartsAssemblyMessage(1);
		message._msgNo = 184;
		message._numberOfParts = 1;
		message._partList = [part];

		const buf = message.serialize();
		// partId starts at byte 8
		expect(buf.readUInt32LE(8)).toBe(0xdeadbeef);
	});
});

describe("Part", () => {
	it("should serialize", () => {
		// Arrange
		const message = new Part();
		message._partId = 100; // 0x64
		message._parentPartId = 200; // 0xc8
		message._brandedPartId = 300; // 0x12c
		message._repairPrice = 400; // 0x190
		message._junkPrice = 500; // 0x1f4
		message._wear = 600; // 0x258
		message._attachmentPoint = 7; // 0x7
		message._damage = 8; // 0x8

		// Act
		const buffer = message.serialize();

		// Assert — 26 bytes exactly: 6 DWORDs + 2 BYTEs, no padding.
		expect(buffer.length).toBe(26);
		expect(buffer).toEqual(
			Buffer.from([
				0x64, 0x00, 0x00, 0x00, 0xc8, 0x00, 0x00, 0x00, 0x2c, 0x01, 0x00, 0x00,
				0x90, 0x01, 0x00, 0x00, 0xf4, 0x01, 0x00, 0x00, 0x58, 0x02, 0x00, 0x00,
				0x07, 0x08,
			]),
		);
	});
});
