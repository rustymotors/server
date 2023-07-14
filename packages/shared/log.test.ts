import { test } from "node:test";
import { equal } from "node:assert/strict";
import { getLevelValue } from "./log.js";

test("Logger#getLevelValue()", async (t) => {
    t.test("should return the numaric value of an error level name", () => {
        equal(getLevelValue("debug"), 7);
    });
});
