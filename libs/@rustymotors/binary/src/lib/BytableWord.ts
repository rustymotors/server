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

export class BytableWord extends Bytable {
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

    override deserialize(buffer: Buffer) {
        BytableWord.validateBufferLength(buffer, 2);
        super.deserialize(buffer.subarray(0, 2));
    }

    override get json() {
        return {
            name: this.name,
            value: this.buffer.getUint16(0, true),
            valueString: Buffer.from(this.buffer.buffer).toString('utf-8'),
            serializeSize: this.serializeSize,
        };
    }

    override toString() {
        return this.buffer.toString();
    }

    override get serializeSize(): number {
        return 2;
    }
}
