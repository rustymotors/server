import { describe, expect, test, vi } from "vitest";
import { loggerMock, OldServerMessage } from "rusty-motors-shared";
import { trackingPing } from "../src/trackingPing.js";

describe("trackingPing", () => {
	test("does not return a message", async () => {
		// arrange
		const inboundMessage = new OldServerMessage();

		// act
		const { messages } = await trackingPing({
			connectionId: "test",
			packet: inboundMessage,
			log: loggerMock
		});
		expect(messages.length).toBe(0);
	});
});
