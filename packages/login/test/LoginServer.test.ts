import { describe, expect, it } from "vitest";
import {
	mockDatabaseManager,
	mockPino,
	unmockPino,
} from "../../../test/factoryMocks.js";
import { getServerLogger } from "rusty-motors-shared";
import { LoginServer } from "../src/index.js";

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
