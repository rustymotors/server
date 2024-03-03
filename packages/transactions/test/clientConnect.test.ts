import { State } from "@rustymotors/shared";
import { getServerLogger } from "@rustymotors/shared";
import { clientConnect } from "../src/clientConnect.js";
import { describe, it, expect } from "vitest";

import { updateSessionKey } from "@rustymotors/database";
import { TClientConnectMessage } from "../src/TClientConnectMessage.js";

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

        const log = getServerLogger({
            level: "silent",
        });
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
