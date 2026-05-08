import { describe, it, expect } from "vitest";
import { CrcPostRaceDataMessage } from "./CrcPostRaceDataMessage.js";

describe("CrcPostRaceDataMessage", () => {
    it("reports the fixed size", () => {
        expect(CrcPostRaceDataMessage.FIXED_SIZE).toBe(58);
        expect(CrcPostRaceDataMessage.MAX_PLAYERS).toBe(4);
        expect(CrcPostRaceDataMessage.PLAYER_RECORD_SIZE).toBe(12);
    });

    it("a default instance serializes to exactly 58 bytes", () => {
        const m = new CrcPostRaceDataMessage();
        const buf = m.serialize();
        expect(buf.length).toBe(58);
        expect(m.sizeOf).toBe(58);
    });

    it("writes the expected layout for a populated message", () => {
        const m = new CrcPostRaceDataMessage();
        m.checkSum = 0x12345678;
        m.raceId = 88;
        m.setPlayerCrc(0, 21, 0xc5de69e0, 0xae59991d);
        m.setPlayerCrc(1, 22, 0x11111111, 0x22222222);

        const buf = m.serialize();
        expect(buf.length).toBe(58);

        // header
        expect(buf.readUInt16LE(0)).toBe(435);
        expect(buf.readUInt32LE(2)).toBe(0x12345678);
        expect(buf.readUInt32LE(6)).toBe(88);

        // playerCRC[0] @ offset 10
        expect(buf.readUInt32LE(10)).toBe(21);
        expect(buf.readUInt32LE(14)).toBe(0xc5de69e0);
        expect(buf.readUInt32LE(18)).toBe(0xae59991d);

        // playerCRC[1] @ offset 22
        expect(buf.readUInt32LE(22)).toBe(22);
        expect(buf.readUInt32LE(26)).toBe(0x11111111);
        expect(buf.readUInt32LE(30)).toBe(0x22222222);

        // playerCRC[2] (unset) @ offset 34 — zeros
        expect(buf.readUInt32LE(34)).toBe(0);
        expect(buf.readUInt32LE(38)).toBe(0);
        expect(buf.readUInt32LE(42)).toBe(0);

        // playerCRC[3] (unset) @ offset 46 — zeros
        expect(buf.readUInt32LE(46)).toBe(0);
    });

    it("roundtrips through serialize -> deserialize", () => {
        const m1 = new CrcPostRaceDataMessage();
        m1.checkSum = 0xdeadbeef;
        m1.raceId = 99;
        m1.setPlayerCrc(0, 21, 0xaaaa1111, 0xbbbb2222);
        m1.setPlayerCrc(1, 22, 0xcccc3333, 0xdddd4444);
        m1.setPlayerCrc(2, 23, 0xeeee5555, 0xffff6666);
        m1.setPlayerCrc(3, 24, 0x00007777, 0x00008888);

        const buf = m1.serialize();
        const m2 = new CrcPostRaceDataMessage();
        m2.deserialize(buf);

        expect(m2.checkSum).toBe(0xdeadbeef);
        expect(m2.raceId).toBe(99);
        expect(m2.getPlayerCrcs()).toEqual([
            {
                playerId: 21,
                playerVehicleCRC: 0xaaaa1111,
                playerModelCRC: 0xbbbb2222,
            },
            {
                playerId: 22,
                playerVehicleCRC: 0xcccc3333,
                playerModelCRC: 0xdddd4444,
            },
            {
                playerId: 23,
                playerVehicleCRC: 0xeeee5555,
                playerModelCRC: 0xffff6666,
            },
            {
                playerId: 24,
                playerVehicleCRC: 0x00007777,
                playerModelCRC: 0x00008888,
            },
        ]);
        expect(m2.serialize().equals(buf)).toBe(true);
    });

    it("rejects buffers shorter than the fixed size", () => {
        const m = new CrcPostRaceDataMessage();
        expect(() => m.deserialize(Buffer.alloc(57))).toThrow();
    });

    it("rejects setPlayerCrc with an out-of-range slot", () => {
        const m = new CrcPostRaceDataMessage();
        expect(() => m.setPlayerCrc(-1, 1, 1, 1)).toThrow(RangeError);
        expect(() => m.setPlayerCrc(4, 1, 1, 1)).toThrow(RangeError);
    });

    it("toString() emits a JSON summary", () => {
        const m = new CrcPostRaceDataMessage();
        m.raceId = 88;
        m.setPlayerCrc(0, 21, 0xa, 0xb);
        const summary = m.toString();
        expect(summary).toContain('"raceId":88');
        expect(summary).toContain('"msgNo":435');
        expect(summary).toContain('"playerId":21');
    });
});
