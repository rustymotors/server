import { clientConnect } from "../src/clientConnect.js";
import { describe, it, expect } from "vitest";

import { TClientConnectMessage } from "../src/TClientConnectMessage.js";
import { mockLogger } from "../../../test/factoryMocks.js";
import { UserStatusManager } from "../../nps/index.js";
import { UserStatus } from "../../nps/messageStructs/UserStatus.js";
import { SessionKey } from "../../nps/messageStructs/SessionKey.js";

describe("clientConnect", () => {
    it("throws when connection is not found", async () => {
        // arrange
        const customerId = 1234;
        const connectionId = "test";
        const sessionKey =
            "1234567890123456123456789012345612345678901234561234567890123456";
        const incomingMessage = new TClientConnectMessage();
        incomingMessage._customerId = customerId;

        const log = mockLogger();

        const key = SessionKey.fromKeyString(sessionKey);

        const status = new UserStatus(
            {
                customerId,
                sessionKey: key,
            }
        );
        UserStatusManager.addUserStatus(status);

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
