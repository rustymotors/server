import { describe, it, expect } from 'vitest';
import {
    StartingRacers,
    StartingRacersResult,
    StartRaceMessage,
    StartRaceResultMessage,
} from './StartRaceMessages.js';

describe('StartingRacers', () => {
    it('reports the correct fixed wire size (pack(1))', () => {
        expect(new StartingRacers().sizeOf).toBe(9);
    });

    it('serializes to exactly sizeOf bytes', () => {
        const r = new StartingRacers();
        r.id = 0x11223344;
        r.vehicleId = 0xaabbccdd;
        r.isHuman = true;
        const buf = r.serialize();
        expect(buf.length).toBe(9);
    });

    it('roundtrips id / vehicleId / isHuman through serialize+deserialize', () => {
        const r1 = new StartingRacers();
        r1.id = 0x11223344;
        r1.vehicleId = 0xaabbccdd;
        r1.isHuman = true;
        const buf = r1.serialize();

        const r2 = new StartingRacers();
        r2.deserialize(buf);
        expect(r2.id).toBe(0x11223344);
        expect(r2.vehicleId).toBe(0xaabbccdd);
        expect(r2.isHuman).toBe(true);
    });
});

describe('StartingRacersResult', () => {
    it('reports the correct fixed wire size (pack(1))', () => {
        expect(new StartingRacersResult().sizeOf).toBe(5);
    });

    it('roundtrips id / isntValid', () => {
        const r1 = new StartingRacersResult();
        r1.id = 0xdeadbeef;
        r1.isntValid = true;
        const buf = r1.serialize();
        expect(buf.length).toBe(5);

        const r2 = new StartingRacersResult();
        r2.deserialize(buf);
        expect(r2.id).toBe(0xdeadbeef);
        expect(r2.isntValid).toBe(true);
    });
});

describe('StartRaceMessage (incoming MC_RACE_START, msgNo 232)', () => {
    it('reports a fixed wire size of 70 bytes', () => {
        expect(new StartRaceMessage().sizeOf).toBe(70);
    });

    it('serializes a default instance to exactly 70 bytes', () => {
        const buf = new StartRaceMessage().serialize();
        expect(buf.length).toBe(70);
    });

    it('emits the expected msgNo for a default instance', () => {
        const buf = new StartRaceMessage().serialize();
        expect(buf.readInt16LE(0)).toBe(232);
    });

    it('decodes a real captured packet correctly', () => {
        // Real on-the-wire MC_RACE_START captured from the client:
        // raceID 88, one human racer (id 21, vehicleID 1), night-driving
        // lobbyFlag, no multi-round, no laps, no drag handicap.
        const captured = Buffer.from(
            'e8005800000015000000010000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000',
            'hex',
        );
        expect(captured.length).toBe(70);

        const m = new StartRaceMessage();
        m.deserialize(captured);

        expect(m.raceId).toBe(88);
        expect(m.multiRoundLimit).toBe(0);
        expect(m.numLaps).toBe(0);
        expect(m.lobbyFlags).toBe(0x08); // MCDefs_kLOBBYFLAGS_NIGHTDRIVING
        expect(m.dialinTick0).toBe(0);
        expect(m.dialinTick1).toBe(0);

        expect(m.racers).toHaveLength(6);
        expect(m.racers[0]?.id).toBe(21);
        expect(m.racers[0]?.vehicleId).toBe(1);
        expect(m.racers[0]?.isHuman).toBe(true);
        for (let i = 1; i < 6; i++) {
            expect(m.racers[i]?.id).toBe(0);
            expect(m.racers[i]?.vehicleId).toBe(0);
            expect(m.racers[i]?.isHuman).toBe(false);
        }

        // Re-serialize and confirm byte-for-byte equality with the capture.
        expect(m.serialize().equals(captured)).toBe(true);
    });

    it('roundtrips a fully-populated hand-built wire buffer', () => {
        // Build a 70-byte buffer mirroring the C struct under pack(1).
        const buf = Buffer.alloc(70);
        buf.writeInt16LE(232, 0); // msgNo
        buf.writeUInt32LE(0xcafebabe, 2); // raceID
        for (let i = 0; i < 6; i++) {
            const off = 6 + i * 9;
            buf.writeUInt32LE(1000 + i, off); // id
            buf.writeUInt32LE(2000 + i, off + 4); // vehicleID
            buf.writeUInt8(i % 2 === 0 ? 1 : 0, off + 8); // isHuman
        }
        buf.writeUInt8(3, 60); // multiRoundLimit
        buf.writeUInt8(8, 61); // numLaps
        buf.writeUInt32LE(0x40, 62); // lobbyFlags
        buf.writeUInt16LE(0x1111, 66); // dialinTicks[0]
        buf.writeUInt16LE(0x2222, 68); // dialinTicks[1]

        const m = new StartRaceMessage();
        m.deserialize(buf);

        expect(m.raceId).toBe(0xcafebabe);
        expect(m.multiRoundLimit).toBe(3);
        expect(m.numLaps).toBe(8);
        expect(m.lobbyFlags).toBe(0x40);
        expect(m.dialinTick0).toBe(0x1111);
        expect(m.dialinTick1).toBe(0x2222);
        for (let i = 0; i < 6; i++) {
            expect(m.racers[i]?.id).toBe(1000 + i);
            expect(m.racers[i]?.vehicleId).toBe(2000 + i);
            expect(m.racers[i]?.isHuman).toBe(i % 2 === 0);
        }

        expect(m.serialize().equals(buf)).toBe(true);
    });
});

