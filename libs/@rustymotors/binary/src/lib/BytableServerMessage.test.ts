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

// Patch dependencies with inline mocks (must be at the very top for Vitest hoisting)
vi.mock('./BytableServerHeader.js', () => ({
    BytableServerHeader: class {
        static deserializeCalled = false;
        static serializeCalled = false;
        serializeSize = 6;
        sequence = 0;
        flags = 0;
        name = '';
        setName(name: string) {
            this.name = name;
        }
        setMessageLength() {
            // Mock implementation
        }
        deserialize() {
            (this.constructor as any).deserializeCalled = true;
        }
        serialize() {
            (this.constructor as any).serializeCalled = true;
            return Buffer.alloc(6);
        }
        get json() {
            return {
                name: this.name,
                sequence: this.sequence,
                flags: this.flags,
            };
        }
    },
}));
vi.mock('./BytableMessage.js', () => ({
    BytableFieldTypes: {
        Buffer: class {
            name = '';
            value: any = null;
            serializeSize = 4;
            static deserializeCalled = false;
            static serializeCalled = false;
            setName(name: string) {
                this.name = name;
            }
            setValue(value: any) {
                this.value = value;
            }
            deserialize(buffer: Buffer) {
                (this.constructor as any).deserializeCalled = true;
                this.value = buffer.readUInt32BE(0);
            }
            serialize() {
                (this.constructor as any).serializeCalled = true;
                const buf = Buffer.alloc(4);
                buf.writeUInt32BE(
                    typeof this.value === 'number' ? this.value : 0,
                    0,
                );
                return buf;
            }
            get json() {
                return { name: this.name, value: this.value };
            }
        },
        UInt32: class {
            name = '';
            value: any = null;
            serializeSize = 4;
            static deserializeCalled = false;
            static serializeCalled = false;
            setName(name: string) {
                this.name = name;
            }
            setValue(value: any) {
                this.value = value;
            }
            deserialize(buffer: Buffer) {
                (this.constructor as any).deserializeCalled = true;
                this.value = buffer.readUInt32BE(0);
            }
            serialize() {
                (this.constructor as any).serializeCalled = true;
                const buf = Buffer.alloc(4);
                buf.writeUInt32BE(
                    typeof this.value === 'number' ? this.value : 0,
                    0,
                );
                return buf;
            }
            get json() {
                return { name: this.name, value: this.value };
            }
        },
    },
}));

// Define mock class for use in test body
class MockHeader {
    static deserializeCalled = false;
    static serializeCalled = false;
    serializeSize = 6;
    sequence = 0;
    flags = 0;
    name = '';
    setName(name: string) {
        this.name = name;
    }
    setMessageLength() {
        // Mock implementation
    }
    deserialize() {
        (this.constructor as any).deserializeCalled = true;
    }
    serialize() {
        (this.constructor as any).serializeCalled = true;
        return Buffer.alloc(6);
    }
    get json() {
        return { name: this.name, sequence: this.sequence, flags: this.flags };
    }
}

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BytableServerMessage } from './BytableServerMessage.js';

const setupMsg = (
    serializeOrder = [{ name: 'foo', field: 'Buffer' as any }],
    headerClass: any = MockHeader,
) => {
    const msg = new BytableServerMessage();
    // @ts-ignore
    msg.header_ = new headerClass();
    msg.setSerializeOrder(serializeOrder);
    return msg;
};

