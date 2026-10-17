import { describe, expect, it } from 'vitest';
import { createNpsReply } from '../src/lib/createNpsReply.js';

// The reply the real client expects, built byte by byte:
// [id: 2 BE][total length: 2 BE (4 + data)][data]
function expectedBytes(id: number, data: Buffer): Buffer {
    const header = Buffer.alloc(4);
    header.writeUInt16BE(id, 0);
    header.writeUInt16BE(4 + data.length, 2);
    return Buffer.concat([header, data]);
}

describe('createNpsReply', () => {
    const cases: Array<[string, number, Buffer]> = [
        ['no payload (tracking ping)', 0x217, Buffer.alloc(0)],
        ['4-byte payload (game server started)', 0x21c, Buffer.from([0, 0, 0, 2])],
        ['12-byte payload', 0x20e, Buffer.alloc(12, 7)],
        ['200-byte payload', 0x20e, Buffer.alloc(200, 9)],
        // the header parser guesses a version from bytes 4-5 being 01 01; the reply must not change
        ['payload starting 01 01', 0x20e, Buffer.concat([Buffer.from([1, 1]), Buffer.alloc(38, 3)])],
        ['short payload starting 01 01', 0x21c, Buffer.from([1, 1, 0, 0])],
    ];

    it.each(cases)('serializes %s to [id][length][data]', (_label, id, data) => {
        expect(createNpsReply(id, data).serialize()).toEqual(expectedBytes(id, data));
    });

    it('sets the header id, and the length once serialized', () => {
        const reply = createNpsReply(0x20e, Buffer.alloc(6));
        expect(reply.header.id).toBe(0x20e);
        reply.serialize(); // the length is filled in when the message is serialized
        expect(reply.header.messageLength).toBe(10);
    });

    it('builds an independent message each time', () => {
        const first = createNpsReply(0x210, Buffer.from([1]));
        const second = createNpsReply(0x210, Buffer.from([2]));
        expect(first.serialize()).not.toEqual(second.serialize());
    });
});