describe('StartRaceResultMessage (outgoing MC_RACE_STARTED, msgNo 233)', () => {
    it('reports a fixed wire size of 40 bytes', () => {
        expect(new StartRaceResultMessage().sizeOf).toBe(40);
    });

    it('serializes to exactly 40 bytes with the expected layout', () => {
        const m = new StartRaceResultMessage();
        m.raceId = 0x12345678;
        m.okToStart = true;
        m.setRacer(0, 1001);
        m.setRacer(1, 1002);
        m.setRacer(2, 1003);

        const buf = m.serialize();
        expect(buf.length).toBe(40);

        // msgNo = 233 at offset 0
        expect(buf.readInt16LE(0)).toBe(233);
        // raceId at offset 2
        expect(buf.readUInt32LE(2)).toBe(0x12345678);
        // okToStart (BOOL = int) at offset 6 should be 1
        expect(buf.readInt32LE(6)).toBe(1);
        // racer[0] id at offset 10 (start of racers array)
        expect(buf.readUInt32LE(10)).toBe(1001);
        // racer[1] id at offset 15 (10 + 5)
        expect(buf.readUInt32LE(15)).toBe(1002);
        // racer[2] id at offset 20
        expect(buf.readUInt32LE(20)).toBe(1003);
        // racer[3] id at offset 25 — not set, should be 0
        expect(buf.readUInt32LE(25)).toBe(0);
    });

    it('encodes okToStart=false as a 4-byte zero', () => {
        const m = new StartRaceResultMessage();
        m.okToStart = false;
        const buf = m.serialize();
        expect(buf.readInt32LE(6)).toBe(0);
    });

    it('roundtrips through serialize → deserialize', () => {
        const m1 = new StartRaceResultMessage();
        m1.raceId = 0xabcd1234;
        m1.okToStart = true;
        m1.setRacer(0, 100, false);
        m1.setRacer(1, 200, true);
        m1.setRacer(5, 600, true);

        const buf = m1.serialize();

        const m2 = new StartRaceResultMessage();
        m2.deserialize(buf);

        expect(m2.raceId).toBe(0xabcd1234);
        expect(m2.okToStart).toBe(true);
        expect(m2.racers[0]?.id).toBe(100);
        expect(m2.racers[0]?.isntValid).toBe(false);
        expect(m2.racers[1]?.id).toBe(200);
        expect(m2.racers[1]?.isntValid).toBe(true);
        expect(m2.racers[5]?.id).toBe(600);
        expect(m2.racers[5]?.isntValid).toBe(true);

        expect(m2.serialize().equals(buf)).toBe(true);
    });

    it('rejects out-of-range racer indices', () => {
        const m = new StartRaceResultMessage();
        expect(() => m.setRacer(-1, 1)).toThrow(RangeError);
        expect(() => m.setRacer(6, 1)).toThrow(RangeError);
    });
});