describe('BytableServerMessage', () => {
    let msg: BytableServerMessage;
    beforeEach(() => {
        msg = setupMsg();
        // @ts-ignore
        msg.fields_ = [];
        // @ts-ignore
        msg.serializeOrder_ = [];
    });

    it('should initialize with default header and fields', () => {
        // @ts-ignore
        expect(msg.header_).toBeInstanceOf(MockHeader);
        // @ts-ignore
        expect(msg.fields_).toEqual([]);
    });

    it('should set and get serializeOrder', () => {
        msg.setSerializeOrder([{ name: 'foo', field: 'Buffer' }]);
        // @ts-ignore
        expect(msg.serializeOrder_).toEqual([{ name: 'foo', field: 'Buffer' }]);
    });

    it('should set and get sequenceNumber', () => {
        msg.setSequenceNumber(42);
        expect(msg.sequenceNumber).toBe(42);
    });

    it('should set and get flags', () => {
        msg.setFlags(7);
        expect(msg.flags).toBe(7);
    });

    it('should set and get name via setName', () => {
        msg.setName('TestMsg');
        expect(msg.header.name).toBe('TestMsg');
    });

    it('should throw if getFieldValueByName not found', () => {
        expect(() => msg.getFieldValueByName('notfound')).toThrow(
            /Field notfound not found/,
        );
    });

    it('should return undefined for getFieldValueByName with empty name', () => {
        expect(msg.getFieldValueByName('')).toBeUndefined();
    });

    it('should set and get field value by name', () => {
        msg.setSerializeOrder([{ name: 'foo', field: 'Buffer' }]);
        msg.setFieldValueByName('foo', 1234);
        expect(msg.getFieldValueByName('foo')).toBeInstanceOf(Buffer);
    });

    it('should throw if setFieldValueByName with unknown field', () => {
        msg.setSerializeOrder([{ name: 'foo', field: 'Buffer' }]);
        expect(() => msg.setFieldValueByName('bar', 1)).toThrow(
            /Field bar not found in serialized format/,
        );
    });

    it('should serialize and deserialize fields', () => {
        msg.setSerializeOrder([{ name: 'foo', field: 'Buffer' }]);
        msg.setFieldValueByName('foo', 42);
        const buf = msg.serialize();
        expect(Buffer.isBuffer(buf)).toBe(true);
        const msg2 = setupMsg();
        msg2.deserialize(buf);
        expect(msg2.getFieldValueByName('foo')).toBeDefined();
    });

    it('should return correct serializeSize', () => {
        msg.setSerializeOrder([{ name: 'foo', field: 'Buffer' }]);
        msg.setFieldValueByName('foo', 1);
        expect(msg.serializeSize).toBe(6 + 4);
    });

    it('should return correct json', () => {
        msg.setSerializeOrder([{ name: 'foo', field: 'Buffer' }]);
        msg.setFieldValueByName('foo', 1);
        const json = msg.json;
        expect(json).toHaveProperty('name');
        expect(json).toHaveProperty('serializeSize');
        expect(json).toHaveProperty('header');
        expect(json).toHaveProperty('fields');
    });

    it('should stringify to JSON', () => {
        msg.setSerializeOrder([{ name: 'foo', field: 'Buffer' }]);
        msg.setFieldValueByName('foo', 1);
        expect(() => JSON.parse(msg.toString())).not.toThrow();
    });

    it('should get and set body', () => {
        msg.setSerializeOrder([{ name: 'foo', field: 'Buffer' }]);
        msg.setFieldValueByName('foo', 1);
        const body = msg.getBody();
        expect(Buffer.isBuffer(body)).toBe(true);
        const msg2 = setupMsg();
        msg2.setBody(body);
        expect(msg2.getFieldValueByName('foo')).toBeDefined();
    });

    it('should get and set data property', () => {
        msg.setSerializeOrder([{ name: 'foo', field: 'Buffer' }]);
        msg.setFieldValueByName('foo', 1);
        const data = msg.data;
        expect(Buffer.isBuffer(data)).toBe(true);
        const msg2 = setupMsg();
        msg2.data = data;
        expect(msg2.getFieldValueByName('foo')).toBeDefined();
    });

    it('should return hex string', () => {
        msg.setSerializeOrder([{ name: 'foo', field: 'Buffer' }]);
        msg.setFieldValueByName('foo', 1);
        const hex = msg.toHexString();
        expect(typeof hex).toBe('string');
        expect(hex).toMatch(/^[0-9a-f]*$/);
    });

    it('should throw on unknown field type in deserializeFields', () => {
        msg.setSerializeOrder([{ name: 'foo', field: 'UnknownType' as any }]);
        expect(() => {
            // @ts-ignore
            msg.deserializeFields(Buffer.alloc(10));
        }).toThrow(/Unknown field type/);
    });

    it('should throw on error in deserialize', () => {
        class BadHeader extends MockHeader {
            override deserialize() {
                throw new Error('bad header');
            }
        }
        const badMsg = setupMsg([{ name: 'foo', field: 'Buffer' }], BadHeader);
        expect(() => badMsg.deserialize(Buffer.alloc(10))).toThrow(
            /Error deserializing message/,
        );
    });
});
