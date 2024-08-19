import type { TServerLogger } from "rusty-motors-shared";
import { socketErrorHandler } from "rusty-motors-gateway";
import { describe, it, expect, vi } from "vitest";

describe("socketErrorHandler", () => {
    it("should log and throw an error", () => {
        // Arrange
        const log: TServerLogger = {
            debug: () => vi.fn(),
            error: () => vi.fn(),
            info: () => vi.fn(),
            warn: () => vi.fn(),
            fatal: () => vi.fn(),
            trace: () => vi.fn(),
            setName: () => vi.fn(),
            getName: () => "",
            resetName: () => vi.fn(),
        };

        const error = new Error("test error");
        const connectionId = "test-connection-id";
        const errorSpy = vi.spyOn(log, "error");

        // Act
        const fn = () => socketErrorHandler({ log, error, connectionId });

        // Assert
        expect(fn).toThrowError("test error");

        expect(errorSpy).toHaveBeenCalledWith(
            "Socket error: test error on connection test-connection-id",
        );
    });
});
