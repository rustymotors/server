import { describe, expect, test, vi } from "vitest";
import { getServerLogger } from "../../shared/log.js";
import { OldServerMessage } from "../../shared/messageFactory.js";
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
