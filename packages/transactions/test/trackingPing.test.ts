import { getServerLogger, OldServerMessage } from "@rustymotors/shared";
import { trackingPing } from "../src/trackingPing.js";
import { describe, test, expect, vi } from "vitest";

describe("trackingPing", () => {
    test("does not return a message", async () => {
        // arrange
        const inboundMessage = new OldServerMessage();

        const log = getServerLogger({
            level: "silent",
        });

        // act
        const { messages } = await trackingPing({
            connectionId: "test",
            packet: inboundMessage,
            log,
        });
        expect(messages.length).toBe(0);
    });
});
