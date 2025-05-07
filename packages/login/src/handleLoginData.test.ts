import { describe, it, expect, vi } from "vitest";
import { handleLoginData } from "./handleLoginData.js";
import { NPSMessage, ServerLogger } from "rusty-motors-shared";
import { getMessageHandlerOrFallback } from "./internal.js";
import { BytableMessage } from "@rustymotors/binary";

vi.mock("rusty-motors-shared", () => ({
    NPSMessage: vi.fn(() => ({
        deserialize: vi.fn(),
    })),
    getServerLogger: vi.fn(() => ({
        debug: vi.fn(),
    })),
}));

vi.mock("./internal.js", () => ({
    getMessageHandlerOrFallback: vi.fn(),
}));

describe("handleLoginData", () => {
    it("should process login data and return connectionId and messages", async () => {
        const mockConnectionId = "test-connection-id";
        const mockMessage = {
            serialize: vi.fn(),
            header: { messageId: "test-message-id" },
        } as unknown as BytableMessage;
        const mockLog = {
            debug: vi.fn(),
        } as unknown as ServerLogger;
        const mockHandlerResult = {
            messages: [{ getMessageId: "1" }, { getMessageId: "2" }],
        };

        const mockMessageHandler = vi.fn().mockResolvedValue(mockHandlerResult);
        (getMessageHandlerOrFallback as vi.Mock).mockReturnValue(mockMessageHandler);

        const result = await handleLoginData({
            connectionId: mockConnectionId,
            message: mockMessage,
            log: mockLog,
        });

        expect(mockLog.debug).toHaveBeenCalledWith(
            `[${mockConnectionId}] Entering handleLoginData`
        );
        expect(NPSMessage).toHaveBeenCalled();
        expect(mockMessage.serialize).toHaveBeenCalled();
        expect(getMessageHandlerOrFallback).toHaveBeenCalledWith(
            mockMessage.header.messageId
        );
        expect(mockMessageHandler).toHaveBeenCalledWith({
            connectionId: mockConnectionId,
            message: mockMessage,
            log: mockLog,
        });
        expect(mockLog.debug).toHaveBeenCalledWith(
            `[${mockConnectionId}] Leaving handleLoginData with ${mockHandlerResult.messages.length} messages`
        );
        expect(result).toEqual({
            connectionId: mockConnectionId,
            messages: mockHandlerResult.messages,
        });
    });

    it("should throw an error if messageHandler fails", async () => {
        const mockConnectionId = "test-connection-id";
        const mockMessage = {
            serialize: vi.fn(),
            header: { messageId: "test-message-id" },
        } as unknown as BytableMessage;
        const mockLog = {
            debug: vi.fn(),
        } as unknown as ServerLogger;

        const mockError = new Error("Handler error");
        const mockMessageHandler = vi.fn().mockRejectedValue(mockError);
        (getMessageHandlerOrFallback as vi.Mock).mockReturnValue(mockMessageHandler);

        await expect(
            handleLoginData({
                connectionId: mockConnectionId,
                message: mockMessage,
                log: mockLog,
            })
        ).rejects.toThrow(`[${mockConnectionId}] Error in login service`);

        expect(mockLog.debug).toHaveBeenCalledWith(
            `[${mockConnectionId}] Entering handleLoginData`
        );
        expect(mockMessageHandler).toHaveBeenCalled();
    });
});