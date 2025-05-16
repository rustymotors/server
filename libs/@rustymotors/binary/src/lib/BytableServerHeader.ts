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

/**
 * Represents a server message header that can be serialized and deserialized to and from a binary format.
 *
 * The header contains the following fields (all in Little Endian):
 * - `messageLength_` (2 bytes): The length of the message.
 * - `messageSignature_` (4 bytes): A fixed signature string, defaulting to 'TOMC'.
 * - `messageSequence_` (4 bytes): The sequence number of the message.
 * - `messageFlags_` (1 byte): A bitfield representing message flags.
 *
 * Provides methods for serialization, deserialization, and JSON representation.
 *
 * @extends BytableBase
 * @implements BytableObject
 */
export class BytableServerHeader extends BytableBase implements BytableObject {
    // All fields are in Little Endian
    protected messageLength_ = 0; // 2 bytes
    protected messageSignature_ = 'TOMC'; // 4 bytes
    protected messageSequence_ = 0; // 4 bytes
    protected messageFlags_ = 0; // 1 byte bitfield

    get name(): string {
        return 'ServerHeader';
    }

    setName(_name: string): void {
        throw new Error('Method not implemented.');
    }

    get value(): string | number | Buffer<ArrayBufferLike> {
        throw new Error('Method not implemented.');
    }

    setValue(_value: string | number | Buffer): void {
        throw new Error('Method not implemented.');
    }

    get json() {
        return {
            name: this.name,
            len: this.messageLength,
            signature: this.messageSignature_,
            sequence: this.messageSequence_,
            flags: this.messageFlags_,
            serializeSize: this.serializeSize,
        };
    }

    override toString(): string {
        return `Message Length: ${this.messageLength_}, Message Signature: ${this.messageSignature_}, Message Sequence: ${this.messageSequence_}, Message Flags: ${this.messageFlags_}`;
    }

    setMessageLength(messageLength: number) {
        this.messageLength_ = messageLength;
    }

    get messageLength() {
        return this.messageLength_;
    }

    override get serializeSize() {
        return 11;
    }

    override serialize() {
        const buffer = Buffer.alloc(this.serializeSize);
        buffer.writeUInt16LE(this.messageLength, 0);
        buffer.write(this.messageSignature_, 2);
        buffer.writeUInt32LE(this.messageSequence_, 6);
        buffer.writeUInt8(this.messageFlags_, 10);
        return buffer;
    }

    override deserialize(buffer: Buffer) {
        super.deserialize(buffer);
        this.messageLength_ = buffer.readUInt16LE(0);
        this.messageSignature_ = buffer.toString('utf8', 2, 6);
        this.messageSequence_ = buffer.readUInt32LE(6);
        this.messageFlags_ = buffer.readUInt8(10);
    }

    get sequence() {
        return this.messageSequence_;
    }

    get flags() {
        return this.messageFlags_;
    }

    set sequence(sequence: number) {
        this.messageSequence_ = sequence;
    }

    set flags(flags: number) {
        this.messageFlags_ = flags;
    }
}
