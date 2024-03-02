import { describe, it, expect } from "vitest";
import { LoginServer } from "../src/index.js";
import { mockDatabaseManager } from "../../../test/factoryMocks.js";
import { getServerLogger } from "@rustymotors/shared";

describe("LoginServer", () => {
    describe("constructor", () => {
        it("should create a new instance", () => {
            const loginServer = new LoginServer({
                database: mockDatabaseManager(),
                log: getServerLogger({
                    level: "silent",
                }),
            });
            expect(loginServer).toBeDefined();
        });
    });
});
