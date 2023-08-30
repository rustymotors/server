import { fn } from "@vitest/spy";
import { DatabaseManager, Logger } from "../packages/interfaces/index.js";

export function mockDatabaseManager(): DatabaseManager {
    return {
        updateSessionKey: fn(),
        fetchSessionKeyByCustomerId: fn(),
    }
}

export function mockLogger(): Logger {
    return  fn();
}

