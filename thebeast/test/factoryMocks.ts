import { expect, it, vi } from "vitest";
import { DatabaseManager } from "../packages/interfaces/index.js";
import { verifyLegacyCipherSupport } from "../packages/gateway/src/encryption.js";

export function mockDatabaseManager(): DatabaseManager {
    return {
        updateSessionKey: vi.fn(),
        fetchSessionKeyByCustomerId: vi.fn(),
    };
}

it("should have crypto", () => {
    expect(() => verifyLegacyCipherSupport()).not.toThrow();
});
