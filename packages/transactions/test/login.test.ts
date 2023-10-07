import { P } from "vitest/dist/reporters-5f784f42.js";
import { getServerLogger } from "../../shared/log.js";
import { ServerMessage } from "../../shared/messageFactory.js";
import { login } from "../src/login.js";
import { describe, it, expect, vi } from "vitest";

describe("login", () => {
    it("returns a message", async () => {
        // arrange
        const connectionId = "test";
        const incomingMessage = new ServerMessage();
        const imcomingBuffer = Buffer.from(JSON.stringify(incomingMessage));
        incomingMessage.setBuffer(imcomingBuffer);
        vi.mock("pino", async () => {
            const actual = await vi.importActual("pino");
            return {
                ...(actual as P),
            };
        });
        const log = getServerLogger({});

        // act
        const result = await login({
            connectionId,
            packet: incomingMessage,
            log,
        });

        // assert
        expect(result.messages[0]).toBeInstanceOf(ServerMessage);
    });
});
