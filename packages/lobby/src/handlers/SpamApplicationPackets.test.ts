import { describe, it, expect } from 'vitest';
import { NpsRelaySingleMessage } from './NpsRelaySingleMessage.js';
import {
    CarPositionFrame,
    SpamBigPacketHeader,
    SpamPositionPacket,
    SpamRacerFinishedPacket,
    SpamScorePacket,
} from './SpamApplicationPackets.js';

// Capture B: NPS_SEND_NOT_SINGLE_LONG carrying a SpamPositionPacket.
const CAPTURE_B = Buffer.from(
    '0097004000000000000000150000001505ff7300000002800100158042b8108000000000000000000000000000bed20000412dffff040100001ccc3147dfb955',
    'hex',
);

// Capture A: NPS_SEND_NOT_SINGLE_LONG carrying a BIG_PACKET fragment.
const CAPTURE_A = Buffer.from(
    '0097011000000000000000150000001508060201150000006a01cccce03501000000000000004657504240794942000000000000000000000000000000000000000000000000000000000100000000000000000000000300000000000000000000000000000000000000000000000000000000000000a6e710007515000000000000000000008134fc4090fa724045f3c7c0807bec3c1cf03a454012a340cccca8fc12000c99c70000000000f4fa1200a03c71004cfb120000fb120000a0fd7fcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc03000000cccccccc027478c7',
    'hex',
);

describe('SpamPositionPacket', () => {
    it('parses the SPAM_POSITION blob from real capture B', () => {
        const relay = NpsRelaySingleMessage.deserialize(CAPTURE_B);
        expect(relay.applicationPacketType).toBe(SpamPositionPacket.TYPE);

        const pos = SpamPositionPacket.deserialize(relay.blob);
        expect(pos.tickSent).toBe(0x000073ff); // 29695
        // The 48-byte blob has 1 full 36-byte frame; trailing 7 bytes are slop.
        expect(pos.frames).toHaveLength(1);
        expect(pos.frames[0]?.carIndex).toBe(0); // first byte of the frame
    });

    it('rejects a blob with the wrong type byte', () => {
        const bad = Buffer.from([0x09, 0, 0, 0, 0]);
        expect(() => SpamPositionPacket.deserialize(bad)).toThrow(/first byte/);
    });

    it('rejects a buffer shorter than the 5-byte header', () => {
        expect(() => SpamPositionPacket.deserialize(Buffer.alloc(4))).toThrow(
            /at least 5 bytes/,
        );
    });

    it('synthesizes and parses a 6-frame packet', () => {
        const buf = Buffer.alloc(5 + 6 * 36);
        buf.writeUInt8(SpamPositionPacket.TYPE, 0);
        buf.writeInt32LE(0xdeadbeef | 0, 1); // tickSent
        for (let i = 0; i < 6; i++) {
            const off = 5 + i * 36;
            buf.writeInt8(i, off); // carIndex
            buf.writeInt16LE(100 * i, off + 30); // sliceTotal
            buf.writeUInt32LE(0, off + 32); // flags
        }
        const pos = SpamPositionPacket.deserialize(buf);
        expect(pos.frames).toHaveLength(6);
        for (let i = 0; i < 6; i++) {
            expect(pos.frames[i]?.carIndex).toBe(i);
            expect(pos.frames[i]?.sliceTotal).toBe(100 * i);
        }
    });
});

describe('CarPositionFrame', () => {
    it('decodes orientation as 14.2 fixed-point', () => {
        const buf = Buffer.alloc(36);
        buf.writeInt8(2, 0); // carIndex
        // qOrient at offset 22, four shorts:
        buf.writeInt16LE(4, 22); // x = 1.0
        buf.writeInt16LE(-4, 24); // y = -1.0
        buf.writeInt16LE(8, 26); // z = 2.0
        buf.writeInt16LE(2, 28); // w = 0.5
        const f = CarPositionFrame.deserialize(buf);
        expect(f.carIndex).toBe(2);
        expect(f.orientation.x).toBeCloseTo(1.0);
        expect(f.orientation.y).toBeCloseTo(-1.0);
        expect(f.orientation.z).toBeCloseTo(2.0);
        expect(f.orientation.w).toBeCloseTo(0.5);
    });

    it('decodes flag bits', () => {
        const buf = Buffer.alloc(36);
        // Set: horn(bit0) + brake(bit4) + gear=3 (bits 7..10) + flying(bit12)
        const flags = 0x0001 | 0x0010 | (3 << 7) | (1 << 12);
        buf.writeUInt32LE(flags, 32);
        const f = CarPositionFrame.deserialize(buf);
        expect(f.flags.horn).toBe(true);
        expect(f.flags.brake).toBe(true);
        expect(f.flags.gear).toBe(3);
        expect(f.flags.flying).toBe(true);
        expect(f.flags.wrongWay).toBe(false);
    });
});

describe('SpamBigPacketHeader', () => {
    it('parses the BIG_PACKET header from real capture A', () => {
        const relay = NpsRelaySingleMessage.deserialize(CAPTURE_A);
        expect(relay.applicationPacketType).toBe(SpamBigPacketHeader.TYPE);

        const big = SpamBigPacketHeader.deserialize(relay.blob);
        expect(big.innerType).toBe(6); // SPAM_SYNC_FINAL_STATS
        expect(big.totalChunks).toBe(2);
        expect(big.chunkIndex).toBe(1); // second-of-two fragment
        expect(big.channelId0).toBe(21); // sender persona
        expect(big.innerLength).toBe(0x016a); // 362 bytes total reassembled
        expect(big.channelId1).toBe(0x000135e0);
    });

    it('rejects wrong type byte', () => {
        const bad = Buffer.alloc(16);
        bad.writeUInt8(7, 0);
        expect(() => SpamBigPacketHeader.deserialize(bad)).toThrow();
    });
});

describe('SpamRacerFinishedPacket', () => {
    it('roundtrips fields from a synthetic 8-byte packet', () => {
        const buf = Buffer.alloc(8);
        buf.writeUInt8(SpamRacerFinishedPacket.TYPE, 0);
        buf.writeInt32LE(123456, 1);
        buf.writeInt8(3, 5); // carIndex
        buf.writeInt8(2, 6); // finishType (e.g., DNF or whichever)
        buf.writeInt8(1, 7); // faulted = true

        const p = SpamRacerFinishedPacket.deserialize(buf);
        expect(p.tickSent).toBe(123456);
        expect(p.carIndex).toBe(3);
        expect(p.finishType).toBe(2);
        expect(p.faulted).toBe(true);
    });
});

describe('SpamScorePacket', () => {
    it('roundtrips a 6-byte score packet', () => {
        const buf = Buffer.alloc(6);
        buf.writeUInt8(SpamScorePacket.TYPE, 0);
        buf.writeInt8(1, 1);
        buf.writeInt32LE(98765, 2);

        const s = SpamScorePacket.deserialize(buf);
        expect(s.carIndex).toBe(1);
        expect(s.stuntScore).toBe(98765);
    });
});
