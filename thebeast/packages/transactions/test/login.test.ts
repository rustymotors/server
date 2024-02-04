import { populateVehicles } from "../../../lib/nps/services/vehicle.js";
import { getServerLogger } from "../../shared/log.js";
import { OldServerMessage } from "../../shared/messageFactory.js";
import { login } from "../src/login.js";
import { describe, it, expect } from "vitest";

describe("login", () => {
    it("returns a message", async () => {
        // arrange
        const connectionId = "test";
        const incomingMessage = new OldServerMessage();
        const imcommingBuffer = Buffer.from(JSON.stringify(incomingMessage));
        incomingMessage.setBuffer(imcommingBuffer);
        const log = getServerLogger({
            level: "silent",
        });
        await populateVehicles();

        // act
        const result = await login({
            connectionId,
            packet: incomingMessage,
            log,
        });

        // assert
        expect(result.messages[0]).toBeInstanceOf(OldServerMessage);
    });
});
