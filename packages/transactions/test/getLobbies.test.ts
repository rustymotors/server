import { getServerLogger, OldServerMessage } from "@rustymotors/shared";
import { getLobbies } from "../src/getLobbies.js";
import { describe, expect, it } from "vitest";

describe("getLobbies", () => {
    it("should return a promise", async () => {
        // arrange
        const connectionId = "1";
        const packet = new OldServerMessage();
        const log = getServerLogger({
            level: "silent",
        });

        // act
        const result = await getLobbies({
            connectionId,
            packet,
            log,
        });

        const resultMessage = result.messages[0].serialize().toString("hex");

        // assert
        expect(resultMessage).toMatch(/4102544f4d43/);
    });
});
