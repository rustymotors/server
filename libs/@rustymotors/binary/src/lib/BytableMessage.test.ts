// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017>  <Drazi Crendraven>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { describe, it, expect, beforeEach } from 'vitest';
import { BytableStructure, BytableFieldTypes } from './BytableMessage.js';
import { BytableObject } from './types.js';

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

describe('BytableStructure', () => {
    let structure: BytableStructure;

    beforeEach(() => {
        structure = new BytableStructure();
        structure.setSerializeOrder([
            { name: 'field1', field: 'Buffer' },
            { name: 'field2', field: 'Buffer' },
        ]);
    });

    it('should deserialize fields in order', () => {
        const buffer = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06]);
        // Patch Buffer field type to DummyField for predictable behavior
        (BytableFieldTypes as any).Buffer = DummyField;
        structure.deserialize(buffer);
        expect(structure['fields_'].length).toBe(2);
        expect(structure.getField('field1')?.value).toEqual(
            Buffer.from([0x01, 0x02, 0x03]),
        );
        expect(structure.getField('field2')?.value).toEqual(
            Buffer.from([0x04, 0x05, 0x06]),
        );
    });

    it('should throw error for unknown field type', () => {
        structure.setSerializeOrder([
            { name: 'bad', field: 'NotAType' as any },
        ]);
        expect(() => structure.deserialize(Buffer.alloc(10))).toThrow(
            'Unknown field type: NotAType',
        );
    });

    it('should compute serializeSize as sum of field sizes', () => {
        structure['fields_'] = [
            { serializeSize: 2 } as BytableObject,
            { serializeSize: 3 } as BytableObject,
        ];
        expect(structure.serializeSize).toBe(5);
    });

    it('should serialize fields in order', () => {
        const field1 = new DummyField();
        field1.setName('field1');
        field1.setValue(Buffer.from([0x01, 0x02, 0x03]));
        const field2 = new DummyField();
        field2.setName('field2');
        field2.setValue(Buffer.from([0x04, 0x05, 0x06]));
        structure['fields_'] = [field1, field2];
        const serialized = structure.serialize();
        expect(serialized).toEqual(
            Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06]),
        );
    });

    it('should return correct json representation', () => {
        structure['name_'] = 'TestStruct';
        structure['fields_'] = [
            { json: { name: 'a', value: 1 }, serializeSize: 1 } as any,
            { json: { name: 'b', value: 2 }, serializeSize: 1 } as any,
        ];
        expect(structure.json).toEqual({
            name: 'TestStruct',
            serializeSize: 2,
            fields: [
                { name: 'a', value: 1 },
                { name: 'b', value: 2 },
            ],
        });
    });

    it('should set and get name', () => {
        structure.setName('MyStruct');
        expect(structure.name).toBe('MyStruct');
    });

    it('should get field by name', () => {
        const field = new DummyField();
        field.setName('foo');
        structure['fields_'] = [field];
        expect(structure.getField('foo')).toBe(field);
        expect(structure.getField('bar')).toBeUndefined();
    });

    it('should get field value by name', () => {
        const field = new DummyField();
        field.setName('foo');
        field.setValue(Buffer.from([0x09]));
        structure['fields_'] = [field];
        expect(structure.getFieldValueByName('foo')).toEqual(
            Buffer.from([0x09]),
        );
    });

    it('should throw if getFieldValueByName not found', () => {
        expect(() => structure.getFieldValueByName('nope')).toThrow(
            'Field nope not found',
        );
    });

    it('should return undefined for empty name in getFieldValueByName', () => {
        expect(structure.getFieldValueByName('')).toBeUndefined();
    });

    it('should set field value by name (existing field)', () => {
        const field = new DummyField();
        field.setName('foo');
        structure['fields_'] = [field];
        structure.setSerializeOrder([{ name: 'foo', field: 'Buffer' }]);
        structure.setFieldValueByName('foo', Buffer.from([0x10]));
        expect(field.value).toEqual(Buffer.from([0x10]));
    });

    it('should set field value by name (new field)', () => {
        structure.setSerializeOrder([{ name: 'foo', field: 'Buffer' }]);
        structure.setFieldValueByName('foo', Buffer.from([0x20]));
        expect(structure.getField('foo')?.value).toEqual(Buffer.from([0x20]));
    });

    it('should throw if setFieldValueByName with unknown field', () => {
        structure.setSerializeOrder([{ name: 'foo', field: 'Buffer' }]);
        expect(() =>
            structure.setFieldValueByName('bar', Buffer.from([0x01])),
        ).toThrow('Field bar not found in serialized format');
    });

    it('should do nothing if setFieldValueByName called with empty name', () => {
        expect(() =>
            structure.setFieldValueByName('', Buffer.from([0x01])),
        ).not.toThrow();
    });

    it('should throw on value getter', () => {
        expect(() => structure.value).toThrow('This object is a container');
    });

    it('should throw on setValue', () => {
        expect(() => structure.setValue()).toThrow(
            'This object is a container',
        );
    });

    it('should stringify to JSON', () => {
        structure['name_'] = 'Struct';
        structure['fields_'] = [];
        expect(() => JSON.parse(structure.toString())).not.toThrow();
        expect(structure.toString()).toContain('"name":"Struct"');
    });
});
