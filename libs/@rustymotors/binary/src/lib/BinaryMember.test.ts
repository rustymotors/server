import { describe, it, expect } from "vitest";
import { BinaryMember, BINARY_ALIGNMENT, verifyAlignment } from "./BinaryMember.js";

describe("BinaryMember", () => {
    it("should initialize with size parameter", () => {
        const member = new BinaryMember(4);
        expect(member.size()).toBe(4);
    });

    it("should initialize with default size of 0", () => {
        const member = new BinaryMember();
        expect(member.size()).toBe(0);
    });

    it("should set value with alignment padding", () => {
        const member = new BinaryMember(8);
        const value = new Uint8Array([1, 2]);
        member.set(value);

        const result = member.get();
        expect(result[0]).toBe(1);
        expect(result[1]).toBe(2);
        expect(result.length % BINARY_ALIGNMENT).toBe(0);
    });

    it("should throw error when setting value exceeding maxSize", () => {
        const member = new BinaryMember(2);
        const value = new Uint8Array([1, 2, 3, 4]);

        expect(() => member.set(value)).toThrow(
            "Value exceeds maximum size of 2"
        );
    });

    it("should return aligned buffer on get", () => {
        const member = new BinaryMember(8);
        const value = new Uint8Array([255]);
        member.set(value);

        const result = member.get();
        expect(result.length % BINARY_ALIGNMENT).toBe(0);
    });

    it("should handle empty Uint8Array", () => {
        const member = new BinaryMember(4);
        const value = new Uint8Array();
        member.set(value);

        expect(member.size()).toBe(0);
    });

    it("should preserve value data after set and get", () => {
        const member = new BinaryMember(16);
        const value = new Uint8Array([10, 20, 30]);
        member.set(value);

        const result = member.get();
        expect(result[0]).toBe(10);
        expect(result[1]).toBe(20);
        expect(result[2]).toBe(30);
    });

    it("should allow setting equal size values", () => {
        const member = new BinaryMember(4);
        const value = new Uint8Array([1, 2, 3, 4]);
        member.set(value);

        expect(member.size()).toBe(4);
    });

    it("should not throw when buffer is aligned", () => {
        const buffer = new Uint8Array(4);
        expect(() => verifyAlignment(buffer, BINARY_ALIGNMENT)).not.toThrow();
    });

    it("should throw when buffer is not aligned", () => {
        const buffer = new Uint8Array(3);
        expect(() => verifyAlignment(buffer, BINARY_ALIGNMENT)).toThrow(
            "Buffer size is not aligned to 4"
        );
    });

    it("should throw with custom alignment value", () => {
        const buffer = new Uint8Array(5);
        expect(() => verifyAlignment(buffer, 4)).toThrow(
            "Buffer size is not aligned to 4"
        );
    });

    it("should handle alignment of 1", () => {
        const buffer = new Uint8Array(1);
        expect(() => verifyAlignment(buffer, 1)).not.toThrow();
    });

    it("should handle empty buffer with alignment", () => {
        const buffer = new Uint8Array(0);
        expect(() => verifyAlignment(buffer, BINARY_ALIGNMENT)).not.toThrow();
    });


});