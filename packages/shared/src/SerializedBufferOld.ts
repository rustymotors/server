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

import type { SerializableInterface } from 'rusty-motors-shared-packets';
import { SerializableMixin, AbstractSerializable } from './messageFactory.js';

/**
 * A raw message is a message that is not parsed into a specific type.
 * It has no header, and is just a serialized buffer.
 *
 * @mixin {SerializableMixin}
 */

export class SerializedBufferOld
    extends SerializableMixin(AbstractSerializable)
    implements SerializableInterface
{
    constructor() {
        super();
    }

    /**
     * @param {Buffer} buffer
     * @returns {SerializedBufferOld}
     */
    override _doDeserialize(buffer: Buffer): SerializedBufferOld {
        this.setBuffer(buffer);
        return this;
    }

    deserialize(data: Buffer): void {
        this.setBuffer(data);
    }

    serialize() {
        return this.data;
    }

    override toString() {
        return `SerializedBuffer: ${this.serialize().toString('hex')}`;
    }

    size() {
        return this.data.length;
    }

    getByteSize() {
        return this.size();
    }

    toHexString() {
        return this.data.toString('hex');
    }
}
