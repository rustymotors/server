import { OldServerMessage, type TServerLogger } from "rusty-shared";
import { trackingPing } from "../src/trackingPing.js";
import { describe, test, expect, vi } from "vitest";

describe("trackingPing", () => {
    test("does not return a message", async () => {
        // arrange
        const inboundMessage = new OldServerMessage();

        const log: TServerLogger = {
            info: vi.fn(),
            error: vi.fn(),
            debug: vi.fn(),
            warn: vi.fn(),
            fatal: vi.fn(),
            trace: vi.fn(),
        };

        // act
        const { messages } = await trackingPing({
            connectionId: "test",
            packet: inboundMessage,
            log,
        });
        expect(messages.length).toBe(0);
    });
});
