import { describe, it, expect } from "vitest";
import { GatewayServer } from "@mcos/gateway";

describe("GatewayServer", () => {
    it("should throw an error if no config is provided", () => {
        expect(() => new GatewayServer({})).toThrow();
    });

    it("should throw an error if no log is provided", () => {
        expect(() => new GatewayServer({})).toThrow();
    });

    it("should throw an error if no listeningPortList is provided", () => {
        expect(() => new GatewayServer({})).toThrow();
    });
});
