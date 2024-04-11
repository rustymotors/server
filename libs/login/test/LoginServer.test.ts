import { describe, it, expect, vi } from "vitest";
import { LoginServer } from "../src/index.js";
import type { TServerLogger } from "rusty-shared";

describe("LoginServer", () => {
    describe("constructor", () => {
        it("should create a new instance", () => {
            const log: TServerLogger = {
                info: vi.fn(),
                error: vi.fn(),
                debug: vi.fn(),
                warn: vi.fn(),
                fatal: vi.fn(),
                trace: vi.fn(),
            };
            const loginServer = new LoginServer({
                log,
            });
            expect(loginServer).toBeDefined();
        });
    });
});
