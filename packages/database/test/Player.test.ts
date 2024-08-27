import { describe, expect, it } from "vitest";
import { PlayerModel } from "../src/models/Player.js";

describe("Player model", function () {
	it("should have a schema property", function () {
		expect(PlayerModel.schema).not.equal("");
	});
});
