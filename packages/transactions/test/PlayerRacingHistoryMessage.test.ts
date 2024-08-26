import { expect, test } from "vitest";
import { PlayerRacingHistoryMessage } from "../src/PlayerRacingHistoryMessage.js";

test("Create PlayerRacingHistoryMessage instance", () => {
	const message = new PlayerRacingHistoryMessage();
	// Assert that the instance is created successfully
	expect(message).toBeInstanceOf(PlayerRacingHistoryMessage);
});
