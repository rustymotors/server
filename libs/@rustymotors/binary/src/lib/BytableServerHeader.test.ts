import { describe, it, expect, beforeEach } from 'vitest';
import { BytableServerHeader } from './BytableServerHeader';

// Mock BytableBase since it's not provided
class MockBytableBase {
    deserialize(_buffer: Buffer) {}
}
Object.setPrototypeOf(BytableServerHeader.prototype, MockBytableBase.prototype);

describe('BytableServerHeader', () => {
    let header: BytableServerHeader;

    beforeEach(() => {
        header = new BytableServerHeader();
    });

    it('should have default values', () => {
        expect(header.name).toBe('ServerHeader');
        expect(header.messageLength).toBe(0);
        expect(header.sequence).toBe(0);
        expect(header.flags).toBe(0);
        expect(header['messageSignature_']).toBe('TOMC');
        expect(header.serializeSize).toBe(11);
    });

    it('should be able to set name', () => {
        header.setName('NewHeader');
        expect(header.name).toBe('NewHeader');
    });

    it('should throw on get value', () => {
        expect(() => header.value).toThrow('Method not implemented.');
    });

    it('should throw on setValue', () => {
        expect(() => header.setValue(123)).toThrow('Method not implemented.');
    });

    it('should return correct json', () => {
        header.setMessageLength(42);
        header.setSequence(1234);
        header.setFlags(7);
        const json = header.json;
        expect(json).toEqual({
            name: 'ServerHeader',
            len: 42,
            signature: 'TOMC',
            sequence: 1234,
            flags: 7,
            serializeSize: 11,
        });
    });

    it('should return correct toString', () => {
        header.setMessageLength(10);
        header.setSequence(99);
        header.setFlags(1);
        expect(header.toString()).toBe(
            'Message Length: 10, Message Signature: TOMC, Message Sequence: 99, Message Flags: 1',
        );
    });

    it('should set and get messageLength', () => {
        header.setMessageLength(256);
        expect(header.messageLength).toBe(256);
    });

    it('should set and get sequence', () => {
        header.setSequence(555);
        expect(header.sequence).toBe(555);
    });

    it('should set and get flags', () => {
        header.setFlags(3);
        expect(header.flags).toBe(3);
    });

    it('should serialize to buffer correctly', () => {
        header.setMessageLength(0x1234);
        header.setSequence(0x87654321);
        header.setFlags(0xab);
        const buf = header.serialize();
        expect(buf).toBeInstanceOf(Buffer);
        expect(buf.length).toBe(11);
        expect(buf.readUInt16LE(0)).toBe(0x1234);
        expect(buf.toString('utf8', 2, 6)).toBe('TOMC');
        expect(buf.readUInt32LE(6)).toBe(0x87654321);
        expect(buf.readUInt8(10)).toBe(0xab);
    });

    it('should deserialize from buffer correctly', () => {
        const buf = Buffer.alloc(11);
        buf.writeUInt16LE(0x4321, 0);
        buf.write('TOMC', 2);
        buf.writeUInt32LE(0x12345678, 6);
        buf.writeUInt8(0xcd, 10);

        header.deserialize(buf);

        expect(header.messageLength).toBe(0x4321);
        expect(header['messageSignature_']).toBe('TOMC');
        expect(header.sequence).toBe(0x12345678);
        expect(header.flags).toBe(0xcd);
    });
});
