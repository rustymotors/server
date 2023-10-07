import { P } from "vitest/dist/reporters-5f784f42.js";
import { getServerLogger } from "../../shared/log.js";
import { ServerMessage } from "../../shared/messageFactory.js";
import { trackingPing } from "../src/trackingPing.js";
import { describe, test, expect, vi } from "vitest";

describe("trackingPing", () => {
    test("returns a GenericReplyMessage with a opcode of 101", async () => {
        // arrange
        const inboundMessage = new ServerMessage();
        vi.mock("pino", async () => {
            const actual = await vi.importActual("pino");
            return {
                ...(actual as P),
            };
        });
        const log = getServerLogger({});

        // act
        const { messages } = await trackingPing({
            connectionId: "test",
            packet: inboundMessage,
            log,
        });
        expect(messages.length).toBe(1);
        expect(messages[0].serialize()[11]).toBe(101);
    });
});
