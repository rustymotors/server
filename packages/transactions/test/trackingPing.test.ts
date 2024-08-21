import { describe, expect, test, vi } from "vitest";
import { P } from "vitest/dist/reporters-5f784f42.js";
import { getServerLogger } from "../../shared/log.js";
import { OldServerMessage } from "../../shared/messageFactory.js";
import { trackingPing } from "../src/trackingPing.js";

describe("trackingPing", () => {
	test("does not return a message", async () => {
		// arrange
		const inboundMessage = new OldServerMessage();
		vi.mock("pino", async () => {
			const actual = await vi.importActual("pino");
			return {
				...(actual as P),
			};
		});
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
