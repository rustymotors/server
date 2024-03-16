import { TServerLogger } from "@rustymotors/shared";
import { getGatewayServer } from "../src/GatewayServer.js";
import type { GatewayOptions } from "../src/GatewayServer.js";
import { describe, it, expect, vi } from "vitest";

describe("getGatewayServer", () => {
    it("should be able to get a singleton instance", () => {
        // Arrange
        const log: TServerLogger = {
            debug: () => {},
            error: () => {},
            info: () => {},
            warn: () => {},
            fatal: () => {},
            trace: () => {},
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
});
