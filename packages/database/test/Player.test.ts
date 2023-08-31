import { describe, it, expect } from "vitest";
import { PlayerModel } from "../index.js";

describe("Player model", function () {
    it("should have a schema property", function () {
        expect(PlayerModel.schema).not.equal("");
    });
});
