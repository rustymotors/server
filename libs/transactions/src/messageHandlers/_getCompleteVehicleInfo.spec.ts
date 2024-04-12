import { describe, it, expect, vi } from "vitest";
import { _getCompleteVehicleInfo } from "./_getCompleteVehicleInfo.js";
import type { TServerLogger } from "rusty-shared";

describe("_getCompleteVehicleInfo", () => {
    it("should throw when passed message is too small", async () => {
        // Setup
        const connectionId = "testConnectionId";
        const packet = {
            data: Buffer.from([0x00, 0x00, 0x00, 0x00]),
            _header: {
                _msgNo: 0,
                _size: 0,
                _doSerialize: vi.fn(),
                size: () => 0,
                _doDeserialize: vi.fn(),
                serialize: vi.fn(),
                setBuffer: vi.fn(),
                updateMsgNo: vi.fn(),
                length: 0,
                mcoSig: "",
                sequence: 0,
                flags: 0,
                internalBuffer: Buffer.from([0x00, 0x00, 0x00, 0x00]),
                data: Buffer.from([0x00, 0x00, 0x00, 0x00]),
            },
            _msgNo: 0,
            _size: 0,
            _doSerialize: vi.fn(),
            size: () => 0,
            _doDeserialize: vi.fn(),
            serialize: vi.fn(),
            setBuffer: vi.fn(),
            updateMsgNo: vi.fn(),
        };
        const log: TServerLogger = {
            info: vi.fn(),
            error: vi.fn(),
            debug: vi.fn(),
            warn: vi.fn(),
            fatal: vi.fn(),
            trace: vi.fn(),
        };

        // Exercise
        _getCompleteVehicleInfo({
            connectionId,
            packet,
            log,
        }).catch((error) => {
            // Verify
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toContain(
                `[GenericRequestMsg] Unable to deserialize buffer: `,
            );
        });
    });
});
