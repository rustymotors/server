import { describe, it } from "node:test";
import { expect } from "chai";
import { PlayerModel } from "@mcos/database";

describe("Player model", function () {
    it("should have a schema property", function () {
        expect(PlayerModel.schema).not.equal("");
    });
});
