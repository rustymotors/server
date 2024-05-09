import { describe, it, expect } from "vitest";
import { LoginServer } from "../src/index.js";
import { mockLogger } from "../../shared/test";



describe("LoginServer", () => {
    describe("constructor", () => {
        it("should create a new instance", () => {
            const loginServer = new LoginServer({
                log: mockLogger(),
            });
            expect(loginServer).toBeDefined();
        });
    });
});
