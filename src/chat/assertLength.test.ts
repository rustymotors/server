import { describe, it, expect } from "vitest";
import { assertLength } from "./assertLength.js";

describe("assertLength", () => {
	it("should not throw an error when actual length matches expected length", () => {
		expect(() => assertLength(5, 5)).not.toThrow();
	});

	it("should throw an error when actual length does not match expected length", () => {
		expect(() => assertLength(4, 5)).toThrow("Expected length 5, but got 4");
	});

	it("should throw an error with the correct message when lengths do not match", () => {
		expect(() => assertLength(3, 5)).toThrow(Error);
		expect(() => assertLength(3, 5)).toThrow("Expected length 5, but got 3");
	});

	it("should not throw an error for zero lengths when they match", () => {
		expect(() => assertLength(0, 0)).not.toThrow();
	});

	it("should throw an error for zero actual length when expected length is non-zero", () => {
		expect(() => assertLength(0, 1)).toThrow("Expected length 1, but got 0");
	});

	it("should throw an error for non-zero actual length when expected length is zero", () => {
		expect(() => assertLength(1, 0)).toThrow("Expected length 0, but got 1");
	});

	it("should throw an error when actual length is negative", () => {
		expect(() => assertLength(-1, 5)).toThrow("Expected length 5, but got -1");
	});

	it("should throw an error when expected length is negative", () => {
		expect(() => assertLength(5, -1)).toThrow("Expected length -1, but got 5");
	});

	it("should not throw an error for very large matching lengths", () => {
		const largeNumber = Number.MAX_SAFE_INTEGER;
		expect(() => assertLength(largeNumber, largeNumber)).not.toThrow();
	});

	it("should throw an error for very large non-matching lengths", () => {
		const largeNumber = Number.MAX_SAFE_INTEGER;
		expect(() => assertLength(largeNumber, largeNumber - 1)).toThrow(
			`Expected length ${largeNumber - 1}, but got ${largeNumber}`,
		);
	});
});
