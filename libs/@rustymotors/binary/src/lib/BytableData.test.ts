import { describe, it, expect, beforeEach } from 'vitest';
import { BytableData } from './BytableData.js';
import { BytableFieldTypes } from './BytableMessage.js';
import { BytableObject } from './types.js';

// Extend BytableFieldTypes to include MockField
interface ExtendedBytableFieldTypes {
    MockField: typeof MockField;
    MockCStringField: typeof MockCStringField;
}

declare module './BytableMessage.js' {
    interface BytableFieldTypes extends ExtendedBytableFieldTypes {}
}

class MockField implements BytableObject {
    name = '';
    value: string | number | Buffer = '';
    serializeSize = 4;

    setName(name: string) {
        this.name = name;
    }

    deserialize(buffer: Buffer) {
        this.value = buffer.subarray(0, 4).toString();
    }

    serialize() {
        let str = String(this.value);
        if (str.length > 4) str = str.slice(0, 4);
        while (str.length < 4) str += '\0';
        return Buffer.from(str);
    }

    setValue(value: string | number | Buffer) {
        this.value = value;
    }

    get json() {
        return { name: this.name, value: this.value };
    }
}

class MockCStringField implements BytableObject {
    name = '';
    value: string | number | Buffer = '';

    setName(name: string) {
        this.name = name;
    }

    deserialize(buffer: Buffer) {
        const nullIdx = buffer.indexOf(0);
        if (nullIdx === -1) {
            this.value = buffer.toString();
        } else {
            this.value = buffer.subarray(0, nullIdx).toString();
        }
    }

    serialize() {
        let str = String(this.value);
        const buf = Buffer.alloc(str.length + 1);
        buf.write(str, 0, 'utf8');
        buf[str.length] = 0;
        return buf;
    }

    setValue(value: string | number | Buffer) {
        this.value = value;
    }

    get json() {
        return { name: this.name, value: this.value };
    }

    get serializeSize() {
        return String(this.value).length + 1;
    }
}

// Explicitly cast MockField to bypass type-checking errors
(BytableFieldTypes as any)['MockField'] = MockField;

// Register MockCStringField for tests
(BytableFieldTypes as any)['MockCStringField'] = MockCStringField;

describe('BytableData', () => {
    let bytableData: BytableData;

    beforeEach(() => {
        bytableData = new BytableData();
    });

    it('should serialize and deserialize correctly', () => {
        bytableData.setSerializeOrder([
            { name: 'field1', field: 'MockField' as any },
            { name: 'field2', field: 'MockField' as any },
        ]);

        bytableData.setFieldValueByName('field1', 'test1');
        bytableData.setFieldValueByName('field2', 'test2');

        const serialized = bytableData.serialize();
        const deserializedData = new BytableData();
        deserializedData.setSerializeOrder([
            { name: 'field1', field: 'MockField' as any },
            { name: 'field2', field: 'MockField' as any },
        ]);
        deserializedData.deserialize(serialized);

        expect(deserializedData.getFieldValueByName('field1')).toBe('test');
        expect(deserializedData.getFieldValueByName('field2')).toBe('test');
    });

    it('should serialize and deserialize correctly with MockCStringField', () => {
        bytableData.setSerializeOrder([
            { name: 'cstring1', field: 'MockCStringField' as any },
            { name: 'cstring2', field: 'MockCStringField' as any },
        ]);

        bytableData.setFieldValueByName('cstring1', 'hello');
        bytableData.setFieldValueByName('cstring2', 'world');

        const serialized = bytableData.serialize();
        const deserializedData = new BytableData();
        deserializedData.setSerializeOrder([
            { name: 'cstring1', field: 'MockCStringField' as any },
            { name: 'cstring2', field: 'MockCStringField' as any },
        ]);
        deserializedData.deserialize(serialized);

        expect(deserializedData.getFieldValueByName('cstring1')).toBe('hello');
        expect(deserializedData.getFieldValueByName('cstring2')).toBe('world');
    });

    it('should serialize and deserialize correctly with MockCStringField (null-terminated)', () => {
        bytableData.setSerializeOrder([
            { name: 'cstring1', field: 'MockCStringField' as any },
            { name: 'cstring2', field: 'MockCStringField' as any },
        ]);

        bytableData.setFieldValueByName('cstring1', 'hello');
        bytableData.setFieldValueByName('cstring2', 'world');

        const serialized = bytableData.serialize();
        const deserializedData = new BytableData();
        deserializedData.setSerializeOrder([
            { name: 'cstring1', field: 'MockCStringField' as any },
            { name: 'cstring2', field: 'MockCStringField' as any },
        ]);
        deserializedData.deserialize(serialized);

        expect(deserializedData.getFieldValueByName('cstring1')).toBe('hello');
        expect(deserializedData.getFieldValueByName('cstring2')).toBe('world');
    });

    it('should calculate serializeSize correctly', () => {
        bytableData.setSerializeOrder([
            { name: 'field1', field: 'MockField' as any },
            { name: 'field2', field: 'MockField' as any },
        ]);

        bytableData.setFieldValueByName('field1', 'test1');
        bytableData.setFieldValueByName('field2', 'test2');

        expect(bytableData.serializeSize).toBe(8); // 4 bytes per field
    });

    it('should throw an error for unknown field types during deserialization', () => {
        expect(() =>
            bytableData.setSerializeOrder([
                {
                    name: 'field1',
                    field: 'UnknownField' as keyof typeof BytableFieldTypes,
                },
            ]),
        ).toThrowError('Unknown field type: UnknownField');
    });

    it('should return the correct JSON representation', () => {
        bytableData.setSerializeOrder([
            { name: 'field1', field: 'MockField' as any },
        ]);

        bytableData.setFieldValueByName('field1', 'test1');

        expect(bytableData.json).toEqual({
            name: 'BytableData',
            serializeSize: 4,
            fields: [{ name: 'field1', value: 'test1' }],
        });
    });

    it('should throw an error when accessing a non-existent field by name', () => {
        expect(() =>
            bytableData.getFieldValueByName('nonExistent'),
        ).toThrowError('Field nonExistent not found');
    });

    it('should throw an error when setting a value for a non-existent field', () => {
        expect(() =>
            bytableData.setFieldValueByName('nonExistent', 'value'),
        ).toThrowError('Field nonExistent not found');
    });

    it('should allow setting and getting the name', () => {
        bytableData.setName('TestName');
        expect(bytableData.name).toBe('TestName');
    });

    it('should throw an error for unimplemented value getter and setter', () => {
        expect(() => bytableData.value).toThrowError('Not implemented');
        expect(() => bytableData.setValue('value')).toThrowError(
            'Not implemented',
        );
    });
});
