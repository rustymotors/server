import { PlayerRacingHistoryMessage } from "../src/PlayerRacingHistoryMessage.js";
import { expect, test } from "vitest";

test("Create PlayerRacingHistoryMessage instance", () => {
    const message = new PlayerRacingHistoryMessage();
    // Assert that the instance is created successfully
    expect(message).toBeInstanceOf(PlayerRacingHistoryMessage);
});
