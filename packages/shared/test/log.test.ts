import { describe, it, expect } from "vitest";
import { getLevelValue } from "../index.js";

describe("Logger#getLevelValue()", () => {
    it("should return the numaric value of an error level name", () => {
        expect(getLevelValue("debug")).toEqual(7);
    });
});
