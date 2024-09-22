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
		try {
			assertLength(3, 5);
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect((e as Error).message).toBe("Expected length 5, but got 3");
		}
	});
});
