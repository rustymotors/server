import { describe, it, expect } from "vitest";
import { _generateSessionKeyBuffer } from "@mcos/lobby";

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
