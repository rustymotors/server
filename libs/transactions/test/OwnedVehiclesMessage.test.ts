import {
    OwnedVehiclesMessage,
    OwnedVehicle,
} from "../src/OwnedVehiclesMessage.js";
import { describe, it, expect } from "vitest";

describe("OwnedVehiclesMessage", () => {
    it("should serialize", () => {
        // Arrange
        const message = new OwnedVehiclesMessage();
        message._msgNo = 100;

        // Act
        const buffer = message.serialize();

        // Assert
        expect(buffer.subarray(0, 4)).toEqual(
            Buffer.from([0x64, 0x00, 0x00, 0x00]),
        );
    });
});

describe("OwnedVehicle", () => {
    it("should serialize", () => {
        // Arrange
        const message = new OwnedVehicle();
        message._vehicleId = 100;
        message._brandedPartId = 200;

        // Act
        const buffer = message.serialize();

        // Assert
        expect(buffer.subarray(0, 8)).toEqual(
            Buffer.from([0x64, 0x00, 0x00, 0x00, 0xc8, 0x00, 0x00, 0x00]),
        );
    });
});
