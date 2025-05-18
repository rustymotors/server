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

import { describe, beforeEach, it, expect } from 'vitest';
import { BytableCString } from './BytableCString.js';

describe('BytableCString', () => {
    let cstring: BytableCString;

    beforeEach(() => {
        cstring = new BytableCString();
    });

    it('should set and get value correctly', () => {
        const value = 'test';
        cstring.setValue(value);
        expect(cstring.getValue()).toBe(value);
    });

    it('should throw error when setting null termination', () => {
        expect(() => cstring.setNullTerminated(false)).toThrowError(
            'Cannot set null termination for CString',
        );
    });

    it('should return true for null termination by default', () => {
        expect(cstring.getNullTerminated()).toBe(true);
    });

    it('should throw error when setting length for null-terminated container', () => {
        expect(() => cstring.setLength(10)).toThrowError(
            'Cannot set length for null terminated container',
        );
    });

    it('should calculate serialize size correctly', () => {
        cstring.setValue('test');
        expect(cstring.serializeSize).toBe(5); // 4 characters + 1 null terminator
    });

    it('should serialize correctly', () => {
        cstring.setValue('test');
        const serialized = cstring.serialize();
        expect(serialized).toEqual(Buffer.from('test\0'));
    });

    it('should serialize empty value correctly', () => {
        cstring.setValue('');
        const serialized = cstring.serialize();
        expect(serialized).toEqual(Buffer.from('\0'));
    });

    it('should throw error when serializing non-null-terminated container', () => {
        cstring.setValue('test');
        (cstring as any).nullTerminated = false; // Force nullTerminated to false for testing
        expect(() => cstring.serialize()).toThrowError(
            'Cannot serialize CString',
        );
    });

    it('should deserialize correctly', () => {
        const buffer = Buffer.from('test\0');
        cstring.deserialize(buffer);
        expect(cstring.getValue()).toBe('test');
        expect(cstring.getLength()).toBe(4); // Corrected to 4 characters (excluding null terminator)
    });

    it('should throw error when deserializing non-null-terminated container', () => {
        const buffer = Buffer.from('test');
        (cstring as any).nullTerminated = false; // Force nullTerminated to false for testing
        expect(() => cstring.deserialize(buffer)).toThrowError(
            'Cannot deserialize CString',
        );
    });

    it('should return correct JSON representation', () => {
        cstring.setValue('test');
        const json = cstring.json;
        expect(json).toEqual({
            value: 'test',
            length: 4,
            nullTerminated: true,
            serializeSize: 5,
        });
    });

    it('should set and get name correctly', () => {
        const name = 'testName';
        cstring.setName(name);
        expect(cstring.name).toBe(name);
    });

    it('should return value when accessing "value" getter', () => {
        const value = 'test';
        cstring.setValue(value);
        expect(cstring.value).toBe(value);
    });

    it('should return string representation correctly', () => {
        const value = 'test';
        cstring.setValue(value);
        expect(cstring.toString()).toBe(value);
    });
});
