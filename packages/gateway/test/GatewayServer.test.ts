import { describe, it, expect } from "vitest";
import { GatewayServer } from "@mcos/gateway";
import assert from "node:assert";

describe("GatewayServer", () => {
    it("should throw an error if no config is provided", () => {
        assert.throws(() => new GatewayServer({}));
    });

    it("should throw an error if no log is provided", () => {
        assert.throws(() => new GatewayServer({}));
    });

    it("should throw an error if no listeningPortList is provided", () => {
        assert.throws(() => new GatewayServer({}));
    });
});
