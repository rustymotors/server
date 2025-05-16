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

export class BytableByte extends BytableBase implements BytableObject {
    protected value_ = 0;
    protected name_ = '';

    override deserialize(buffer: Buffer) {
        if (buffer.length < 1) {
            throw new Error(
                'Cannot deserialize buffer with insufficient length',
            );
        }
        this.value_ = buffer.readUInt8(0);
        return this;
    }

    override get serializeSize() {
        return 1;
    }

    override serialize() {
        const buffer = Buffer.alloc(1);
        buffer.writeUInt8(this.value_, 0);
        return buffer;
    }

    get json() {
        return {
            name: this.name_,
            serializeSize: this.serializeSize,
            value: this.value_,
        };
    }

    setName(name: string) {
        this.name_ = name;
    }

    override toString() {
        return JSON.stringify(this.json);
    }

    get name() {
        return this.name_;
    }

    get value() {
        return this.value_;
    }

    setValue(value: string | number | Buffer) {
        if (typeof value === 'number') {
            this.value_ = value;
        } else {
            throw new Error('Invalid value type');
        }
    }
}
