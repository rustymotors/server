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
import {
    align,
    addAlignementPadding,
    verifyAlignment,
    htons,
    htonl,
    ntohs,
    ntohl,
    Uint32_t,
    Uint8_t,
    Uint8_tArray,
    BINARY_ALIGNMENT,
} from './BinaryMember.js';
import { BinaryMember } from './BinaryMember.js';

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

    it('should set value without padding when shouldPad is false', () => {
        const binaryMember = new BinaryMember(4, false);
        const value = new Uint8Array([10, 20, 30, 40]);
        binaryMember.set(value);
        expect(binaryMember.get()).toEqual(value);
    });

    it('should set value with padding when shouldPad is true and value length is not aligned', () => {
        const binaryMember = new BinaryMember(4, true);
        const value = new Uint8Array([1, 2]);
        binaryMember.set(value);
        // BINARY_ALIGNMENT is 4, so expect 2 bytes of padding
        expect(binaryMember.get()).toEqual(new Uint8Array([1, 2, 0, 0]));
    });

    it('should set value with no padding when shouldPad is true and value length is already aligned', () => {
        const binaryMember = new BinaryMember(4, true);
        const value = new Uint8Array([1, 2, 3, 4]);
        binaryMember.set(value);
        expect(binaryMember.get()).toEqual(value);
    });

    it('should throw if value length exceeds maxSize', () => {
        const binaryMember = new BinaryMember(3, true);
        const value = new Uint8Array([1, 2, 3, 4]);
        expect(() => binaryMember.set(value)).toThrowError(
            'Value exceeds maximum size of 3',
        );
    });

    it('should allow setting an empty Uint8Array', () => {
        const binaryMember = new BinaryMember(4, true);
        const value = new Uint8Array([]);
        binaryMember.set(value);
        expect(binaryMember.get()).toEqual(new Uint8Array([]));
        expect(binaryMember.getByteSize()).toBe(0);
    });
});

describe('align', () => {
    it('should align up to the nearest multiple', () => {
        expect(align(5, 4)).toBe(8);
        expect(align(8, 4)).toBe(8);
        expect(align(0, 4)).toBe(0);
    });
    it('should throw if alignment is <= 0', () => {
        expect(() => align(5, 0)).toThrow('Alignment must be > 0');
        expect(() => align(5, -1)).toThrow('Alignment must be > 0');
    });
});

describe('addAlignementPadding', () => {
    it('should pad buffer to alignment', () => {
        const buf = new Uint8Array([1, 2, 3]);
        expect(addAlignementPadding(buf, 4)).toEqual(new Uint8Array([1, 2, 3, 0]));
    });
    it('should not pad if already aligned', () => {
        const buf = new Uint8Array([1, 2, 3, 4]);
        expect(addAlignementPadding(buf, 4)).toEqual(buf);
    });
});

describe('verifyAlignment', () => {
    it('should not throw if buffer is aligned', () => {
        expect(() => verifyAlignment(new Uint8Array(8), 4)).not.toThrow();
    });
    it('should throw if buffer is not aligned', () => {
        expect(() => verifyAlignment(new Uint8Array(5), 4)).toThrow('Buffer size is not aligned to 4, got 5');
    });
});

describe('htons/ntohs', () => {
    it('should swap bytes for 16-bit values', () => {
        expect(htons(0x1234)).toBe(0x3412);
        expect(ntohs(0x1234)).toBe(0x3412);
    });
});

describe('htonl/ntohl', () => {
    it('should swap bytes for 32-bit values', () => {
        expect(htonl(0x12345678)).toBe(0x78563412);
        expect(ntohl(0x12345678)).toBe(0x78563412);
    });
});

describe('Uint32_t', () => {
    it('should initialize with correct size', () => {
        const u = new Uint32_t();
        expect(u.size()).toBe(4);
        expect(u.get()).toEqual(new Uint8Array(4));
    });
    it('should set and get little-endian', () => {
        const u = new Uint32_t();
        u.setInt(0x12345678, 'LE');
        expect(u.getLE()).toBe(0x12345678);
    });
    it('should set and get big-endian', () => {
        const u = new Uint32_t();
        u.setInt(0x12345678, 'BE');
        expect(u.getBE()).toBe(0x12345678);
    });
    it('should throw if value is out of range', () => {
        const u = new Uint32_t();
        expect(() => u.setInt(-1)).toThrow();
        expect(() => u.setInt(0x1_0000_0000)).toThrow();
    });
});

describe('Uint8_t', () => {
    it('should initialize with correct size and padding', () => {
        const u = new Uint8_t();
        expect(u.size()).toBe(1);
        expect(u.get()).toEqual(new Uint8Array(1));
    });
    it('should set and get values', () => {
        const u = new Uint8_t(false);
        u.set(new Uint8Array([42]));
        expect(u.get()).toEqual(new Uint8Array([42]));
    });
});

describe('Uint8_tArray', () => {
    it('should initialize with correct size', () => {
        const arr = new Uint8_tArray(5);
        expect(arr.size()).toBe(5);
        expect(arr.get()).toEqual(new Uint8Array(5));
    });
    it('should set and get values', () => {
        const arr = new Uint8_tArray(3);
        arr.set(new Uint8Array([1, 2, 3]));
        expect(arr.get()).toEqual(new Uint8Array([1, 2, 3]));
    });
    it('should throw if value exceeds max size', () => {
        const arr = new Uint8_tArray(2);
        expect(() => arr.set(new Uint8Array([1, 2, 3]))).toThrow();
    });
});
