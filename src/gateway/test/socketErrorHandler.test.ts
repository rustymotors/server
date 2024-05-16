import { socketErrorHandler } from "@rustymotors/gateway";
import type { TServerLogger } from "@rustymotors/shared";
import { describe, expect, it, vi } from "vitest";

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
      "Socket error: test error on connection test-connection-id"
    );
  });
});
