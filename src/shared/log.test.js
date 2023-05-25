import { describe, it } from "mocha";
import { equal } from "node:assert/strict";
import { getLevelValue } from "./logger.js";


describe("Logger", () => {
    describe("getLevelValue()", () => {
        it("should return the numaric value of an error level name", () => {
            equal(getLevelValue("debug"), 7)
        })
    })
})
