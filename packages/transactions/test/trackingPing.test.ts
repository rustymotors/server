import { describe, expect, test, vi } from "vitest";
import { MessageNode } from 'rusty-motors-shared';
import { trackingPing } from "../src/trackingPing.js";
import {loggerMock} from "rusty-motors-shared/test"

describe("trackingPing", () => {
	test("does not return a message", async () => {
		// arrange
		const inboundMessage = new MessageNode();

		// act
		const { messages } = await trackingPing({
			connectionId: "test",
			packet: inboundMessage,
			log: loggerMock
		});
		expect(messages.length).toBe(0);
	});
});
