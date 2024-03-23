import { OldServerMessage } from "../../shared";
import { trackingPing } from "../src/trackingPing.js";
import { describe, test, expect } from "vitest";
import { mockLogger } from "../../../test/factoryMocks.js";

describe("trackingPing", () => {
    test("does not return a message", async () => {
        // arrange
        const inboundMessage = new OldServerMessage();

        const log = mockLogger();

        // act
        const { messages } = await trackingPing({
            connectionId: "test",
            packet: inboundMessage,
            log,
        });
        expect(messages.length).toBe(0);
    });
});
