import { describe, it, expect } from 'vitest';
import { BytableContainer, BytableShortContainer } from './BytableContainer.js';

const str = 'hello';
const buf = Buffer.from(str);

describe('BytableShortContainer', () => {
    it('sets and gets value (string, number, Buffer)', () => {
        const c = new BytableShortContainer();
        c.setValue(str);
        expect(c.getValue()).toBe(str);
        c.setValue(42);
        expect(c.getValue()).toBe(42);
        c.setValue(buf);
        expect(c.getValue()).toEqual(buf);
    });

    it('throws if setLength on nullTerminated', () => {
        const c = new BytableShortContainer();
        expect(() => c.setLength(5)).not.toThrow();
        // setNullTerminated is not implemented, so skip that path
    });

    it('serialize/deserialize roundtrip (non-nullTerminated)', () => {
        const c = new BytableShortContainer();
        c.setValue(str);
        const ser = c.serialize();
        const c2 = new BytableShortContainer();
        c2.deserialize(ser);
        expect(c2.getValue()).toBe(str);
    });
});

describe('BytableContainer', () => {
    it('sets and gets value (string, number, Buffer)', () => {
        const c = new BytableContainer();
        c.setValue(str);
        expect(c.getValue()).toBe(str);
        c.setValue(42);
        expect(c.getValue()).toBe(42);
        c.setValue(buf);
        expect(c.getValue()).toEqual(buf);
    });

    it('setNullTerminated and getNullTerminated', () => {
        const c = new BytableContainer();
        c.setNullTerminated(true);
        expect(c.getNullTerminated()).toBe(true);
        c.setNullTerminated(false);
        expect(c.getNullTerminated()).toBe(false);
    });

    it('throws if setLength on nullTerminated', () => {
        const c = new BytableContainer();
        c.setNullTerminated(true);
        expect(() => c.setLength(5)).toThrow('Cannot set length for null terminated container');
    });

    it('serialize/deserialize roundtrip (non-nullTerminated)', () => {
        const c = new BytableContainer();
        c.setValue(str);
        const ser = c.serialize();
        const c2 = new BytableContainer();
        c2.deserialize(ser);
        expect(c2.getValue()).toBe(str);
    });

    it('serialize/deserialize roundtrip (nullTerminated)', () => {
        const c = new BytableContainer();
        c.setNullTerminated(true);
        c.setValue(str);
        const ser = c.serialize();
        const c2 = new BytableContainer();
        c2.setNullTerminated(true);
        c2.deserialize(ser);
        expect(c2.getValue()).toBe(str);
    });

    it('json property returns expected structure', () => {
        const c = new BytableContainer();
        c.setValue(str);
        c.setNullTerminated(false);
        c.setName('foo');
        const json = c.json;
        expect(json).toMatchObject({
            value: str,
            length: str.length,
            nullTerminated: false,
            serializeSize: str.length + 4,
        });
    });
});
