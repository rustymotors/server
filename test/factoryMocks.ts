import { expect, it, vi } from "vitest";
import { verifyLegacyCipherSupport } from "../packages/gateway/src/encryption.js";
import { DatabaseManager } from "../packages/interfaces/index.js";

export function mockDatabaseManager(): DatabaseManager {
	return {
		updateSessionKey: vi.fn(),
		fetchSessionKeyByCustomerId: vi.fn(),
	};
}

export function mockPino() {
	vi.mock("pino", () => {
		return {
			default: vi.fn().mockImplementation(() => {
				return {
					debug: vi.fn(),
					info: vi.fn(),
					warn: vi.fn(),
					error: vi.fn(),
				};
			}),
			pino: vi.fn().mockImplementation(() => {
				return {
					debug: vi.fn(),
					info: vi.fn(),
					warn: vi.fn(),
					error: vi.fn(),
				};
			}),
		};
	});
}

export function unmockPino() {
	vi.unmock("pino");
}

it("should have crypto", () => {
	expect(() => verifyLegacyCipherSupport()).not.toThrow();
});
