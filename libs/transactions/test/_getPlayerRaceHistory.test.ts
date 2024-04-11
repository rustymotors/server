import { describe, it, expect, vi } from "vitest";
import { _getPlayerRaceHistory } from "../src/_getPlayerRaceHistory.js";
import { OldServerMessage, type TServerLogger } from "rusty-shared";

describe("_getPlayerRaceHistory", () => {
    it("should return a PlayerRacingHistoryMessage", async () => {
        const incomingMessage = new OldServerMessage();
        incomingMessage.internalBuffer = Buffer.from([
            0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
            0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00,
            0x00, 0x01,
        ]);
        const log: TServerLogger = {
            info: vi.fn(),
            error: vi.fn(),
            debug: vi.fn(),
            warn: vi.fn(),
            fatal: vi.fn(),
            trace: vi.fn(),
        };
        const result = await _getPlayerRaceHistory({
            connectionId: "0",
            packet: incomingMessage,
            log,
        });

        expect(result).toBeDefined();
    });
});
