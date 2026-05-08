import { describe, it, expect } from "vitest";
import { BodyDamageMessage } from "./BodyDamageMessage.js";

describe("BodyDamageMessage", () => {
    it("reports the header size", () => {
        expect(BodyDamageMessage.HEADER_SIZE).toBe(12);
    });

    it("an empty-damage instance serializes to exactly 12 bytes", () => {
        const m = new BodyDamageMessage();
        const buf = m.serialize();
        expect(buf.length).toBe(12);
        expect(m.sizeOf).toBe(12);
    });

    it("writes the expected layout for a populated message", () => {
        const m = new BodyDamageMessage();
        m.vehicleId = 0xcafebabe;
        m.raceId = 88;
        m.setDamage(Buffer.from([0xaa, 0xbb, 0xcc, 0xdd]));

        const buf = m.serialize();
        expect(buf.length).toBe(16); // 12 + 4
        expect(buf.readUInt16LE(0)).toBe(202);
        expect(buf.readUInt32LE(2)).toBe(0xcafebabe);
        expect(buf.readUInt32LE(6)).toBe(88);
        expect(buf.readUInt16LE(10)).toBe(4); // damageLength
        expect(buf.subarray(12, 16).toString("hex")).toBe("aabbccdd");
    });

    it("roundtrips through serialize -> deserialize", () => {
        const m1 = new BodyDamageMessage();
        m1.vehicleId = 1234;
        m1.raceId = 88;
        m1.setDamage(Buffer.from("48656c6c6f", "hex")); // "Hello"

        const buf = m1.serialize();
        const m2 = new BodyDamageMessage();
        m2.deserialize(buf);

        expect(m2.vehicleId).toBe(1234);
        expect(m2.raceId).toBe(88);
        expect(m2.damageLength).toBe(5);
        expect(m2.damage.toString("hex")).toBe("48656c6c6f");
        expect(m2.serialize().equals(buf)).toBe(true);
    });

    it("supports raceId=0 (out-of-race damage commit)", () => {
        const m = new BodyDamageMessage();
        m.vehicleId = 1;
        m.raceId = 0;
        m.setDamage(Buffer.from([0x01]));

        const buf = m.serialize();
        const m2 = new BodyDamageMessage();
        m2.deserialize(buf);
        expect(m2.raceId).toBe(0);
        expect(m2.damageLength).toBe(1);
    });

    it("clamps damage to remaining bytes when length field overstates the buffer", () => {
        const m1 = new BodyDamageMessage();
        m1.setDamage(Buffer.from([0x01, 0x02, 0x03]));
        const buf = m1.serialize();

        // Corrupt: claim 100 bytes but only 3 follow.
        buf.writeUInt16LE(100, 10);
        const m2 = new BodyDamageMessage();
        m2.deserialize(buf);
        expect(m2.damageLength).toBe(100); // declared
        expect(m2.damage.length).toBe(3); // actual
    });

    it("rejects buffers shorter than the header", () => {
        const m = new BodyDamageMessage();
        expect(() => m.deserialize(Buffer.alloc(11))).toThrow();
    });

    it("rejects damage blobs larger than u16", () => {
        const m = new BodyDamageMessage();
        expect(() => m.setDamage(Buffer.alloc(65536))).toThrow(RangeError);
    });
});
