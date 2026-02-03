import { vi } from "vitest";
import type { DatabaseManager, ServerLogger } from "../src/types.js";

export const loggerMock: ServerLogger = {
	error: vi.fn(),
	warn: vi.fn(),
	info: vi.fn(),
	verbose: vi.fn(),
	debug: vi.fn(),
	trace: vi.fn()
}

export const databaseManagerMock: DatabaseManager = {
	updateGameServer: vi.fn(),
	getGameServers: vi.fn(),
	updateUser: vi.fn(),
	getUser: vi.fn(),
	updateConnection: vi.fn(),
	updateSessionKey: vi.fn(),
	fetchSessionKeyByCustomerId: vi.fn(),
	findUserByConnectionId: vi.fn(),
	fetchSessionKeyByConnectionId: vi.fn(),
}