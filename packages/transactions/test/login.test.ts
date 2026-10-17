import { describe, expect, it } from "vitest";
import { MessageNode } from 'rusty-motors-shared';
import { login } from "../src/login.js";
import {loggerMock} from "rusty-motors-shared/test"

describe("login", () => {
	it("returns a message", async () => {
		// arrange
		const connectionId = "test";
		const incomingMessage = new MessageNode();
		incomingMessage.sequence = 1;
		const imcommingBuffer = Buffer.from(JSON.stringify(incomingMessage));
		incomingMessage.setDataBuffer(imcommingBuffer);

		// act
		const result = await login({
			connectionId,
			packet: incomingMessage,
			log: loggerMock
		});

		// assert
		expect(result.messages[0]).toBeInstanceOf(MessageNode);
	});
});
