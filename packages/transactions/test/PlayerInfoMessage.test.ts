import { describe, expect, it } from "vitest";
import { PlayerInfoMessage } from "../src/PlayerInfoMessage.js";

describe("PlayerInfoMessage", () => {
	it("should serialize", () => {
		// Arrange
		const message = new PlayerInfoMessage();
		message._msgNo = 100;

		// Act
		const buffer = message.serialize();

		// Assert
		expect(buffer.subarray(0, 4)).toEqual(
			Buffer.from([0x64, 0x00, 0x00, 0x00]),
		);
	});
});
