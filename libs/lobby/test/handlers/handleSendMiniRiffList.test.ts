import { handleSendMiniRiffList } from "../../src/handlers/handleSendMiniRiffList.js";
import { describe, it, expect, vi } from "vitest";
import { LegacyMessage, type TServerLogger } from "../../../shared";

describe("handleSendMiniRiffList", () => {
    it("should return a buffer", async () => {
        // arrange
        const incomingMessage = new LegacyMessage();
        const log: TServerLogger = {
            info: vi.fn(),
            error: vi.fn(),
            debug: vi.fn(),
            warn: vi.fn(),
            fatal: vi.fn(),
            trace: vi.fn(),
        };

        const result = await handleSendMiniRiffList({
            connectionId: "test",
            message: incomingMessage,
            log,
        });

        expect(result.message).toBeInstanceOf(LegacyMessage);
    });
});
