import { describe, expect, it } from "vitest";
import { RawMessage } from "./RawMessage.js";

describe("RawMessage", () => {
    describe("constructor", () => {
        it("should create a RawMessage", () => {
            const message = new RawMessage();
            expect(message).toBeInstanceOf(RawMessage);
        });
    });

    describe("toString", () => {
        it("should return the message", () => {
            const message = new RawMessage();
            message.id = 1;
            message.data = Buffer.from("Hello World");
            message.length = message.data.length;
            expect(message.toString()).toBe(
                "MessageHeader: id=1(1), length=11",
            );
        });
    });

    describe("serializeSize", () => {
        it("should return the size of the message", () => {
            const message = new RawMessage();
            message.id = 1;
            message.data = Buffer.from("Hello World");
            message.length = message.data.length;
            expect(message.serializeSize()).toBe(4);
        });
    });

    describe("serialize", () => {
        it("should serialize the message", () => {
            const message = new RawMessage();
            message.id = 1;
            message.data = Buffer.from("Hello World");
            message.length = message.data.length;
            expect(() => message.serialize()).toThrowError("Method not implemented.");
        });
    });

    describe("deserialize", () => {
        it("should deserialize the message", () => {
            const message = RawMessage.deserialize(Buffer.from([0, 1, 0, 11]));
            expect(message.id).toBe(1);
            expect(message.length).toBe(11);
            expect(message.data).toEqual(Buffer.alloc(0));
        });
    });

    describe("deserialize", () => {
        it("should deserialize the message", () => {
            const message = RawMessage.deserialize(Buffer.from([0, 1, 0, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8]));
            expect(message.id).toBe(1);
            expect(message.length).toBe(11);
            expect(message.data).toEqual(Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8]));
        });
    });
});
