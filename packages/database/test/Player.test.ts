import { describe, it, expect } from "vitest";
import { expect } from "chai";
import { PlayerModel } from "@mcos/database";

describe("Player model", function () {
    it("should have a schema property", function () {
        expect(PlayerModel.schema).not.equal("");
    });
});
