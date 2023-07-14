import { describe, it, test } from "vitest";
import { equal } from "node:assert/strict";
import { getLevelValue } from "./log.js";

describe("Logger#getLevelValue()", (t) => {
    it("should return the numaric value of an error level name", () => {
        equal(getLevelValue("debug"), 7);
    });
});
