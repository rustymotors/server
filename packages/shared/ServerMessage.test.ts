import { ServerMessage } from "./messageFactory.js";
import { describe, it, expect } from "vitest";

describe("ServerMessage", () => {
    describe(".byteLength", () => {
        it("should have the correct size", () => {
            // Arrange
            const testMessage = new ServerMessage();
            // Assert
            expect(testMessage.size).toBe(13);
        });
    });
    it("should serialize and deserialize correctly", () => {
        // Arrange
        const testMessage = new ServerMessage();
        testMessage.mcoSig = "MCOX";
        testMessage.sequence = 1;
        testMessage.flags = 3;
        testMessage.msgNo = 613;
        // Act
        const buffer = testMessage.serialize();
        const result = new ServerMessage();
        result.deserialize(buffer);
        // Assert
        expect(result.mcoSig).toEqual(testMessage.mcoSig);
        expect(result.sequence).toEqual(testMessage.sequence);
        expect(result.flags).toEqual(testMessage.flags);
        expect(result.msgNo).toEqual(testMessage.msgNo);
    });
});
