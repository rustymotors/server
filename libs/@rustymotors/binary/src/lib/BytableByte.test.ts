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

import { describe, it, expect } from 'vitest';
import { BytableByte } from './BytableByte.js';

describe('BytableByte', () => {
    it('should serialize correctly', () => {
        const bytable = new BytableByte();
        bytable.setValue(255);
        const buffer = bytable.serialize();
        expect(buffer).toBeInstanceOf(Buffer);
        expect(buffer.length).toBe(1);
        expect(buffer.readUInt8(0)).toBe(255);
    });

    it('should deserialize correctly', () => {
        const bytable = new BytableByte();
        const buffer = Buffer.from([128]);
        bytable.deserialize(buffer);
        expect(bytable.value).toBe(128);
    });

    it('should throw an error when deserializing a buffer with insufficient length', () => {
        const bytable = new BytableByte();
        const buffer = Buffer.alloc(0);
        expect(() => bytable.deserialize(buffer)).toThrow(
            'Cannot deserialize buffer with insufficient length',
        );
    });

    it('should return correct serializeSize', () => {
        const bytable = new BytableByte();
        expect(bytable.serializeSize).toBe(1);
    });

    it('should return correct JSON representation', () => {
        const bytable = new BytableByte();
        bytable.setValue(42);
        bytable.setName('TestByte');
        expect(bytable.json).toEqual({
            name: 'TestByte',
            serializeSize: 1,
            value: 42,
        });
    });

    it('should convert to string correctly', () => {
        const bytable = new BytableByte();
        bytable.setValue(42);
        bytable.setName('TestByte');
        expect(bytable.toString()).toBe(
            JSON.stringify({
                name: 'TestByte',
                serializeSize: 1,
                value: 42,
            }),
        );
    });

    it('should set and get name correctly', () => {
        const bytable = new BytableByte();
        bytable.setName('MyByte');
        expect(bytable.name).toBe('MyByte');
    });

    it('should set and get value correctly', () => {
        const bytable = new BytableByte();
        bytable.setValue(100);
        expect(bytable.value).toBe(100);
    });

    it('should throw an error when setting an invalid value type', () => {
        const bytable = new BytableByte();
        expect(() => bytable.setValue('invalid')).toThrow('Invalid value type');
    });
});
