import { describe, it, expect } from "vitest";
import { DamagedPartsMessage } from "./DamagedPartsMessage.js";

describe("DamagedPartsMessage", () => {
    it("reports the fixed size", () => {
        expect(DamagedPartsMessage.FIXED_SIZE).toBe(243);
        expect(DamagedPartsMessage.MAX_PARTS).toBe(47);
    });

    it("a default instance serializes to exactly 243 bytes", () => {
        const m = new DamagedPartsMessage();
        const buf = m.serialize();
        expect(buf.length).toBe(243);
        expect(m.sizeOf).toBe(243);
    });

    it("writes the expected layout for a populated message", () => {
        const m = new DamagedPartsMessage();
        m.raceId = 88;
        m.setParts([
            { partId: 0xdeadbeef, damagePercent: 50 },
            { partId: 0xcafe0001, damagePercent: 25 },
        ]);

        const buf = m.serialize();
        expect(buf.length).toBe(243);

        // msgNo @ 0
        expect(buf.readUInt16LE(0)).toBe(240);
        // raceId @ 2
        expect(buf.readUInt32LE(2)).toBe(88);
        // noParts @ 6
        expect(buf.readUInt16LE(6)).toBe(2);
        // partID[0] @ 8
        expect(buf.readUInt32LE(8)).toBe(0xdeadbeef);
        // partID[1] @ 12
        expect(buf.readUInt32LE(12)).toBe(0xcafe0001);
        // partID[2] @ 16 (unused, must be zero)
        expect(buf.readUInt32LE(16)).toBe(0);
        // damagePercent[0] @ 196
        expect(buf.readUInt8(196)).toBe(50);
        // damagePercent[1] @ 197
        expect(buf.readUInt8(197)).toBe(25);
        // damagePercent[2] @ 198 (unused, must be zero)
        expect(buf.readUInt8(198)).toBe(0);
    });

    it("roundtrips through serialize -> deserialize", () => {
        const m1 = new DamagedPartsMessage();
        m1.raceId = 0xcafebabe;
        m1.setParts([
            { partId: 1001, damagePercent: 10 },
            { partId: 1002, damagePercent: 20 },
            { partId: 1003, damagePercent: 30 },
        ]);

        const buf = m1.serialize();
        const m2 = new DamagedPartsMessage();
        m2.deserialize(buf);

        expect(m2.raceId).toBe(0xcafebabe);
        expect(m2.noParts).toBe(3);
        expect(m2.getValidParts()).toEqual([
            { partId: 1001, damagePercent: 10 },
            { partId: 1002, damagePercent: 20 },
            { partId: 1003, damagePercent: 30 },
        ]);
        expect(m2.serialize().equals(buf)).toBe(true);
    });

    it("parses a real captured 240 packet (race 88, empty tick)", () => {
        // Captured 2026-05-07T15:27:19Z from 98.231.127.157, raceID=88.
        // See data/captures/unsupported-2026-05-07.json (gitignored).
        // Construct the same byte image: msgNo=240, raceID=88, noParts=0,
        // with stale-looking values left in the partID/damagePercent slots
        // (partID[0]=14, damagePercent[0]=25). Body is 243 bytes.
        const buf = Buffer.alloc(243);
        buf.writeUInt16LE(0x00f0, 0); // msgNo = 240
        buf.writeUInt32LE(88, 2); // raceID
        buf.writeUInt16LE(0, 6); // noParts = 0 (empty tick)
        buf.writeUInt32LE(14, 8); // partID[0] = 14 (stale, ignored)
        buf.writeUInt8(25, 196); // damagePercent[0] = 25 (stale, ignored)

        const m = new DamagedPartsMessage();
        m.deserialize(buf);

        expect(m.raceId).toBe(88);
        // The legacy server iterates 0..noParts-1, so the stale slot data is
        // ignored — getValidParts() returns no entries for an empty tick.
        expect(m.noParts).toBe(0);
        expect(m.getValidParts()).toEqual([]);
        // But the underlying buffer still preserves the stale values
        // (a roundtrip serialization keeps the same body image).
        expect(m.serialize().equals(buf)).toBe(true);
    });

    it("rejects buffers shorter than the fixed size", () => {
        const m = new DamagedPartsMessage();
        expect(() => m.deserialize(Buffer.alloc(242))).toThrow();
    });

    it("rejects setParts() over MAX_PARTS", () => {
        const m = new DamagedPartsMessage();
        const entries = new Array(48).fill({ partId: 1, damagePercent: 1 });
        expect(() => m.setParts(entries)).toThrow(RangeError);
    });

    it("rejects out-of-range damagePercent values", () => {
        const m = new DamagedPartsMessage();
        expect(() =>
            m.setParts([{ partId: 1, damagePercent: -1 }]),
        ).toThrow(RangeError);
        expect(() =>
            m.setParts([{ partId: 1, damagePercent: 256 }]),
        ).toThrow(RangeError);
    });

    it("toString() emits a JSON summary", () => {
        const m = new DamagedPartsMessage();
        m.raceId = 88;
        m.setParts([{ partId: 1, damagePercent: 1 }]);
        const summary = m.toString();
        expect(summary).toContain('"raceId":88');
        expect(summary).toContain('"noParts":1');
        expect(summary).toContain('"msgNo":240');
    });
});
