import { describe, expect, it } from "vitest";
import { OldServerMessage } from "rusty-motors-shared";
import { _getPlayerRaceHistory } from "../src/_getPlayerRaceHistory.js";
import {loggerMock} from "rusty-motors-shared/test"

describe("_getPlayerRaceHistory", () => {
	it("should return a PlayerRacingHistoryMessage", async () => {
		const incomingMessage = new OldServerMessage();
		incomingMessage.setDataBuffer(Buffer.from([
			0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x01,
			0x01, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x01,
		]));
		const result = await _getPlayerRaceHistory({
			connectionId: "0",
			packet: incomingMessage,
			log: loggerMock
		});

		expect(result).toBeDefined();
	});
});
