import { describe, it, expect } from 'vitest';
import {
    describeApplicationPacketType,
    NpsRelayApplicationPacketType,
    NpsRelaySingleMessage,
    rewriteSingleEnvelope,
} from './NpsRelaySingleMessage.js';

// Two real on-the-wire MC client captures of NPS_SEND_NOT_SINGLE_LONG (0x97).
// Both are inner messages decrypted from a 0x1101 ENCRYPTED_COMMAND wrapper.
//
// Capture A: 272 bytes — application BIG_PACKET (8) carrying fragment 2 of 2
//            of inner type 6 (SPAM_SyncFinalStats), reassembled length 362.
//            End-of-race final-stats broadcast.
const CAPTURE_A = Buffer.from(
    '0097011000000000000000150000001508060201150000006a01cccce03501000000000000004657504240794942000000000000000000000000000000000000000000000000000000000100000000000000000000000300000000000000000000000000000000000000000000000000000000000000a6e710007515000000000000000000008134fc4090fa724045f3c7c0807bec3c1cf03a454012a340cccca8fc12000c99c70000000000f4fa1200a03c71004cfb120000fb120000a0fd7fcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc03000000cccccccc027478c7',
    'hex',
);

// Capture B: 64 bytes — application SPAM_POSITION (5), one car-position frame.
//            Mid-race position broadcast.
const CAPTURE_B = Buffer.from(
    '0097004000000000000000150000001505ff7300000002800100158042b8108000000000000000000000000000bed20000412dffff040100001ccc3147dfb955',
    'hex',
);

describe('NpsRelaySingleMessage', () => {
    it('reports a 16-byte header size', () => {
        expect(NpsRelaySingleMessage.HEADER_SIZE).toBe(16);
    });

    it('decodes capture A (272 bytes, BIG_PACKET inside)', () => {
        const m = NpsRelaySingleMessage.deserialize(CAPTURE_A);
        expect(m.opcode).toBe(0x97);
        expect(m.length).toBe(272);
        expect(m.commId).toBe(0);
        expect(m.senderUserId).toBe(21);
        expect(m.filterUserId).toBe(21);
        expect(m.blob.byteLength).toBe(256);
        expect(m.applicationPacketType).toBe(
            NpsRelayApplicationPacketType.BIG_PACKET,
        );
    });

    it('decodes capture B (64 bytes, SPAM_POSITION inside)', () => {
        const m = NpsRelaySingleMessage.deserialize(CAPTURE_B);
        expect(m.opcode).toBe(0x97);
        expect(m.length).toBe(64);
        expect(m.commId).toBe(0);
        expect(m.senderUserId).toBe(21);
        expect(m.filterUserId).toBe(21);
        expect(m.blob.byteLength).toBe(48);
        expect(m.applicationPacketType).toBe(
            NpsRelayApplicationPacketType.SPAM_POSITION,
        );
    });

    it('exposes the blob as a defensive copy', () => {
        const m = NpsRelaySingleMessage.deserialize(CAPTURE_B);
        const a = m.blob;
        const b = m.blob;
        expect(a).not.toBe(b);
        a[0] = 0xff;
        expect(m.blob[0]).toBe(0x05); // unchanged
    });

    it('describe() emits a useful summary', () => {
        const summary = NpsRelaySingleMessage.deserialize(CAPTURE_B).describe();
        expect(summary).toContain('opcode=0x97');
        expect(summary).toContain('sender=21');
        expect(summary).toContain('filter=21');
        expect(summary).toContain('SPAM_POSITION(5)');
    });

    it('rejects buffers shorter than the 16-byte header', () => {
        expect(() =>
            NpsRelaySingleMessage.deserialize(Buffer.alloc(15)),
        ).toThrow(/at least 16 bytes/);
    });

    it('rejects buffers whose length does not match the length field', () => {
        const truncated = CAPTURE_B.subarray(0, 32); // claim 64, give 32
        expect(() => NpsRelaySingleMessage.deserialize(truncated)).toThrow(
            /does not match buffer/,
        );
    });

    it('rejects opcodes outside the SINGLE family', () => {
        const wrongOpcode = Buffer.from(CAPTURE_B);
        wrongOpcode.writeUInt16BE(0x89, 0); // NPS_SEND_ALL_LONG (broadcast family)
        expect(() => NpsRelaySingleMessage.deserialize(wrongOpcode)).toThrow(
            /not in the SINGLE family/,
        );
    });
});

describe('rewriteSingleEnvelope', () => {
    it('drops the filterUserId field and fixes the length', () => {
        // Build a minimal 20-byte SEND packet: header(4) + commId(4) + sender(4) + filter(4) + blob(4)
        const send = Buffer.alloc(20);
        send.writeUInt16BE(0x0097, 0);  // opcode
        send.writeUInt16BE(20, 2);      // totalLength
        send.writeUInt32BE(5, 4);       // commId
        send.writeUInt32BE(42, 8);      // senderUserId
        send.writeUInt32BE(99, 12);     // filterUserId (to be dropped)
        send.writeUInt32BE(0xdeadbeef, 16); // blob

        const recv = rewriteSingleEnvelope(send);

        expect(recv.byteLength).toBe(16); // 20 - 4
        expect(recv.readUInt16BE(0)).toBe(0x0097); // opcode preserved
        expect(recv.readUInt16BE(2)).toBe(16);     // length corrected
        expect(recv.readUInt32BE(4)).toBe(5);      // commId preserved
        expect(recv.readUInt32BE(8)).toBe(42);     // senderUserId preserved
        expect(recv.readUInt32BE(12)).toBe(0xdeadbeef); // blob at correct offset
    });

    it('passes through buffers shorter than the 16-byte header unchanged', () => {
        const short = Buffer.alloc(10);
        expect(rewriteSingleEnvelope(short)).toBe(short);
    });

    it('rewrites capture B correctly', () => {
        const recv = rewriteSingleEnvelope(CAPTURE_B);
        expect(recv.byteLength).toBe(CAPTURE_B.byteLength - 4);
        expect(recv.readUInt16BE(0)).toBe(0x0097);
        expect(recv.readUInt16BE(2)).toBe(recv.byteLength);
    });
});

describe('describeApplicationPacketType', () => {
    it('maps known indices to names', () => {
        expect(describeApplicationPacketType(0)).toBe('FIRST_CONTACT');
        expect(describeApplicationPacketType(5)).toBe('SPAM_POSITION');
        expect(describeApplicationPacketType(6)).toBe('SPAM_SYNC_FINAL_STATS');
        expect(describeApplicationPacketType(8)).toBe('BIG_PACKET');
        expect(describeApplicationPacketType(10)).toBe('SPAM_SCORE');
    });

    it('returns UNKNOWN for out-of-range bytes', () => {
        expect(describeApplicationPacketType(11)).toBe('UNKNOWN');
        expect(describeApplicationPacketType(255)).toBe('UNKNOWN');
        expect(describeApplicationPacketType(-1)).toBe('UNKNOWN');
    });
});
