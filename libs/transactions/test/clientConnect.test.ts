import { clientConnect } from "../src/clientConnect.js";
import { describe, it, expect } from "vitest";

import { updateSessionKey } from "rusty-database";
import { TClientConnectMessage } from "../src/TClientConnectMessage.js";
import { vi } from "vitest";
import type { TServerLogger } from "rusty-shared";

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

        const log: TServerLogger = {
            info: vi.fn(),
            error: vi.fn(),
            debug: vi.fn(),
            warn: vi.fn(),
            fatal: vi.fn(),
            trace: vi.fn(),
        };
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
