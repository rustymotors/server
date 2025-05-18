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

import { BytableBase } from './BytableBase.js';
import { BytableObject } from './types.js';

export class Bytable extends BytableBase implements BytableObject {
    protected name_ = '';
    protected value_: string | number | Buffer = '';

    protected deserializeFields(buffer: Buffer) {
        this.buffer = new DataView(Uint8Array.from(buffer).buffer);
    }

    override deserialize(buffer: Buffer) {
        validateBuffer(buffer, 'deserialize');
        return this.deserializeFields(buffer);
    }

    protected serializeFields(): Buffer {
        return Buffer.from(this.buffer.buffer);
    }

    override serialize(): Buffer {
        validateBuffer(this.buffer, 'serialize');
        return this.serializeFields();
    }

    get json() {
        return {
            name: this.name_,
            serializeSize: this.serializeSize,
        };
    }

    override get serializeSize(): number {
        return this.buffer.byteLength;
    }

    setName(name: string) {
        this.name_ = name;
    }

    get name() {
        return this.name_;
    }

    get value() {
        return this.value_;
    }

    setValue(value: string | number | Buffer) {
        this.validateValue(value);
        this.value_ = value;
    }

    override toString() {
        return `BytableBase { name: ${this.name_}, value: ${this.value_} }`;
    }
}

/**
 * Validates that the provided buffer is defined and non-empty.
 *
 * @param buf - The buffer to validate.
 * @param direction - A string describing the operation being performed (e.g., "serialize" or "deserialize").
 *
 * @throws {Error} If {@link buf} is undefined or has zero byte length.
 */
export function validateBuffer(
    buf: DataView<ArrayBufferLike> | ArrayBufferLike,
    direction: string,
) {
    if (typeof buf === 'undefined') {
        throw new Error(`Cannot ${direction} undefined buffer`);
    }

    if (buf.byteLength === 0) {
        throw new Error(`Cannot ${direction} empty buffer`);
    }
}
