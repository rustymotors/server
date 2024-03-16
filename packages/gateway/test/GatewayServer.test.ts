import { TServerLogger } from "@rustymotors/shared";
import { Gateway, getGatewayServer } from "../src/GatewayServer.js";
import type { GatewayOptions } from "../src/GatewayServer.js";
import { describe, it, expect, vi } from "vitest";

describe("getGatewayServer", () => {
    it("should be able to get a singleton instance when called with multiple ports", () => {
        // Arrange
        const log: TServerLogger = {
            debug: () => vi.fn(),
            error: () => vi.fn(),
            info: () => vi.fn(),
            warn: () => vi.fn(),
            fatal: () => vi.fn(),
            trace: () => vi.fn(),
        };

        const options: GatewayOptions = {
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
        };

        const options: GatewayOptions = {
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
        };

        const options: GatewayOptions = {
            log,
        };
        Gateway.deleteInstance();

        // Act
        const fn = () => getGatewayServer(options);

        // Assert
        expect(fn).toThrowError();
    });
});
