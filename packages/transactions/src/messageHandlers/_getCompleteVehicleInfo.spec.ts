import { describe, it, expect, vi } from "vitest";
import { _getCompleteVehicleInfo } from "./_getCompleteVehicleInfo.js";
import {
    mockLogger,
    mockServerMessageType,
} from "../../../../test/factoryMocks.js";

describe("_getCompleteVehicleInfo", () => {
    it("should throw when passed message is too small", async () => {
        // Setup
        const connectionId = "testConnectionId";
        const packet = mockServerMessageType();
        const log = mockLogger();

        const expected = {
            vehicleId: 1,
            skinId: 1,
            flags: 1,
            class: 1,
            damageInfo: "damage",
            ownerId: 1,
            parts: [
                {
                    partId: 1,
                    parentPartId: 1,
                    brandedPartId: 1,
                    percentDamage: 1,
                    itemWear: 1,
                    attachmentPointId: 1,
                    ownerId: 1,
                    partName: "part",
                    repairCost: 1,
                    scrapValue: 1,
                },
            ],
        };

        // Exercise
        _getCompleteVehicleInfo({
            connectionId,
            packet,
            log,
        }).catch((error) => {
            // Verify
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe(
                `[GenericRequestMsg] Unable to deserialize buffer: `,
            );
        });
    });
});
