import { clientConnect } from "../src/clientConnect.js";
import { describe, it, expect } from "vitest";

import { updateSessionKey } from "../../database";
import { TClientConnectMessage } from "../src/TClientConnectMessage.js";
import { mockLogger } from "../../../test/factoryMocks.js";

describe("clientConnect", () => {
    it("throws when connection is not found", async () => {
        // arrange
        const customerId = 1234;
        const connectionId = "test";
        const sessionKey =
            "1234567890123456123456789012345612345678901234561234567890123456";
        const contextId = "test";
        const incomingMessage = new TClientConnectMessage();
        incomingMessage._customerId = customerId;

        const log = mockLogger();
        await updateSessionKey(customerId, sessionKey, contextId, connectionId);

        // act
        try {
            await clientConnect({
                connectionId,
                packet: incomingMessage,
                log,
            });
        } catch (error) {
            // assert
            expect(error).toEqual(
                new Error(
                    `Encryption not found for connection ${connectionId}`,
                ),
            );
        }
    });
});
