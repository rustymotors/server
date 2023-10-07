import { LegacyMessage } from "../../../shared/messageFactory.js";
import { handleSendMiniRiffList } from "../../src/handlers/handleSendMiniRiffList.js";
import { describe, it, expect } from "vitest";

describe("handleSendMiniRiffList", () => {
    it("should return a buffer", () => {
        // arrange
        const incomingMessage = new LegacyMessage();

        const result = handleSendMiniRiffList({
            connectionId: "test",
            message: incomingMessage,
        });

        expect(result.message).toBeInstanceOf(LegacyMessage);
    });
});
