import { describe, expect, it } from "vitest";
import { buildUserValidBody } from "../src/login/login.js";

/**
 * Reads a body the way the client does: fixed fields in order, and each record
 * read field by field and then skipped by its uint16 length prefix.
 */
function readLikeClient(body: Buffer) {
	let cursor = 0;
	const u32 = () => {
		const value = body.readUInt32BE(cursor);
		cursor += 4;
		return value;
	};
	const u16 = () => {
		const value = body.readUInt16BE(cursor);
		cursor += 2;
		return value;
	};
	const lengthString = (maxLength: number) => {
		const length = u16();
		expect(length).toBeLessThanOrEqual(maxLength);
		const text = body.subarray(cursor, cursor + length).toString("ascii");
		cursor += length;
		return text;
	};
	const record = <T>(readFields: () => T): T => {
		const length = u16();
		const recordStart = cursor;
		const fields = readFields();
		expect(cursor - recordStart).toBe(length);
		return fields;
	};
	const banOrGag = () => ({
		unknown: u32(),
		start: u32(),
		end: u32(),
		texts: [lengthString(64), lengthString(256), lengthString(256)],
	});

	const customerId = u32();
	const profileId = u32();
	const isCacheHit = body.readUInt8(cursor);
	cursor += 1;
	const ban = record(banOrGag);
	const gag = record(banOrGag);
	const key = record(() => ({ text: lengthString(32), value: u32() }));
	const trailingValue = u32();
	const trailingText = lengthString(64);
	return {
		customerId,
		profileId,
		isCacheHit,
		ban,
		gag,
		key,
		trailingValue,
		trailingText,
		consumed: cursor,
	};
}

describe("buildUserValidBody", () => {
	it("produces a body the client reads to exactly its end", () => {
		const body = buildUserValidBody(5551212, 2);
		const parsed = readLikeClient(body);
		expect(body.length).toBe(63);
		expect(parsed.consumed).toBe(body.length);
	});

	it("carries the customer and profile IDs and no cache hit", () => {
		const parsed = readLikeClient(buildUserValidBody(5551212, 2));
		expect(parsed.customerId).toBe(5551212);
		expect(parsed.profileId).toBe(2);
		expect(parsed.isCacheHit).toBe(0);
	});

	it("sends inactive ban and gag records (start of zero means not active)", () => {
		const parsed = readLikeClient(buildUserValidBody(5551212, 2));
		for (const record of [parsed.ban, parsed.gag]) {
			expect(record.start).toBe(0);
			expect(record.end).toBe(0);
			expect(record.texts).toEqual(["", "", ""]);
		}
	});

	it("prefixes each record with its exact size", () => {
		const body = buildUserValidBody(1, 1);
		// ban record length at offset 9, gag after it, key record after that
		expect(body.readUInt16BE(9)).toBe(18);
		expect(body.readUInt16BE(9 + 2 + 18)).toBe(18);
		expect(body.readUInt16BE(9 + 2 + 18 + 2 + 18)).toBe(6);
	});
});
