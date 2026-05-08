import { describe, it, expect } from "vitest";
import { RacerLeftRaceMessage } from "./RacerLeftRaceMessage.js";

describe("RacerLeftRaceMessage", () => {
    it("reports the fixed size", () => {
        expect(RacerLeftRaceMessage.FIXED_SIZE).toBe(10);
    });

    it("a default instance serializes to exactly 10 bytes", () => {
        const m = new RacerLeftRaceMessage();
        expect(m.serialize().length).toBe(10);
        expect(m.sizeOf).toBe(10);
    });

    it("writes the expected layout", () => {
        const m = new RacerLeftRaceMessage();
        m.raceId = 88;
        const buf = m.serialize();
        expect(buf.readUInt16LE(0)).toBe(235);
        expect(buf.readInt32LE(2)).toBe(88);
        expect(buf.readInt32LE(6)).toBe(0); // unused data2
    });

    it("roundtrips through serialize -> deserialize", () => {
        const m1 = new RacerLeftRaceMessage();
        m1.raceId = 0x12345678;
        const buf = m1.serialize();
        const m2 = new RacerLeftRaceMessage();
        m2.deserialize(buf);
        expect(m2.raceId).toBe(0x12345678);
        expect(m2.serialize().equals(buf)).toBe(true);
    });

    it("rejects buffers shorter than the fixed size", () => {
        const m = new RacerLeftRaceMessage();
        expect(() => m.deserialize(Buffer.alloc(9))).toThrow();
    });

    it("toString() emits a JSON summary", () => {
        const m = new RacerLeftRaceMessage();
        m.raceId = 88;
        expect(m.toString()).toContain('"raceId":88');
        expect(m.toString()).toContain('"msgNo":235');
    });
});
