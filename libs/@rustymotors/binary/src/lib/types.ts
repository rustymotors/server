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

/**
 * A field that can be serialized and deserialized
 */
export interface Field {
    /**
     * The name of the field
     */
    name: string;
    /**
     * The size of the field when serialized
     */
    get serializeSize(): number;
    /**
     * Serialize the field into a buffer
     */
    serialize(): Buffer;
    /**
     * Deserialize the field from a buffer
     * @param buffer The buffer to deserialize from
     */
    deserialize(buffer: Buffer): void;
}

export interface BytableObject {
    serialize(): Buffer;
    deserialize(buffer: Buffer): void;
    json: Record<string, unknown>;
    toString(): string;
    get serializeSize(): number;
    get name(): string;
    get value(): string | number | Buffer;
    setName(name: string): void;
    setValue(value: string | number | Buffer): void;
}
