import { describe, it, expect } from 'vitest';
import { BinaryMember } from './BinaryMember';

describe('BinaryMember', () => {
    it('should initialize with the correct size and padding', () => {
        const binaryMember = new BinaryMember(8);
        expect(binaryMember.size()).toBe(8);
        expect(binaryMember.get()).toEqual(new Uint8Array(8));
    });

    it('should set and get values correctly', () => {
        const binaryMember = new BinaryMember(8);
        const value = new Uint8Array([1, 2, 3, 4]);
        binaryMember.set(value);
        expect(binaryMember.get()).toEqual(value);
    });

    it('should throw an error if value exceeds max size', () => {
        const binaryMember = new BinaryMember(4);
        const value = new Uint8Array([1, 2, 3, 4, 5]);
        expect(() => binaryMember.set(value)).toThrowError(
            'Value exceeds maximum size of 4',
        );
    });

    it('should add alignment padding if enabled', () => {
        const binaryMember = new BinaryMember(8, true);
        const value = new Uint8Array([1, 2, 3]);
        binaryMember.set(value);
        const expected = new Uint8Array([1, 2, 3, 0]);
        expect(binaryMember.get()).toEqual(expected);
    });

    it('should not add alignment padding if disabled', () => {
        const binaryMember = new BinaryMember(8, false);
        const value = new Uint8Array([1, 2, 3]);
        binaryMember.set(value);
        expect(binaryMember.get()).toEqual(value);
    });

    it('should serialize to a Buffer correctly', () => {
        const binaryMember = new BinaryMember(4);
        const value = new Uint8Array([1, 2, 3, 4]);
        binaryMember.set(value);
        expect(binaryMember.serialize()).toEqual(Buffer.from(value));
    });

    it('should deserialize from a Buffer correctly', () => {
        const binaryMember = new BinaryMember(4);
        const buffer = Buffer.from([1, 2, 3, 4]);
        binaryMember.deserialize(buffer);
        expect(binaryMember.get()).toEqual(new Uint8Array(buffer));
    });

    it('should return the correct byte size', () => {
        const binaryMember = new BinaryMember(4);
        expect(binaryMember.getByteSize()).toBe(4);
    });

    it('should convert to a hex string correctly', () => {
        const binaryMember = new BinaryMember(4);
        const value = new Uint8Array([0x1, 0x2, 0x3, 0x4]);
        binaryMember.set(value);
        expect(binaryMember.toHexString()).toBe('01020304');
    });

    it('should return the correct string representation', () => {
        const binaryMember = new BinaryMember(4);
        const value = new Uint8Array([1, 2, 3, 4]);
        binaryMember.set(value);
        expect(binaryMember.toString()).toBe('1,2,3,4');
    });
});
