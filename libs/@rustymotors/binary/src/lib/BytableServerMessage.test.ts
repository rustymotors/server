import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BytableServerMessage } from './BytableServerMessage';
import { BytableServerHeader } from './BytableServerHeader';
import { BytableFieldTypes } from './BytableMessage';
import { BytableObject } from './types';

class DummyField extends BytableFieldTypes.Buffer {
    public override value_: Buffer = Buffer.from([0x01, 0x02, 0x03]);
    override get serializeSize() {
        return this.value_.length;
    }
    override serialize() {
        return this.value_;
    }
    override deserialize(buffer: Buffer) {
        this.value_ = buffer.subarray(0, 3);
    }
    override get value() {
        return this.value_;
    }
    override setValue(val: Buffer) {
        this.value_ = val;
    }
    override get json() {
        return {
            name: this.name,
            value: this.value_.toString('hex'),
            serializeSize: this.serializeSize,
        };
    }
}

describe('BytableServerMessage', () => {
    let msg: BytableServerMessage;
    let originalBuffer: any;

    beforeEach(() => {
        msg = new BytableServerMessage();
        // Patch Buffer field type to DummyField for predictable behavior
        originalBuffer = (BytableFieldTypes as any).Buffer;
        (BytableFieldTypes as any).Buffer = DummyField;
    });

    afterEach(() => {
        // Restore original Buffer field type after each test
        (BytableFieldTypes as any).Buffer = originalBuffer;
    });

    it('should set and get header', () => {
        expect(msg.header).toBeInstanceOf(BytableServerHeader);
    });

    it('should set and get sequence number', () => {
        msg.setSequenceNumber(42);
        expect(msg.sequenceNumber).toBe(42);
    });

    it('should set and get flags', () => {
        msg.setFlags(0x55);
        expect(msg.flags).toBe(0x55);
    });

    it('should set serialize order', () => {
        msg.setSerializeOrder([{ name: 'foo', field: 'Buffer' }]);
        expect((msg as any).serializeOrder_).toEqual([
            { name: 'foo', field: 'Buffer' },
        ]);
    });

    it('should throw error for unknown field type in deserializeFields', () => {
        msg.setSerializeOrder([{ name: 'bad', field: 'NotAType' as any }]);
        expect(() => (msg as any).deserializeFields(Buffer.alloc(10))).toThrow(
            'Unknown field type: NotAType',
        );
    });

    it('should get and set data', () => {
        msg.setSerializeOrder([{ name: 'foo', field: 'Buffer' }]);
        const buf = Buffer.from([0x01, 0x02, 0x03]);
        msg.setData(buf);
        expect(msg.data).toBeInstanceOf(Buffer);
        expect(msg.getFieldValueByName('foo')).toEqual(
            Buffer.from([0x01, 0x02, 0x03]),
        );
    });

    it('should compute serializeSize as header + fields', () => {
        const headerSize = msg.header.serializeSize;
        (msg as any).fields_ = [
            { serializeSize: 2 } as BytableObject,
            { serializeSize: 3 } as BytableObject,
        ];
        expect(msg.serializeSize).toBe(headerSize + 5);
    });

    it('should serialize fields in order', () => {
        const field1 = new DummyField();
        field1.setName('field1');
        field1.setValue(Buffer.from([0x01, 0x02, 0x03]));
        const field2 = new DummyField();
        field2.setName('field2');
        field2.setValue(Buffer.from([0x04, 0x05, 0x06]));
        (msg as any).fields_ = [field1, field2];
        const headerSize = msg.header.serializeSize;
        const serializedFields = (msg as any).serializeFields();
        expect(serializedFields).toEqual(
            Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06]),
        );
        expect(serializedFields.length).toBe(msg.serializeSize - headerSize);
    });

    it('should return correct json representation', () => {
        msg.setName('TestStruct');
        (msg as any).fields_ = [
            { json: { name: 'a', value: 1 }, serializeSize: 1 } as any,
            { json: { name: 'b', value: 2 }, serializeSize: 1 } as any,
        ];
        expect(msg.json).toMatchObject({
            name: 'TestStruct',
            fields: [
                { name: 'a', value: 1 },
                { name: 'b', value: 2 },
            ],
        });
    });

    it('should get field value by name', () => {
        const field = new DummyField();
        field.setName('foo');
        field.setValue(Buffer.from([0x09]));
        (msg as any).fields_ = [field];
        expect(msg.getFieldValueByName('foo')).toEqual(Buffer.from([0x09]));
    });

    it('should throw if getFieldValueByName not found', () => {
        expect(() => msg.getFieldValueByName('nope')).toThrow(
            'Field nope not found',
        );
    });

    it('should return undefined for empty name in getFieldValueByName', () => {
        expect(msg.getFieldValueByName('')).toBeUndefined();
    });

    it('should set field value by name (existing field)', () => {
        const field = new DummyField();
        field.setName('foo');
        (msg as any).fields_ = [field];
        msg.setSerializeOrder([{ name: 'foo', field: 'Buffer' }]);
        msg.setFieldValueByName('foo', Buffer.from([0x10]));
        expect(field.value).toEqual(Buffer.from([0x10]));
    });

    it('should set field value by name (new field)', () => {
        msg.setSerializeOrder([{ name: 'foo', field: 'Buffer' }]);
        msg.setFieldValueByName('foo', Buffer.from([0x20]));
        expect((msg as any).fields_[0].value).toEqual(Buffer.from([0x20]));
    });

    it('should throw if setFieldValueByName with unknown field', () => {
        msg.setSerializeOrder([{ name: 'foo', field: 'Buffer' }]);
        expect(() =>
            msg.setFieldValueByName('bar', Buffer.from([0x01])),
        ).toThrow('Field bar not found in serialized format');
    });

    it('should do nothing if setFieldValueByName called with empty name', () => {
        expect(() =>
            msg.setFieldValueByName('', Buffer.from([0x01])),
        ).not.toThrow();
    });

    it('should get and set body', () => {
        msg.setSerializeOrder([{ name: 'foo', field: 'Buffer' }]);
        const buf = Buffer.from([0x01, 0x02, 0x03]);
        msg.setBody(buf);
        expect(msg.getBody()).toBeInstanceOf(Buffer);
        expect(msg.getFieldValueByName('foo')).toEqual(
            Buffer.from([0x01, 0x02, 0x03]),
        );
    });

    it('should get and set data', () => {
        msg.setSerializeOrder([{ name: 'foo', field: 'Buffer' }]);
        const buf = Buffer.from([0x01, 0x02, 0x03]);
        msg.setData(buf);
        expect(msg.data).toBeInstanceOf(Buffer);
        expect(msg.getFieldValueByName('foo')).toEqual(
            Buffer.from([0x01, 0x02, 0x03]),
        );
    });

    it('should stringify to JSON', () => {
        msg.setName('Struct');
        (msg as any).fields_ = [];
        expect(() => JSON.parse(msg.toString())).not.toThrow();
        expect(msg.toString()).toContain('"name":"Struct"');
    });

    it('should return hex string', () => {
        msg.setSerializeOrder([{ name: 'foo', field: 'Buffer' }]);
        msg.setFieldValueByName('foo', Buffer.from([0x01, 0x02, 0x03]));
        expect(typeof msg.toHexString()).toBe('string');
        expect(msg.toHexString()).toMatch(/^[0-9a-f]+$/);
    });
});
