import { Gateway, getGatewayServer } from "@rustymotors/gateway";
import type { TGatewayOptions, TServerLogger } from "@rustymotors/shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("getGatewayServer", () => {
  beforeEach(() => {
    Gateway.deleteInstance();
  });

  afterEach(() => {
    Gateway.deleteInstance();
  });
  it("should be able to get a singleton instance when called with multiple ports", () => {
    // Arrange
    const log: TServerLogger = {
      debug: () => vi.fn(),
      error: () => vi.fn(),
      info: () => vi.fn(),
      warn: () => vi.fn(),
      fatal: () => vi.fn(),
      trace: () => vi.fn(),
      getName: () => "",
      setName: () => vi.fn(),
      resetName: () => vi.fn(),
    };

    const options: TGatewayOptions = {
      log,
      listeningPortList: [1234, 5678],
    };

    // Act
    const gateway = getGatewayServer(options);

    // Assert
    expect(gateway).toBeDefined();
    expect(gateway).toBe(getGatewayServer(options));
  });

  it("should be able to get a singleton instance when called with a single port", () => {
    // Arrange
    const log: TServerLogger = {
      debug: () => vi.fn(),
      error: () => vi.fn(),
      info: () => vi.fn(),
      warn: () => vi.fn(),
      fatal: () => vi.fn(),
      trace: () => vi.fn(),
      getName: () => "",
      setName: () => vi.fn(),
      resetName: () => vi.fn(),
    };

    const options: TGatewayOptions = {
      log,
      listeningPortList: [1234],
    };

    // Act
    const gateway = getGatewayServer(options);

    // Assert
    expect(gateway).toBeDefined();
    expect(gateway).toBe(getGatewayServer(options));
  });

  it("should throw an error when called with no ports", () => {
    // Arrange
    const log: TServerLogger = {
      debug: () => vi.fn(),
      error: () => vi.fn(),
      info: () => vi.fn(),
      warn: () => vi.fn(),
      fatal: () => vi.fn(),
      trace: () => vi.fn(),
      getName: () => "",
      setName: () => vi.fn(),
      resetName: () => vi.fn(),
    };

    const options: TGatewayOptions = {
      log,
    };
    Gateway.deleteInstance();

    // Act
    const fn = () => getGatewayServer(options);

    // Assert
    expect(fn).toThrowError();
  });
});
