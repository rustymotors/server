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

// Wire-format snapshot: lock in exact on-the-wire bytes for RawMessage.
// id and length are big-endian (NPS convention); payload follows immediately.
describe("RawMessage wire snapshots", () => {
    it("id=0x020e length=8 data=[de ad be ef] produces fixed hex", () => {
        const msg = new RawMessage();
        msg.id = 0x020e;
        msg.length = 8;
        msg.data = Buffer.from([0xde, 0xad, 0xbe, 0xef]);
        // Wire layout (8 bytes):
        //   [02 0e]         id=0x020e as Int16BE
        //   [00 08]         length=8 as Int16BE
        //   [de ad be ef]   payload
        expect(msg.serialize().toString("hex")).toBe("020e0008deadbeef");
    });

    it("id=0x0100 with empty data produces 4-byte header-only wire", () => {
        const msg = new RawMessage();
        msg.id = 0x0100;
        msg.length = 4;
        // Wire layout (4 bytes):
        //   [01 00]   id
        //   [00 04]   length=4
        expect(msg.serialize().toString("hex")).toBe("01000004");
    });

    it("round-trips through deserialize with no data loss", () => {
        const original = "020e0008deadbeef";
        const msg = new RawMessage();
        msg.deserialize(Buffer.from(original, "hex"));
        expect(msg.serialize().toString("hex")).toBe(original);
    });
});