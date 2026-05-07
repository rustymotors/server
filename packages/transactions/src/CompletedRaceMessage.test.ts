import { describe, it, expect } from 'vitest';
import { CompletedRaceMessage } from './CompletedRaceMessage.js';

describe('CompletedRaceMessage', () => {
    it('reports the fixed prefix size', () => {
        expect(CompletedRaceMessage.FIXED_PREFIX_SIZE).toBe(30);
    });

    it('an empty-travelMap instance serializes to exactly 30 bytes', () => {
        const m = new CompletedRaceMessage();
        const buf = m.serialize();
        expect(buf.length).toBe(30);
        expect(m.sizeOf).toBe(30);
    });

    it('writes the expected layout for a populated message', () => {
        const m = new CompletedRaceMessage();
        m.raceId = 0xcafebabe;
        m.id = 21; // persona id
        m.topSpeed = 87; // m/s
        m.avgSpeed = 64; // m/s
        m.completionTime = 64 * 90; // 90 seconds at 64Hz
        m.bestLapTime = 64 * 22; // 22 seconds
        m.securityFlags = 0;
        m.setTravelMap(Buffer.from([0xaa, 0xbb, 0xcc, 0xdd]));

        const buf = m.serialize();
        expect(buf.length).toBe(34); // 30 + 4

        // msgNo at offset 0
        expect(buf.readInt16LE(0)).toBe(221);
        // topSpeed at offset 2
        expect(buf.readUInt16LE(2)).toBe(87);
        // raceId at offset 4
        expect(buf.readUInt32LE(4)).toBe(0xcafebabe);
        // id at offset 8
        expect(buf.readUInt32LE(8)).toBe(21);
        // completionTime at offset 12
        expect(buf.readUInt32LE(12)).toBe(64 * 90);
        // bestLapTime at offset 16
        expect(buf.readUInt32LE(16)).toBe(64 * 22);
        // avgSpeed at offset 20
        expect(buf.readUInt16LE(20)).toBe(64);
        // securityFlags at offset 22
        expect(buf.readUInt32LE(22)).toBe(0);
        // travelMapLength at offset 26
        expect(buf.readUInt32LE(26)).toBe(4);
        // travelMap bytes at offset 30
        expect(buf.subarray(30, 34).toString('hex')).toBe('aabbccdd');
    });

    it('roundtrips through serialize → deserialize (with travelMap)', () => {
        const m1 = new CompletedRaceMessage();
        m1.raceId = 88;
        m1.id = 21;
        m1.topSpeed = 100;
        m1.avgSpeed = 75;
        m1.completionTime = 12345;
        m1.bestLapTime = 6789;
        m1.securityFlags = 0xdeadbeef;
        m1.setTravelMap(Buffer.from('48656c6c6f', 'hex')); // "Hello"

        const buf = m1.serialize();

        const m2 = new CompletedRaceMessage();
        m2.deserialize(buf);

        expect(m2.raceId).toBe(88);
        expect(m2.id).toBe(21);
        expect(m2.topSpeed).toBe(100);
        expect(m2.avgSpeed).toBe(75);
        expect(m2.completionTime).toBe(12345);
        expect(m2.bestLapTime).toBe(6789);
        expect(m2.securityFlags).toBe(0xdeadbeef);
        expect(m2.travelMapLength).toBe(5);
        expect(m2.travelMap.toString('hex')).toBe('48656c6c6f');

        expect(m2.serialize().equals(buf)).toBe(true);
    });

    it('handles zero-length travelMap', () => {
        const m1 = new CompletedRaceMessage();
        m1.raceId = 1;
        m1.id = 2;
        m1.setTravelMap(Buffer.alloc(0));

        const buf = m1.serialize();
        expect(buf.length).toBe(30);
        expect(buf.readUInt32LE(26)).toBe(0); // travelMapLength

        const m2 = new CompletedRaceMessage();
        m2.deserialize(buf);
        expect(m2.travelMapLength).toBe(0);
        expect(m2.travelMap.length).toBe(0);
    });

    it('clamps travelMap to remaining bytes when length field overstates the buffer', () => {
        const m1 = new CompletedRaceMessage();
        m1.setTravelMap(Buffer.from([0x01, 0x02, 0x03]));
        const buf = m1.serialize();
        expect(buf.length).toBe(33);

        // Corrupt the length field: claim 100 bytes but only 3 are actually present.
        buf.writeUInt32LE(100, 26);

        const m2 = new CompletedRaceMessage();
        m2.deserialize(buf);
        expect(m2.travelMapLength).toBe(100);
        // ...but the parser only takes what's there, no throw:
        expect(m2.travelMap.length).toBe(3);
    });

    it('rejects buffers shorter than the fixed prefix', () => {
        const m = new CompletedRaceMessage();
        expect(() => m.deserialize(Buffer.alloc(29))).toThrow();
    });

    it('rejects out-of-range topSpeed and avgSpeed', () => {
        const m = new CompletedRaceMessage();
        expect(() => {
            m.topSpeed = -1;
        }).toThrow(RangeError);
        expect(() => {
            m.topSpeed = 0x10000;
        }).toThrow(RangeError);
        expect(() => {
            m.avgSpeed = -1;
        }).toThrow(RangeError);
    });

    it('toString() emits a JSON summary', () => {
        const m = new CompletedRaceMessage();
        m.raceId = 88;
        m.id = 21;
        m.topSpeed = 100;
        m.completionTime = 12345;
        const summary = m.toString();
        expect(summary).toContain('"raceId":88');
        expect(summary).toContain('"id":21');
        expect(summary).toContain('"topSpeed":100');
        expect(summary).toContain('"completionTime":12345');
    });
});
