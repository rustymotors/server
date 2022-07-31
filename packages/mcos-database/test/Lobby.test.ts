import { expect } from "chai";
import { Lobby } from "../src/models/Lobby.js";

describe("Lobby model", function () {
  it("should have a schema property", function () {
    expect(Lobby.schema).not.equal("");
  });
});
