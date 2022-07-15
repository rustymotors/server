import { expect } from "chai";
import { PlayerModel } from "./Player.js";

describe("Player model", function() {
  it("should have a schema property", function() {
    expect(PlayerModel.schema).not.equal('')
  })
})
