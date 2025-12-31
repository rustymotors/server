import { vi } from "vitest";
import { ServerLogger } from "./types.js";

export const loggerMock: ServerLogger = {
	error: vi.fn(),
	warn: vi.fn(),
	info: vi.fn(),
	verbose: vi.fn(),
	debug: vi.fn(),
	trace: vi.fn()
}