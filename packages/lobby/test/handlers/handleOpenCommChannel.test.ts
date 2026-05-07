import { describe, expect, it } from 'vitest';
import {
    createNPSChannelGrantedPacket,
    parseOpenCommChannelMessage,
} from '../../src/handlers/handleOpenCommChannel.js';
import { BytableMessage } from '@rustymotors/binary';

function buildOpenCommChannelBuffer(commId: number, riffName: string, userId: number): Buffer {
    const riffBuf = Buffer.from(riffName);
    const riffLen = riffBuf.length + 1; // +1 null terminator

    const parts: Buffer[] = [];

    // l commId
    const commIdBuf = Buffer.alloc(4); commIdBuf.writeInt32BE(commId); parts.push(commIdBuf);
    // p riffName (4-byte length prefix + string + null)
    const riffPrefix = Buffer.alloc(4); riffPrefix.writeUInt32BE(riffLen); parts.push(riffPrefix);
    parts.push(riffBuf);
    parts.push(Buffer.alloc(1, 0)); // null terminator
    // l slotNumber, slotFlags, portNumber, protocol
    parts.push(Buffer.alloc(16, 0));
    // l userId
    const userIdBuf = Buffer.alloc(4); userIdBuf.writeInt32BE(userId); parts.push(userIdBuf);
    // s x6 (connectedUsers, openChannels, canReady, gameReady, isMaster, channelType)
    parts.push(Buffer.alloc(12, 0));
    // p password (4-byte prefix + 1 null byte)
    parts.push(Buffer.from([0x00, 0x00, 0x00, 0x01, 0x00]));
    // s disableBacklog (2), c gameServerIsRunning/Boolean (1), s launchGameServer (2), s maxReadyPlayers (2)
    parts.push(Buffer.alloc(7, 0));
    // l sku, sendRate
    parts.push(Buffer.alloc(8, 0));
    // b channelData (256 bytes)
    parts.push(Buffer.alloc(256, 0));
    // l flags
    parts.push(Buffer.alloc(4, 0));

    const body = Buffer.concat(parts);
    // Prepend NPS header (4 bytes)
    const header = Buffer.alloc(4);
    header.writeUInt16BE(0x0106, 0);
    header.writeUInt16BE(4 + body.length, 2);
    return Buffer.concat([header, body]);
}

describe('createNPSChannelGrantedPacket', () => {
    it('response wire opcode is 0x0214 (NPS_CHANNEL_GRANTED)', () => {
        const packet = createNPSChannelGrantedPacket(5, 9000);
        const bytes = packet.serialize();
        expect(bytes[0]).toBe(0x02);
        expect(bytes[1]).toBe(0x14);
    });

    it('encodes commId in response body', () => {
        const packet = createNPSChannelGrantedPacket(42, 9001);
        const bytes = packet.serialize();
        expect(bytes.readInt32BE(4)).toBe(42);
    });

    it('encodes port in response body', () => {
        const packet = createNPSChannelGrantedPacket(5, 9005);
        const bytes = packet.serialize();
        expect(bytes.readInt32BE(8)).toBe(9005);
    });

    it('returns a BytableMessage', () => {
        expect(createNPSChannelGrantedPacket(1, 7003)).toBeInstanceOf(BytableMessage);
    });
});

describe('parseOpenCommChannelMessage', () => {
    it('parses commId from wire buffer', () => {
        const buf = buildOpenCommChannelBuffer(99, 'TestRiff', 21);
        const parsed = parseOpenCommChannelMessage(buf);
        const commIdBuf = parsed.getFieldValueByName('commId') as Buffer;
        expect(commIdBuf.readInt32BE()).toBe(99);
    });

    it('parses userId from wire buffer', () => {
        const buf = buildOpenCommChannelBuffer(1, 'TestRiff', 42);
        const parsed = parseOpenCommChannelMessage(buf);
        const userIdBuf = parsed.getFieldValueByName('userId') as Buffer;
        expect(userIdBuf.readInt32BE()).toBe(42);
    });

    it('parses riffName from wire buffer', () => {
        const buf = buildOpenCommChannelBuffer(1, 'Pit1', 21);
        const parsed = parseOpenCommChannelMessage(buf);
        const riffName = parsed.getFieldValueByName('riffName');
        expect(String(riffName)).toBe('Pit1');
    });
});
