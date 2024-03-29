import { OldServerMessage } from "../../shared";
import { getLobbies } from "../src/getLobbies.js";
import { describe, expect, it } from "vitest";
import { mockLogger } from "../../../test/factoryMocks.js";
import { assert } from "console";

describe("getLobbies", () => {
    it("should return a promise", async () => {
        // arrange
        const connectionId = "1";
        const packet = new OldServerMessage();
        const log = mockLogger();

        // act
        const result = await getLobbies({
            connectionId,
            packet,
            log,
        });

        if (result.messages[0] === undefined) {
            throw new Error("Expected messages to be defined");
        }

        const resultMessage = result.messages[0].serialize().toString("hex");

        // assert
        expect(resultMessage).toMatch(/4102544f4d43/);
    });
});
