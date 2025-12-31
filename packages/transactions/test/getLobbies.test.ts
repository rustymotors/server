import { describe, expect, it } from "vitest";
import { loggerMock, OldServerMessage } from "rusty-motors-shared";
import { getLobbies } from "../src/getLobbies.js";

describe("getLobbies", () => {
	it("should return a promise", async () => {
		// arrange
		const connectionId = "1";
		const packet = new OldServerMessage();

		// act
		const result = await getLobbies({
			connectionId,
			packet,
			log: loggerMock
		});

		const resultMessage = result.messages[0].serialize().toString("hex");

		// assert
		expect(resultMessage).toMatch(/544f4d43/);
	});
});
