import { describe, expect, it, vi } from "vitest";
import { ConsoleThread } from "../ConsoleThread.js";

describe("ConsoleThread", () => {
	it("should throw if more then one instance is created", () => {
		const parentThread = {} as any;
		const log = {
			info: () => vi.fn(),
			error: () => vi.fn(),
			warn: () => vi.fn(),
			debug: () => vi.fn(),
			trace: () => vi.fn(),
			fatal: () => vi.fn(),
		} as any;
		new ConsoleThread({ parentThread, log });
		expect(() => new ConsoleThread({ parentThread, log })).toThrow(
			"ConsoleThread already exists",
		);
	});
});
