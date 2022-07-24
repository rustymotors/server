import { expect } from "chai";
import { _generateSessionKeyBuffer } from "..//src/handlers/requestConnectGameServer.js";

describe("_generateSessionKeyBuffer", function () {
  it("should return a buffer", function () {
    // arrange
    const inputString = "Test String";

    // act
    const result = _generateSessionKeyBuffer(inputString);

    // assert
    expect(Buffer.isBuffer(result)).is.true;
  });
});
