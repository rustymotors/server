import { describe, expect, test, vi } from "vitest";
import { getServerLogger } from "rusty-motors-shared";
import { OldServerMessage } from "rusty-motors-shared";
import { trackingPing } from "../src/trackingPing.js";

describe("trackingPing", () => {
	test("does not return a message", async () => {
		// arrange
		const inboundMessage = new OldServerMessage();

		const log = getServerLogger({});

		// act
		const { messages } = await trackingPing({
			connectionId: "test",
			packet: inboundMessage,
			log,
		});
		expect(messages.length).toBe(0);
	});
});
