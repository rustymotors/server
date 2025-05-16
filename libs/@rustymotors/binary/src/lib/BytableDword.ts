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

import { Bytable } from './Bytable.js';
import { BytableObject } from './types.js';

export class BytableDword extends Bytable implements BytableObject {
    private static validateBufferLength(
        buffer: Buffer,
        minLength: number,
        offset = 0,
    ) {
        if (buffer.length < offset + minLength) {
            throw new Error(
                'Cannot deserialize buffer with insufficient length',
            );
        }
    }

    static fromBuffer(buffer: Buffer, offset: number) {
        BytableDword.validateBufferLength(buffer, 4, offset);
        const dword = new BytableDword();
        dword.deserialize(buffer.subarray(offset, offset + 4));

        return dword;
    }

    override deserialize(buffer: Buffer) {
        BytableDword.validateBufferLength(buffer, 4);
        super.deserialize(buffer.subarray(0, 4));
    }

    override get json() {
        return {
            name: this.name,
            value: this.buffer.getUint32(0, true),
            valueString: Buffer.from(this.buffer.buffer).toString('utf-8'),
            serializeSize: this.serializeSize,
        };
    }

    override toString() {
        return this.buffer.toString();
    }
}
