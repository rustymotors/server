import { describe, expect, it } from "vitest";
import { handleSendMiniRiffList } from "../../src/handlers/handleSendMiniRiffList.js";
import { BytableMessage } from "@rustymotors/binary";
import {loggerMock} from "rusty-motors-shared/test"

describe("handleSendMiniRiffList", () => {
	it("should return a buffer", async () => {
		// arrange
		const incomingMessage = new BytableMessage();

		const result = await handleSendMiniRiffList({
			connectionId: "test",
			message: incomingMessage,
			log: loggerMock
		});

        expect(result.messages.length).toEqual(1);
		expect(result.messages[0]).toBeInstanceOf(BytableMessage);
	});
});
