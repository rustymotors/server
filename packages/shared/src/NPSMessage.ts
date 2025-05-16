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

import { BytableHeader, BytableMessage } from '@rustymotors/binary'; // Ensure this path is correct

/**
 * A NPS message is a message that matches version 1.1 of the nps protocol. It has a 12 byte header. @see {@link NPSHeader}
 *
 * @mixin {SerializableMixin}
 */

export class NPSMessage extends BytableMessage {
    _header: BytableHeader;
    constructor() {
        super();
        this._header = new BytableHeader();
    }

    override deserialize(buffer: Buffer) {
        this._header.deserialize(buffer);
        this.setBody(buffer.subarray(this._header.serializeSize));
        return this;
    }

    override serialize() {
        const buffer = Buffer.alloc(this._header.messageLength);
        this._header.serialize().copy(buffer);
        this.data.copy(buffer, this._header.serializeSize);
        return buffer;
    }

    size() {
        return this._header.serializeSize + this.data.length;
    }

    override toString() {
        return `NPSMessage: ${JSON.stringify({
            header: this._header.toString(),
            data: this.data.toString('hex'),
        })}`;
    }
}
