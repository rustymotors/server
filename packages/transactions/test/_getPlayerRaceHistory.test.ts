import { describe, it, expect } from "vitest";
import { _getPlayerRaceHistory } from "../src/_getPlayerRaceHistory.js";
import { OldServerMessage } from "@rustymotors/shared";
import { mockLogger } from "../../../test/factoryMocks.js";

describe("_getPlayerRaceHistory", () => {
    it("should return a PlayerRacingHistoryMessage", async () => {
        const incomingMessage = new OldServerMessage();
        incomingMessage.internalBuffer = Buffer.from([
            0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
            0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00,
            0x00, 0x01,
        ]);
        const result = await _getPlayerRaceHistory({
            connectionId: "0",
            packet: incomingMessage,
            log: mockLogger(),
        });

        expect(result).toBeDefined();
    });
});
