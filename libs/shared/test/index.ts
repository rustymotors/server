import type { TServerLogger } from "shared";
import { vi } from "vitest";

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
