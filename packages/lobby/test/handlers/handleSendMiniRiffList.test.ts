import { handleSendMiniRiffList } from "../../src/handlers/handleSendMiniRiffList.js";
import { describe, it, expect } from "vitest";
import { LegacyMessage } from "../../../shared";
import { mockLogger } from "../../../../test/factoryMocks.js";

describe("handleSendMiniRiffList", () => {
    it("should return a buffer", async () => {
        // arrange
        const incomingMessage = new LegacyMessage();

        const result = await handleSendMiniRiffList({
            connectionId: "test",
            message: incomingMessage,
            log: mockLogger(),
        });

        expect(result.message).toBeInstanceOf(LegacyMessage);
    });
});
