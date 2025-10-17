import { describe, it, expect } from "vitest";
import { RawMessage } from "./RawMessage.js";

describe("RawMessage", () => {
    it("defaults: sizeOf is header.length (0) and serializes to 4 zero bytes", () => {
        const msg = new RawMessage();
        expect(msg.sizeOf).toBe(0);
        const buf = msg.serialize();
        expect(buf).toBeInstanceOf(Buffer);
        expect(buf.length).toBe(4);
        expect(buf).toEqual(Buffer.alloc(4));
    });

    it("setting id and length updates getters and sizeOf, and serialize contains data after header", () => {
        const msg = new RawMessage();
        msg.id = 1234;
        msg.length = 5;
        expect(msg.id).toBe(1234);
        expect(msg.length).toBe(5);
        expect(msg.sizeOf).toBe(5);

        const payload = Buffer.from([1, 2, 3, 4, 5]);
        msg.data = payload;
        const serialized = msg.serialize();
        expect(serialized.length).toBe(4 + payload.length);
        expect(serialized.subarray(4)).toEqual(payload);
    });

    it("deserialize parses header and payload", () => {
        // Build a buffer: 4-byte header (id=7, length=3) + 3 bytes payload
        const header = Buffer.alloc(4);
        header.writeInt16BE(7, 0);   // id
        header.writeInt16BE(3, 2);   // length
        const payload = Buffer.from([9, 8, 7]);
        const combined = Buffer.concat([header, payload]);

        const msg = new RawMessage();
        msg.deserialize(combined);

        expect(msg.id).toBe(7);
        expect(msg.length).toBe(3);
        // Accessing serialized data via serialize() to compare payload content
        const out = msg.serialize();
        expect(out.subarray(4)).toEqual(payload);
    });

    it("deserialize throws for buffers smaller than 4 bytes", () => {
        const msg = new RawMessage();
        expect(() => msg.deserialize(Buffer.alloc(3))).toThrow();
    });
});