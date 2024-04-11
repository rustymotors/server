import { vi } from "vitest";
import { OldServerMessage, type TServerLogger } from "rusty-shared";
import { getLobbies } from "../src/getLobbies.js";
import { describe, expect, it } from "vitest";

describe("getLobbies", () => {
    it("should return a promise", async () => {
        // arrange
        const connectionId = "1";
        const packet = new OldServerMessage();
        const log: TServerLogger = {
            info: vi.fn(),
            error: vi.fn(),
            debug: vi.fn(),
            warn: vi.fn(),
            fatal: vi.fn(),
            trace: vi.fn(),
        };

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
