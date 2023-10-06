import { LobbyInfo, LobbyMessage } from "../src/LobbyMessage.js";
import { describe, expect, it } from "vitest";

describe("LobbyMessage", () => {
    describe(".size()", () => {
        it("should have a starting value of 5", () => {
            // Arrange
            const testMessage = new LobbyMessage();

            // Assert
            expect(testMessage.size()).toBe(5);
        });
    });

    describe(".serialize()", () => {
        it("should return a buffer of the correct size", () => {
            // Arrange
            const testMessage = new LobbyMessage();

            // Act
            const result = testMessage.serialize();

            // Assert
            expect(result).toBeInstanceOf(Buffer);
            expect(result.length).toBe(5);
        });
    });
});

describe("LobbyInfo", () => {
    describe(".size()", () => {
        it("should have a starting value of 563", () => {
            // Arrange
            const testMessage = new LobbyInfo();

            // Assert
            expect(testMessage.size()).toBe(563);
        });
    });
});
