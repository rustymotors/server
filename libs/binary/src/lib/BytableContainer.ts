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

abstract class BytableContainerBase extends BytableBase implements BytableObject {
    protected value_: string | number | Buffer = '';
    protected nullTerminated = false;
    protected length = 0;
    protected name_ = '';

    abstract get json(): Record<string, unknown>;
    abstract override get serializeSize(): number;
    abstract override serialize(): Buffer;
    abstract override deserialize(buffer: Buffer): void;

    setValue(value: string | number | Buffer): void {
        this.validateValue(value);
        this.value_ = value;
        this.length = this.getByteLength(value);
    }

    getValue(): string | number | Buffer {
        return this.value_;
    }

    setNullTerminated(nullTerminated: boolean): void {
        this.nullTerminated = nullTerminated;
    }

    getNullTerminated(): boolean {
        return this.nullTerminated;
    }

    /**
     * Set the length of the container.
     * @param length - The length of the container.
     * @returns void
     * @throws Error if the container is set to null terminated
     */
    setLength(length: number): void {
        if (this.nullTerminated) {
            throw new Error('Cannot set length for null terminated container');
        } else {
            this.length = length;
        }
    }

    getLength(): number {
        return this.length;
    }

    setName(name: string): void {
        this.name_ = name;
    }

    get name(): string {
        return this.name_;
    }

    get value(): string | number | Buffer {
        return this.value_;
    }

    override toString(): string {
        throw new Error('Method not implemented.');
    }
}

/**
 * Represents a container for serializing and deserializing short binary data with optional null-termination.
 * 
 * This class extends `BytableContainerBase` and provides methods to serialize its value either with a length-prefixed
 * format (2 bytes for length) or as a null-terminated string. It also supports deserialization from a buffer and exposes
 * a JSON representation of its state.
 * 
 * @remarks
 * - If `nullTerminated` is `true`, the serialized format ends with a null byte (`0x00`).
 * - If `nullTerminated` is `false`, the serialized format is prefixed with a 2-byte big-endian length.
 * 
 * @property {string} name_ - The name of the container.
 * @property {string} value_ - The value stored in the container.
 * @property {number} length - The length of the value.
 * @property {boolean} nullTerminated - Indicates if the value is null-terminated.
 * @property {number} serializeSize - The size of the serialized buffer.
 * 
 * @method serialize - Serializes the container to a Buffer.
 * @method deserialize - Deserializes the container from a Buffer.
 * @method json - Returns a JSON representation of the container.
 */
export class BytableShortContainer extends BytableContainerBase {
    override get serializeSize() {
        return this.nullTerminated ? this.length + 1 : this.length + 2;
    }

    /**
     * Serialize the container.
     * @returns Buffer - The serialized container.
     */
    override serialize() {
        const value = this.toBuffer(this.value_);
        if (this.nullTerminated) {
            return value.length === 0
                ? Buffer.from('\0')
                : Buffer.concat([value, Buffer.from('\0')]);
        } else {
            const lengthPrefix = Buffer.alloc(2);
            lengthPrefix.writeUInt16BE(this.length, 0);
            return Buffer.concat([lengthPrefix, value]);
        }
    }

    /**
     * Deserialize the container.
     * @param buffer - The buffer to deserialize.
     * @returns void
     */
    override deserialize(buffer: Buffer) {
        const offset = 0;
        if (this.nullTerminated) {
            // Find the first null byte (0x00)
            const nullIdx = buffer.indexOf(0, offset);
            if (nullIdx === -1) {
                throw new Error('Null terminator not found in buffer');
            }
            const str = buffer.subarray(offset, nullIdx).toString('utf-8');
            this.setValue(str);
            this.length = Buffer.from(str).length;
        } else {
            const length = buffer.readUInt16BE(offset);
            this.setValue(
                buffer
                    .subarray(offset + 2, offset + length + 2)
                    .toString('utf-8'),
            );
            this.length = length;
        }
    }

    get json() {
        return {
            name: this.name_,
            value: this.value_,
            length: this.length,
            nullTerminated: this.nullTerminated,
            serializeSize: this.serializeSize,
        };
    }
}

/**
 * Represents a container for serializing and deserializing values with optional null-termination.
 * Extends {@link BytableContainerBase}.
 *
 * @remarks
 * - If `nullTerminated` is `true`, the serialized buffer ends with a null byte (`\0`).
 * - If `nullTerminated` is `false`, the serialized buffer is prefixed with a 4-byte length.
 *
 * @property {number} serializeSize - The size of the serialized container in bytes.
 * @property {object} json - A JSON representation of the container's state.
 *
 * @method serialize Serializes the container's value into a buffer.
 * @method deserialize Deserializes a buffer into the container's value.
 */
export class BytableContainer extends BytableContainerBase {
    override get serializeSize() {
        return this.nullTerminated ? this.length + 1 : this.length + 4;
    }

    /**
     * Serialize the container.
     * @returns Buffer - The serialized container.
     */
    override serialize() {
        const value = this.toBuffer(this.value_);
        if (this.nullTerminated) {
            return value.length === 0
                ? Buffer.from('\0')
                : Buffer.concat([value, Buffer.from('\0')]);
        } else {
            const lengthPrefix = Buffer.alloc(4);
            lengthPrefix.writeUInt32BE(this.length, 0);
            return Buffer.concat([lengthPrefix, value]);
        }
    }

    /**
     * Deserialize the container.
     * @param buffer - The buffer to deserialize.
     * @returns void
     */
    override deserialize(buffer: Buffer) {
        const offset = 0;
        if (this.nullTerminated) {
            // Find the first null byte (0x00)
            const nullIdx = buffer.indexOf(0, offset);
            if (nullIdx === -1) {
                throw new Error('Null terminator not found in buffer');
            }
            const str = buffer.subarray(offset, nullIdx).toString('utf-8');
            this.setValue(str);
            this.length = Buffer.from(str).length;
        } else {
            const length = buffer.readUInt32BE(offset);
            this.setValue(
                buffer
                    .subarray(offset + 4, offset + length + 4)
                    .toString('utf-8'),
            );
            this.length = length;
        }
    }

    get json() {
        return {
            value: this.value_,
            length: this.length,
            nullTerminated: this.nullTerminated,
            serializeSize: this.serializeSize,
        };
    }
}

/**
 * NPS_Pack 'p'-format string: 4-byte BE prefix (strlen+1, null-inclusive),
 * then the string bytes, then a null terminator.
 *
 * Stores the value as a clean Buffer (no null). The null is added on serialize
 * and stripped on deserialize, matching NPS_Pack::pack / NPS_Pack::unpack.
 */
export class BytablePString extends BytableContainer {
    override get serializeSize() {
        return this.toBuffer(this.value_).length + 1 + 4;
    }

    override serialize() {
        const value = this.toBuffer(this.value_);
        const wireLength = value.length + 1;
        const lengthPrefix = Buffer.alloc(4);
        lengthPrefix.writeUInt32BE(wireLength, 0);
        const content = Buffer.alloc(wireLength); // pre-zeroed: null terminator is implicit
        value.copy(content, 0);
        return Buffer.concat([lengthPrefix, content]);
    }

    override deserialize(buffer: Buffer) {
        const length = buffer.readUInt32BE(0);
        const strLength = Math.max(0, length - 1); // exclude null terminator
        if (strLength === 0) {
            this.value_ = '';
            this.length = length;
        } else {
            this.setValue(buffer.subarray(4, 4 + strLength));
            this.length = length;
        }
    }
}