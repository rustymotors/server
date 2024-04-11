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

    describe(".serialize()", () => {
        it("should return a buffer of the correct size", () => {
            // Arrange
            const testMessage = new LobbyInfo();

            // Act
            const result = testMessage.serialize();

            // Assert
            expect(result).toBeInstanceOf(Buffer);
            expect(result.length).toBe(563);
        });
    });

    describe(".deserialize()", () => {
        it("should throw an error when passed a buffer of the wrong size", () => {
            // Arrange
            const testMessage = new LobbyInfo();
            const buffer = Buffer.alloc(1);

            // Act
            const testFunction = () => {
                testMessage.deserialize(buffer);
            };

            // Assert
            expect(testFunction).toThrow(
                "LobbyInfo.deserialize() expected 563 bytes but got 1 bytes",
            );
        });

        it("should not throw an error when passed a buffer of the correct size", () => {
            // Arrange
            const testMessage = new LobbyInfo();
            const buffer = Buffer.alloc(563);

            // Act
            const testFunction = () => {
                testMessage.deserialize(buffer);
            };

            // Assert
            expect(testFunction).not.toThrow();
        });

        it("should set the correct values when passed a buffer of the correct size", () => {
            // Arrange
            const testMessage = new LobbyInfo();
            const buffer = Buffer.alloc(563);

            // Act
            testMessage.deserialize(buffer);

            // Assert
            expect(testMessage.size()).toBe(563);

            expect(testMessage._lobbyId).toBe(0);
        });
    });
});
