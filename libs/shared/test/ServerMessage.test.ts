import { OldServerMessage } from "../src/messageFactory.js";
import { describe, it, expect } from "vitest";

describe("ServerMessage", () => {
    describe(".byteLength", () => {
        it("should have the correct size", () => {
            // Arrange
            const testMessage = new OldServerMessage();
            // Assert
            expect(testMessage.size()).toBe(11);
        });
    });
    it("should serialize and deserialize correctly", () => {
        // Arrange
        const testMessage = new OldServerMessage();
        testMessage._header.mcoSig = "MCOX";
        testMessage._header.sequence = 1;
        testMessage._header.flags = 3;
        testMessage._msgNo = 613;
        // Act
        const buffer = testMessage.serialize();
        const result = new OldServerMessage();
        result._doDeserialize(buffer);
        result._msgNo = testMessage._msgNo;
        // Assert
        expect(result._header.mcoSig).toEqual(testMessage._header.mcoSig);
        expect(result._header.sequence).toEqual(testMessage._header.sequence);
        expect(result._header.flags).toEqual(testMessage._header.flags);
        expect(result._msgNo).toEqual(testMessage._msgNo);
    });
});
