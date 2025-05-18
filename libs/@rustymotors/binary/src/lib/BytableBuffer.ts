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

import { BytableObject } from './types.js';

export class BytableBuffer implements BytableObject {
    protected name_ = '';
    protected value_: Buffer = Buffer.alloc(0);

    deserialize(buffer: Buffer) {
        this.value_ = buffer;
    }

    get serializeSize() {
        return this.value_.length;
    }

    serialize() {
        return this.value_;
    }

    get json() {
        return {
            name: this.name_,
            serializeSize: this.serializeSize,
            value: this.value_.toString('hex'),
        };
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

    setValue(value: Buffer) {
        this.value_ = value;
    }

    getUint16(offset: number, _littleEndian: boolean): number {
        return this.value_.readUInt16BE(offset);
    }

    getUint32(offset: number, _littleEndian: boolean): number {
        return this.value_.readUInt32BE(offset);
    }
}
