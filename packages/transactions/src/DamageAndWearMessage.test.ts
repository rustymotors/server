import { describe, it, expect } from "vitest";
import { DamageAndWearMessage } from "./DamageAndWearMessage.js";

describe("DamageAndWearMessage", () => {
    it("reports the header and record sizes", () => {
        expect(DamageAndWearMessage.HEADER_SIZE).toBe(8);
        expect(DamageAndWearMessage.RECORD_SIZE).toBe(8);
    });

    it("an empty instance serializes to exactly 8 bytes", () => {
        const m = new DamageAndWearMessage();
        const buf = m.serialize();
        expect(buf.length).toBe(8);
        expect(m.sizeOf).toBe(8);
    });

    it("packs and unpacks (damagePercent, wear) into packedDamWear", () => {
        const m = new DamageAndWearMessage();
        m.raceId = 88;
        m.setEntries([
            { partId: 1001, damagePercent: 25, wear: 0x123456 },
            { partId: 1002, damagePercent: 0, wear: 0 },
            { partId: 1003, damagePercent: 0xff, wear: 0xffffff },
        ]);

        const buf = m.serialize();
        expect(buf.length).toBe(8 + 3 * 8); // 32

        // header
        expect(buf.readUInt16LE(0)).toBe(241);
        expect(buf.readUInt32LE(2)).toBe(88);
        expect(buf.readUInt16LE(6)).toBe(3);

        // record 0: damagePercent=25 (0x19) in top byte, wear=0x123456 in low 24
        expect(buf.readUInt32LE(8)).toBe(1001);
        expect(buf.readUInt32LE(12)).toBe((0x19 << 24) | 0x123456);

        // record 2: max packed = 0xFFFFFFFF
        expect(buf.readUInt32LE(8 + 16)).toBe(1003);
        expect(buf.readUInt32LE(8 + 20)).toBe(0xffffffff);
    });

    it("roundtrips through serialize -> deserialize", () => {
        const m1 = new DamageAndWearMessage();
        m1.raceId = 88;
        m1.setEntries([
            { partId: 1, damagePercent: 10, wear: 0x010203 },
            { partId: 2, damagePercent: 50, wear: 0x040506 },
        ]);

        const buf = m1.serialize();
        const m2 = new DamageAndWearMessage();
        m2.deserialize(buf);

        expect(m2.raceId).toBe(88);
        expect(m2.noParts).toBe(2);
        expect(m2.getEntries()).toEqual([
            { partId: 1, damagePercent: 10, wear: 0x010203 },
            { partId: 2, damagePercent: 50, wear: 0x040506 },
        ]);
        expect(m2.serialize().equals(buf)).toBe(true);
    });

    it("clamps record count to remaining bytes when noParts overstates the truth", () => {
        // Forge a buffer with noParts=5 but only enough bytes for 2 records.
        const buf = Buffer.alloc(8 + 16);
        buf.writeUInt16LE(241, 0);
        buf.writeUInt32LE(88, 2);
        buf.writeUInt16LE(5, 6); // claim 5
        buf.writeUInt32LE(1, 8);
        buf.writeUInt32LE(0x19000000, 12); // dam=25, wear=0
        buf.writeUInt32LE(2, 16);
        buf.writeUInt32LE(0x32000000, 20); // dam=50, wear=0

        const m = new DamageAndWearMessage();
        m.deserialize(buf);
        expect(m.noParts).toBe(5);
        // But only 2 records actually fit — we don't throw.
        expect(m.getEntries()).toHaveLength(2);
    });

    it("rejects buffers shorter than the header", () => {
        const m = new DamageAndWearMessage();
        expect(() => m.deserialize(Buffer.alloc(7))).toThrow();
    });

    it("rejects out-of-range damagePercent / wear", () => {
        const m = new DamageAndWearMessage();
        expect(() =>
            m.setEntries([{ partId: 1, damagePercent: -1, wear: 0 }]),
        ).toThrow(RangeError);
        expect(() =>
            m.setEntries([{ partId: 1, damagePercent: 256, wear: 0 }]),
        ).toThrow(RangeError);
        expect(() =>
            m.setEntries([{ partId: 1, damagePercent: 0, wear: -1 }]),
        ).toThrow(RangeError);
        expect(() =>
            m.setEntries([{ partId: 1, damagePercent: 0, wear: 0x1000000 }]),
        ).toThrow(RangeError);
    });
});
