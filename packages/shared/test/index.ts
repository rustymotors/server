import { vi } from "vitest";
import type { TServerLogger } from "..";

export function mockLogger(): TServerLogger {
    return {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
        trace: vi.fn(),
        fatal: vi.fn(),
        getName: vi.fn(),
        resetName: vi.fn(),
        setName: vi.fn(),
    };
}