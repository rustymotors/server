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

export interface Serializable {
    data: Buffer;
    serialize(): Buffer;
    deserialize<T extends Serializable>(buffer: Buffer): T;
    length: number;
    toString(): string;
    asHex(): string;
}

/**
 * Base class for all serialized objects
 * Just a wrapper around a buffer
 */
export class BaseSerialized implements Serializable {
    protected _data: Buffer;

    constructor(data?: Buffer) {
        this._data = data || Buffer.alloc(0);
    }

    get data(): Buffer {
        return this._data;
    }

    set data(data: Buffer) {
        this._data = Buffer.from(data);
    }

    serialize(): Buffer {
        throw Error('Not implemented');
    }

    deserialize<T extends Serializable>(_buffer: Buffer): T {
        throw Error('Not implemented');
    }

    get length(): number {
        return this._data.length;
    }

    toString(): string {
        return this.asHex();
    }

    asHex(): string {
        return this._data.toString('hex');
    }
}
