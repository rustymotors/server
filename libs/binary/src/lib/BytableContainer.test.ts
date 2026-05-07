import { describe, it, expect } from 'vitest';
import { BytableShortContainer } from './BytableContainer.js';
import { BytableContainer } from './BytableContainer.js';

describe('BytableShortContainer', () => {
    it('should serialize and deserialize a non-null-terminated string', () => {
        const container = new BytableShortContainer();
        container.setNullTerminated(false);
        container.setValue('hello');
        // Length prefix (2 bytes) + "hello"
        const buf = container.serialize();
        expect(buf.slice(0, 2).readUInt16BE(0)).toBe(5);
        expect(buf.slice(2).toString('utf-8')).toBe('hello');

        const newContainer = new BytableShortContainer();
        newContainer.setNullTerminated(false);
        newContainer.deserialize(buf);
        expect(newContainer.getValue()).toBe('hello');
        expect(newContainer.getLength()).toBe(5);
    });

    it('should serialize and deserialize a null-terminated string', () => {
        const container = new BytableShortContainer();
        container.setNullTerminated(true);
        container.setValue('world');
        const buf = container.serialize();
        expect(buf.slice(-1)[0]).toBe(0); // last byte is null
        expect(buf.slice(0, -1).toString('utf-8')).toBe('world');

        const newContainer = new BytableShortContainer();
        newContainer.setNullTerminated(true);
        newContainer.deserialize(buf);
        expect(newContainer.getValue()).toBe('world');
        expect(newContainer.getLength()).toBe(Buffer.from('world').length);
    });

    it('should handle empty string with null termination', () => {
        const container = new BytableShortContainer();
        container.setNullTerminated(true);
        container.setValue('');
        const buf = container.serialize();
        expect(buf.length).toBe(1);
        expect(buf[0]).toBe(0);

        const newContainer = new BytableShortContainer();
        newContainer.setNullTerminated(true);
        newContainer.deserialize(buf);
        expect(newContainer.getValue()).toBe('');
        expect(newContainer.getLength()).toBe(0);
    });

    it('should throw if null terminator is missing during deserialization', () => {
        const container = new BytableShortContainer();
        container.setNullTerminated(true);
        const buf = Buffer.from('no-null');
        expect(() => container.deserialize(buf)).toThrow('Null terminator not found in buffer');
    });

    it('should return correct json representation', () => {
        const container = new BytableShortContainer();
        container.setNullTerminated(false);
        container.setName('testName');
        container.setValue('abc');
        const json = container.json;
        expect(json).toEqual({
            name: 'testName',
            value: 'abc',
            length: 3,
            nullTerminated: false,
            serializeSize: 5,
        });
    });

    it('serializeSize should be correct for null-terminated and non-null-terminated', () => {
        const container = new BytableShortContainer();
        container.setNullTerminated(false);
        container.setValue('abc');
        expect(container.serializeSize).toBe(5); // 2 + 3

        container.setNullTerminated(true);
        expect(container.serializeSize).toBe(4); // 3 + 1
    });
})

describe('BytableContainer', () => {
    it('should serialize and deserialize a non-null-terminated string', () => {
        const container = new BytableContainer();
        container.setNullTerminated(false);
        container.setValue('foobar');
        // Length prefix (4 bytes) + "foobar"
        const buf = container.serialize();
        expect(buf.slice(0, 4).readUInt32BE(0)).toBe(6);
        expect(buf.slice(4).toString('utf-8')).toBe('foobar');

        const newContainer = new BytableContainer();
        newContainer.setNullTerminated(false);
        newContainer.deserialize(buf);
        expect(newContainer.getValue()).toBe('foobar');
        expect(newContainer.getLength()).toBe(6);
    });

    it('should serialize and deserialize a null-terminated string', () => {
        const container = new BytableContainer();
        container.setNullTerminated(true);
        container.setValue('baz');
        const buf = container.serialize();
        expect(buf.slice(-1)[0]).toBe(0); // last byte is null
        expect(buf.slice(0, -1).toString('utf-8')).toBe('baz');

        const newContainer = new BytableContainer();
        newContainer.setNullTerminated(true);
        newContainer.deserialize(buf);
        expect(newContainer.getValue()).toBe('baz');
        expect(newContainer.getLength()).toBe(Buffer.from('baz').length);
    });

    it('should handle empty string with null termination', () => {
        const container = new BytableContainer();
        container.setNullTerminated(true);
        container.setValue('');
        const buf = container.serialize();
        expect(buf.length).toBe(1);
        expect(buf[0]).toBe(0);

        const newContainer = new BytableContainer();
        newContainer.setNullTerminated(true);
        newContainer.deserialize(buf);
        expect(newContainer.getValue()).toBe('');
        expect(newContainer.getLength()).toBe(0);
    });

    it('should throw if null terminator is missing during deserialization', () => {
        const container = new BytableContainer();
        container.setNullTerminated(true);
        const buf = Buffer.from('no-null');
        expect(() => container.deserialize(buf)).toThrow('Null terminator not found in buffer');
    });

    it('should return correct json representation', () => {
        const container = new BytableContainer();
        container.setNullTerminated(false);
        container.setValue('xyz');
        const json = container.json;
        expect(json).toEqual({
            value: 'xyz',
            length: 3,
            nullTerminated: false,
            serializeSize: 7,
        });
    });

    it('serializeSize should be correct for null-terminated and non-null-terminated', () => {
        const container = new BytableContainer();
        container.setNullTerminated(false);
        container.setValue('xyz');
        expect(container.serializeSize).toBe(7); // 4 + 3

        container.setNullTerminated(true);
        expect(container.serializeSize).toBe(4); // 3 + 1
    });
});

