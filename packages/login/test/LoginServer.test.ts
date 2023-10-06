import { describe, it, expect } from "vitest";
import { LoginServer } from "../src/index.js";
import {
    mockDatabaseManager,
    mockPino,
    unmockPino,
} from "../../../test/factoryMocks.js";
import { getServerLogger } from "../../shared/log.js";

describe("LoginServer", () => {
    describe("constructor", () => {
        it("should create a new instance", () => {
            mockPino();
            const loginServer = new LoginServer({
                database: mockDatabaseManager(),
                log: getServerLogger({}),
            });
            expect(loginServer).toBeDefined();
            unmockPino();
        });
    });
});
