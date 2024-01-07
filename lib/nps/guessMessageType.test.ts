import { describe, it, expect } from "vitest";
import { guessMessageType } from "./guessMessageType.js";

describe("guessMessageType", () => {
    describe("isLE = true", () => {
        // If the buffer is too short, throw an error
        it("throws an error if the buffer is too short", () => {
            expect(() => guessMessageType(Buffer.alloc(3), true)).toThrow(
                "Buffer length 3 is too short to guess message type",
            );
        });

        // If the first word is zero and send the second word is zero, it's unknown
        it("returns 'Unknown' if the first word is zero and the second word is zero", () => {
            expect(guessMessageType(Buffer.alloc(4), true)).toBe("Unknown");
        });

        // If the first word is zero and the second word is <= the buffer length, it's unknown, since a game message would have both words greater than zero
        it("returns 'Server' if the first word is zero and the second word is <= the buffer length", () => {
            expect(guessMessageType(Buffer.from([0, 0, 1, 0]), true)).toBe(
                "Unknown",
            );
        });

        // If the second word is zero and the first word is <= the buffer length, it's unknown, since a server message would have both words greater than zero
        it("returns 'Unknown' if the second word is zero and the first word is <= the buffer length", () => {
            expect(guessMessageType(Buffer.from([1, 0, 0, 0]), true)).toBe(
                "Unknown",
            );
        });

        // If the first word is <= the buffer length and the second word is > the buffer length, it's a server message
        it("returns 'Server' if the first word is <= the buffer length and the second word is > the buffer length", () => {
            expect(guessMessageType(Buffer.from([2, 0, 20, 0]), true)).toBe(
                "Server",
            );
        });

        // If the second word is <= the buffer length and the first word is > the buffer length, it's a game message
        it("returns 'Game' if the second word is <= the buffer length and the first word is > the buffer length", () => {
            expect(guessMessageType(Buffer.from([5, 0, 1, 0]), true)).toBe(
                "Game",
            );
        });

        // If both words are greater than the buffer length, it's unknown
        it("returns 'Unknown' if both words are greater than the buffer length", () => {
            expect(guessMessageType(Buffer.from([5, 0, 10, 0]), true)).toBe(
                "Unknown",
            );
        });
    });

    describe("isLE = false", () => {
        // If the buffer is too short, throw an error
        it("throws an error if the buffer is too short", () => {
            expect(() => guessMessageType(Buffer.alloc(3), false)).toThrow(
                "Buffer length 3 is too short to guess message type",
            );
        });

        // If the first word is zero and send the second word is zero, it's unknown
        it("returns 'Unknown' if the first word is zero and the second word is zero", () => {
            expect(guessMessageType(Buffer.alloc(4), false)).toBe("Unknown");
        });

        // If the first word is zero and the second word is <= the buffer length, it's unknown, since a game message would have both words greater than zero
        it("returns 'Server' if the first word is zero and the second word is <= the buffer length", () => {
            expect(guessMessageType(Buffer.from([0, 0, 0, 1]), false)).toBe(
                "Unknown",
            );
        });

        // If the second word is zero and the first word is <= the buffer length, it's unknown, since a server message would have both words greater than zero
        it("returns 'Unknown' if the second word is zero and the first word is <= the buffer length", () => {
            expect(guessMessageType(Buffer.from([0, 1, 0, 0]), false)).toBe(
                "Unknown",
            );
        });

        // If the first word is <= the buffer length and the second word is > the buffer length, it's a server message
        it("returns 'Server' if the first word is <= the buffer length and the second word is > the buffer length", () => {
            expect(guessMessageType(Buffer.from([0, 2, 0, 20]), false)).toBe(
                "Server",
            );
        });

        // If the second word is <= the buffer length and the first word is > the buffer length, it's a game message
        it("returns 'Game' if the second word is <= the buffer length and the first word is > the buffer length", () => {
            expect(guessMessageType(Buffer.from([5, 0, 0, 1]), false)).toBe(
                "Game",
            );
        });

        // If both words are greater than the buffer length, it's unknown
        it("returns 'Unknown' if both words are greater than the buffer length", () => {
            expect(guessMessageType(Buffer.from([5, 0, 1, 0, 0]), false)).toBe(
                "Unknown",
            );
        });
    });
});
