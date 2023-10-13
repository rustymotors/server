import { PartsAssemblyMessage, Part } from "../src/PartsAssemblyMessage.js";
import { describe, it, expect } from "vitest";

describe("PartsAssemblyMessage", () => {
    it("should serialize", () => {
        // Arrange
        const message = new PartsAssemblyMessage(100);
        message._msgNo = 100;

        // Act
        const buffer = message.serialize();

        // Assert
        expect(buffer.subarray(0, 7)).toEqual(
            Buffer.from([0x64, 0x00, 0x64, 0x00, 0x00, 0x00, 0x00]),
        );
    });
});

describe("Part", () => {
    it("should serialize", () => {
        // Arrange
        const message = new Part();
        message._partId = 100; // 0x64
        message._parentPartId = 200; // 0xc8
        message._brandedPartId = 300; // 0x12c
        message._repairPrice = 400; // 0x190
        message._junkPrice = 500; // 0x1f4
        message._wear = 600; // 0x258
        message._attachmentPoint = 7; // 0x7
        message._damage = 8; // 0x8
        message._retailPrice = 900; // 0x384
        message._maxWear = 1000; // 0x3e8

        // Act
        const buffer = message.serialize();

        // Assert
        expect(buffer.subarray(0, 34)).toEqual(
            Buffer.from([
                0x64, 0x00, 0x00, 0x00, 0xc8, 0x00, 0x00, 0x00, 0x2c, 0x01,
                0x00, 0x00, 0x90, 0x01, 0x00, 0x00, 0xf4, 0x01, 0x00, 0x00,
                0x58, 0x02, 0x00, 0x00, 0x07, 0x08, 0x84, 0x03, 0x00, 0x00,
                0xe8, 0x03, 0x00, 0x00,
            ]),
        );
    });
});
