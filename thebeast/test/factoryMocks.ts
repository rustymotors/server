import { expect, it, vi } from "vitest";
import { DatabaseManager } from "../packages/interfaces/index.js";
import { verifyLegacyCipherSupport } from "../packages/gateway/src/encryption.js";

export function mockDatabaseManager(): DatabaseManager {
    return {
        updateSessionKey: vi.fn(),
        fetchSessionKeyByCustomerId: vi.fn(),
    };
}

/** @type TServerLogger */
export function mockLogger(): any {
    return {
        info: vi.fn(),
        error: vi.fn(),
        fatal: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
        trace: vi.fn(),
    };
}

/** @type ServerMessageType */
export function mockServerMessageType(): any {
    return {
        _header: {
            _size: 0,
            length: 0,
            mcoSig: "",
            sequence: 0,
            flags: 0,
            size: vi.fn(),
            _doDeserialize: vi.fn(),
            _doSerialize: vi.fn(),
            internalBuffer: Buffer.from([]),
            data: Buffer.from([]),
            setBuffer: vi.fn(),
        },
        _msgNo: 0,
        size: vi.fn(),
        _doDeserialize: vi.fn(),
        serialize: vi.fn(),
        setBuffer: vi.fn(),
        updateMsgNo: vi.fn(),
        toString: vi.fn(),
        data: Buffer.from([]),
    };
}

it("should have crypto", () => {
    expect(() => verifyLegacyCipherSupport()).not.toThrow();
});
