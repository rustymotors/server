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

import { SerializableInterface } from 'rusty-motors-shared-packets';

export const BINARY_ALIGNMENT = 4;

// --- Utility functions ---
export const Endian = {
    htons(n: number): number {
        return ((n & 0xff) << 8) | ((n >> 8) & 0xff);
    },
    htonl(n: number): number {
        return (
            ((n & 0xff) << 24) |
            ((n & 0xff00) << 8) |
            ((n & 0xff0000) >> 8) |
            ((n >> 24) & 0xff)
        );
    },
    ntohs(n: number): number {
        return this.htons(n);
    },
    ntohl(n: number): number {
        return this.htonl(n);
    },
};

export function align(n: number, alignment: number): number {
    if (alignment <= 0) throw new Error('Alignment must be > 0');
    return Math.ceil(n / alignment) * alignment;
}
export function addAlignmentPadding(
    buffer: Uint8Array,
    alignment: number,
): Uint8Array {
    const padding = new Uint8Array(
        align(buffer.length, alignment) - buffer.length,
    );
    return new Uint8Array([...buffer, ...padding]);
}
export function verifyAlignment(buffer: Uint8Array, alignment: number) {
    if (buffer.length % alignment !== 0) {
        throw new Error(
            `Buffer size is not aligned to ${alignment}, got ${buffer.length}`,
        );
    }
}

// --- BinaryMember base class ---
export class BinaryMember implements SerializableInterface {
    protected value: Uint8Array;
    protected maxSize: number;
    protected shouldPad: boolean;

    constructor(size = 0, shouldPad = false) {
        this.value = new Uint8Array(size);
        this.maxSize = size;
        this.shouldPad = shouldPad;
    }
    set(v: Uint8Array) {
        const raw = this.shouldPad
            ? addAlignmentPadding(v, BINARY_ALIGNMENT)
            : v;
        if (raw.length > this.maxSize) {
            throw new Error(`Value exceeds maximum size of ${this.maxSize}`);
        }
        this.value = raw;
    }
    get() {
        return this.value;
    }
    size() {
        return this.value.length;
    }
    getByteSize(): number {
        return this.size();
    }
    toString() {
        return this.toHexString();
    }
    serialize(): Buffer {
        return Buffer.from(this.get());
    }
    deserialize(data: Buffer) {
        this.set(new Uint8Array(data));
    }
    toHexString(): string {
        return this.get().reduce(
            (acc, v) => acc + v.toString(16).padStart(2, '0'),
            '',
        );
    }
}

export class Uint8_t extends BinaryMember {
    constructor(shouldPad = false) {
        super(1, shouldPad);
    }
}

export class Uint16_t extends BinaryMember {
    constructor() {
        super(2);
    }
    getShort(endian: 'LE' | 'BE' = 'LE'): number {
        return endian === 'BE' ? this.getBE() : this.getLE();
    }
    getLE(): number {
        const byte0 = this.value[0] || 0;
        const byte1 = (this.value[1] || 0) << 8;
        return byte0 | byte1;
    }
    getBE(): number {
        const byte0 = (this.value[0] || 0) << 8;
        const byte1 = this.value[1] || 0;
        return byte0 | byte1;
    }
    setShort(value: number, endian: 'LE' | 'BE' = 'LE') {
        if (value < 0 || value > 0xffff) {
            throw new Error(`Value ${value} is not a 16-bit integer`);
        }
        endian === 'BE' ? this.setBE(value) : this.setLE(value);
    }
    setLE(value: number) {
        this.value = new Uint8Array([value & 0xff, (value >> 8) & 0xff]);
    }
    setBE(value: number) {
        this.value = new Uint8Array([(value >> 8) & 0xff, value & 0xff]);
    }
}

export class Uint32_t extends BinaryMember {
    constructor() {
        super(4);
    }
    getInt(endian: 'LE' | 'BE' = 'LE'): number {
        return endian === 'BE' ? this.getBE() : this.getLE();
    }
    getLE(): number {
        const byte0 = this.value[0] || 0;
        const byte1 = (this.value[1] || 0) << 8;
        const byte2 = (this.value[2] || 0) << 16;
        const byte3 = (this.value[3] || 0) << 24;
        return byte0 | byte1 | byte2 | byte3;
    }
    getBE(): number {
        const byte0 = (this.value[0] || 0) << 24;
        const byte1 = (this.value[1] || 0) << 16;
        const byte2 = (this.value[2] || 0) << 8;
        const byte3 = this.value[3] || 0;
        return byte0 | byte1 | byte2 | byte3;
    }
    setInt(value: number, endian: 'LE' | 'BE' = 'LE') {
        if (value < 0 || value > 0xffffffff) {
            throw new Error(`Value ${value} is not a 32-bit integer`);
        }
        endian === 'BE' ? this.setBE(value) : this.setLE(value);
    }
    setLE(value: number) {
        this.value = new Uint8Array([
            value & 0xff,
            (value >> 8) & 0xff,
            (value >> 16) & 0xff,
            (value >> 24) & 0xff,
        ]);
    }
    setBE(value: number) {
        this.value = new Uint8Array([
            (value >> 24) & 0xff,
            (value >> 16) & 0xff,
            (value >> 8) & 0xff,
            value & 0xff,
        ]);
    }
}

export class Uint8_tArray extends BinaryMember {
    constructor(size: number) {
        super(size);
    }
}
