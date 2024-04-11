import { describe, it, expect } from "vitest";
import { ShardEntry } from "../src/shard-entry.js";

describe("ShardEntry#formatForShardList()", () => {
    it("should return a formatted list", () => {
        // arrange
        const expectedText = "LoginServerIP=0.0.0.0";
        const entry = new ShardEntry(
            "TestEntry",
            "Not a real shard",
            999,
            "0.0.0.0",
            0,
            "0.0.0.0",
            0,
            "0.0.0.0",
            -1,
            "Test only, no login",
            "TestShards",
            0,
            0,
            "0.0.0.0",
            0,
        );

        // act
        const result = entry.formatForShardList();

        // assert
        expect(result).to.be.contain(expectedText);
    });
});
