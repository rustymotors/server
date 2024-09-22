import { describe, it, expect } from "vitest";
import { timestampToTime32T } from "./timestampToTimeT.js";

describe("timestampToTime32T", () => {
	it("should convert milliseconds to seconds correctly", () => {
		expect(timestampToTime32T(1000)).toBe(1);
		expect(timestampToTime32T(2000)).toBe(2);
		expect(timestampToTime32T(1500)).toBe(1);
		expect(timestampToTime32T(0)).toBe(0);
	});

	it("should handle large timestamps correctly", () => {
		expect(timestampToTime32T(1609459200000)).toBe(1609459200); // 2021-01-01T00:00:00Z
	});

	it("should handle negative timestamps correctly", () => {
		expect(timestampToTime32T(-1000)).toBe(-1);
		expect(timestampToTime32T(-2000)).toBe(-2);
	});

	it("should handle edge cases correctly", () => {
		expect(timestampToTime32T(Number.MAX_SAFE_INTEGER)).toBe(
			Math.floor(Number.MAX_SAFE_INTEGER / 1000),
		);
		expect(timestampToTime32T(Number.MIN_SAFE_INTEGER)).toBe(
			Math.floor(Number.MIN_SAFE_INTEGER / 1000),
		);
	});
});
