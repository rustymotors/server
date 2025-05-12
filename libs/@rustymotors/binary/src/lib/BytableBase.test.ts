import { describe, it, expect } from 'vitest';
import { BytableBase } from './BytableBase';

class TestBytable extends BytableBase {
    override toString() {
        return 'TestBytable';
    }

    override deserialize(buffer: Buffer) {
        this.buffer = new DataView(
            buffer.buffer,
            buffer.byteOffset,
            buffer.byteLength,
        );
    }

    override serialize() {
        return Buffer.from(this.buffer.buffer);
    }

    override get serializeSize() {
        return this.buffer.byteLength;
    }
}

describe('BytableBase', () => {
    describe('validateValue', () => {
        it('should throw an error for NaN values', () => {
            const instance = new TestBytable();
            expect(() => instance['validateValue'](NaN)).toThrow(
                'Cannot set NaN value',
            );
        });

        it('should throw an error for empty buffers', () => {
            const instance = new TestBytable();
            expect(() => instance['validateValue'](Buffer.alloc(0))).toThrow(
                'Cannot set empty buffer',
            );
        });

        it('should not throw for valid values', () => {
            const instance = new TestBytable();
            expect(() => instance['validateValue'](42)).not.toThrow();
            expect(() => instance['validateValue']('valid')).not.toThrow();
            expect(() =>
                instance['validateValue'](Buffer.from('valid')),
            ).not.toThrow();
        });
    });

    describe('getByteLength', () => {
        it('should return correct byte length for buffers', () => {
            const instance = new TestBytable();
            const buffer = Buffer.from('test');
            expect(instance['getByteLength'](buffer)).toBe(buffer.byteLength);
        });

        it('should return correct byte length for strings', () => {
            const instance = new TestBytable();
            expect(instance['getByteLength']('test')).toBe(
                Buffer.from('test').byteLength,
            );
        });

        it('should return correct byte length for numbers', () => {
            const instance = new TestBytable();
            expect(instance['getByteLength'](123)).toBe(
                Buffer.from('123').byteLength,
            );
        });
    });

    describe('validateString', () => {
        it('should throw an error for empty strings', () => {
            const instance = new TestBytable();
            expect(() => instance['validateString']('')).toThrow(
                'Cannot set empty string',
            );
        });

        it('should not throw for non-empty strings', () => {
            const instance = new TestBytable();
            expect(() => instance['validateString']('valid')).not.toThrow();
        });
    });

    describe('toBuffer', () => {
        it('should return the same buffer if input is a buffer', () => {
            const instance = new TestBytable();
            const buffer = Buffer.from('test');
            expect(instance['toBuffer'](buffer)).toBe(buffer);
        });

        it('should convert strings to buffers', () => {
            const instance = new TestBytable();
            const str = 'test';
            expect(instance['toBuffer'](str)).toEqual(Buffer.from(str));
        });

        it('should convert numbers to buffers', () => {
            const instance = new TestBytable();
            const num = 123;
            expect(instance['toBuffer'](num)).toEqual(Buffer.from('123'));
        });
    });

    describe('align8', () => {
        it('should align values to the next multiple of 8', () => {
            const instance = new TestBytable();
            expect(instance['align8'](5)).toBe(8);
            expect(instance['align8'](8)).toBe(8);
            expect(instance['align8'](10)).toBe(16);
        });
    });

    describe('getUint16', () => {
        it('should read a 16-bit unsigned integer from the buffer', () => {
            const instance = new TestBytable();
            const buffer = Buffer.alloc(2);
            buffer.writeUInt16BE(42, 0);
            instance.deserialize(buffer);
            expect(instance['getUint16'](0, false)).toBe(42);
        });
    });

    describe('getUint32', () => {
        it('should read a 32-bit unsigned integer from the buffer', () => {
            const instance = new TestBytable();
            const buffer = Buffer.alloc(4);
            buffer.writeUInt32BE(42, 0);
            instance.deserialize(buffer);
            expect(instance['getUint32'](0, false)).toBe(42);
        });
    });

    describe('abstract methods', () => {
        it('should throw errors for unimplemented methods', () => {
            const instance = new BytableBase();
            expect(() => instance.toString()).toThrow(
                'Method should be implemented by subclass',
            );
            expect(() => instance.deserialize(Buffer.alloc(0))).toThrow(
                'Method should be implemented by subclass',
            );
            expect(() => instance.serialize()).toThrow(
                'Method should be implemented by subclass',
            );
            expect(() => instance.serializeSize).toThrow(
                'Method should be implemented by subclass',
            );
        });
    });
});
