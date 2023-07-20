import { describe, it, expect } from "vitest";
import { getLevelValue } from "@mcos/shared";

describe("Logger#getLevelValue()", (t) => {
    it("should return the numaric value of an error level name", () => {
        expect(getLevelValue("debug")).toEqual(7);
    });
});
