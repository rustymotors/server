import { expect, it, vi } from "vitest";
import { ensureLegacyCipherCompatibility } from "../packages/shared/src/verifyLegacyCipherSupport.js";

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
	expect(() => ensureLegacyCipherCompatibility()).not.toThrow();
});
