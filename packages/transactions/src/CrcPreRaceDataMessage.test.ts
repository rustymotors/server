import { describe, it, expect } from "vitest";
import { CrcPreRaceDataMessage } from "./CrcPreRaceDataMessage.js";

describe("CrcPreRaceDataMessage", () => {
    it("reports the header size", () => {
        expect(CrcPreRaceDataMessage.HEADER_SIZE).toBe(22);
    });

    it("an empty-blob instance serializes to exactly 22 bytes", () => {
        const m = new CrcPreRaceDataMessage();
        const buf = m.serialize();
        expect(buf.length).toBe(22);
        expect(m.sizeOf).toBe(22);
    });

    it("writes the expected header layout", () => {
        const m = new CrcPreRaceDataMessage();
        m.checkSum = 0x00008a67;
        m.raceId = 88;
        m.trackCRC = 0x14b87af3;
        m.sliceInfoCRC = 0x9e3ca5af;
        m.pacejkaCRC = 0x1df0ea13;

        const buf = m.serialize();
        expect(buf.length).toBe(22);

        expect(buf.readUInt16LE(0)).toBe(434);
        expect(buf.readUInt32LE(2)).toBe(0x00008a67);
        expect(buf.readUInt32LE(6)).toBe(88);
        expect(buf.readUInt32LE(10)).toBe(0x14b87af3);
        expect(buf.readUInt32LE(14)).toBe(0x9e3ca5af);
        expect(buf.readUInt32LE(18)).toBe(0x1df0ea13);
    });

    it("roundtrips header + opaque players blob", () => {
        const m1 = new CrcPreRaceDataMessage();
        m1.checkSum = 0xdeadbeef;
        m1.raceId = 88;
        m1.trackCRC = 0x11111111;
        m1.sliceInfoCRC = 0x22222222;
        m1.pacejkaCRC = 0x33333333;
        m1.setPlayersBlob(Buffer.from("aabbccdd0011", "hex"));

        const buf = m1.serialize();
        expect(buf.length).toBe(22 + 6);

        const m2 = new CrcPreRaceDataMessage();
        m2.deserialize(buf);

        expect(m2.checkSum).toBe(0xdeadbeef);
        expect(m2.raceId).toBe(88);
        expect(m2.trackCRC).toBe(0x11111111);
        expect(m2.sliceInfoCRC).toBe(0x22222222);
        expect(m2.pacejkaCRC).toBe(0x33333333);
        expect(m2.playersBlob.toString("hex")).toBe("aabbccdd0011");

        expect(m2.serialize().equals(buf)).toBe(true);
    });

    it("parses the real captured 434 packet header (race 88)", () => {
        // Captured 2026-05-07T14:15:20Z from 98.231.127.157, raceID=88.
        // See data/captures/unsupported-2026-05-07.json (gitignored).
        const headerHex =
            "b201" + // msgNo = 0x01b2
            "678a0000" + // checkSum
            "58000000" + // raceID = 88
            "f37ab814" + // trackCRC
            "afa53c9e" + // sliceInfoCRC
            "13eaf01d"; // pacejkaCRC
        // First TypePreRacePlayerCRC fixed prefix (16 bytes): playerID=21, ...
        const firstPlayerPrefix =
            "15000000" + "e069dec5" + "1d9959ae" + "00000000";
        const buf = Buffer.from(headerHex + firstPlayerPrefix, "hex");

        const m = new CrcPreRaceDataMessage();
        m.deserialize(buf);

        expect(m.checkSum).toBe(0x00008a67);
        expect(m.raceId).toBe(88);
        expect(m.trackCRC).toBe(0x14b87af3);
        expect(m.sliceInfoCRC).toBe(0x9e3ca5af);
        expect(m.pacejkaCRC).toBe(0x1df0ea13);
        // Players region kept as opaque blob — first 16 bytes are the prefix
        // for racer slot 0 (playerID=21).
        expect(m.playersBlob.length).toBe(16);
        expect(m.playersBlob.readUInt32LE(0)).toBe(21);
    });

    it("rejects buffers shorter than the header", () => {
        const m = new CrcPreRaceDataMessage();
        expect(() => m.deserialize(Buffer.alloc(21))).toThrow();
    });

    it("toString() emits a JSON summary", () => {
        const m = new CrcPreRaceDataMessage();
        m.raceId = 88;
        m.trackCRC = 0x14b87af3;
        m.setPlayersBlob(Buffer.alloc(123));
        const summary = m.toString();
        expect(summary).toContain('"raceId":88');
        expect(summary).toContain(`"trackCRC":${0x14b87af3}`);
        expect(summary).toContain('"playersBlobBytes":123');
    });
});
