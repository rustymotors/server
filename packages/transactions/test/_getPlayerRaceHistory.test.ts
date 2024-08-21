import { describe, expect, it } from "vitest";
import { mockPino } from "../../../test/factoryMocks.js";
import { getServerLogger } from "../../shared/log.js";
import { OldServerMessage } from "../../shared/messageFactory.js";
import { _getPlayerRaceHistory } from "../src/_getPlayerRaceHistory.js";

describe("_getPlayerRaceHistory", () => {
	it("should return a PlayerRacingHistoryMessage", async () => {
		const incomingMessage = new OldServerMessage();
		incomingMessage.internalBuffer = Buffer.from([
			0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x01,
			0x01, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x01,
		]);
		mockPino();
		const result = await _getPlayerRaceHistory({
			connectionId: "0",
			packet: incomingMessage,
			log: getServerLogger({}),
		});

		expect(result).toBeDefined();
	});
});
