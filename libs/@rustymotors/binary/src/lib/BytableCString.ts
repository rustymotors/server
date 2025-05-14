import { BytableBase } from './BytableBase.js';
import { BytableObject } from './types.js';

export class BytableCString extends BytableBase implements BytableObject {
    private value_: string | number | Buffer = '';
    private nullTerminated = true;
    private length = 0;
    private name_ = '';

    /**
     * Set the value of the container.
     * @param value - The value to set.
     * @returns void
     */
    setValue(value: string | number | Buffer) {
        this.value_ = value;
        this.length = this.getByteLength(value);
    }

    getValue() {
        return this.value_;
    }

    setNullTerminated(_nullTerminated: boolean) {
        throw new Error('Cannot set null termination for CString');
    }

    getNullTerminated() {
        return this.nullTerminated;
    }

    /**
     * Set the length of the container.
     * @param length - The length of the container.
     * @returns void
     * @throws Error if the container is set to null terminated
     */
    setLength(length: number) {
        if (this.nullTerminated) {
            throw new Error('Cannot set length for null terminated container');
        } else {
            this.length = length;
        }
    }

    getLength() {
        return this.length;
    }

    override get serializeSize() {
        if (this.nullTerminated) {
            return this.length + 1;
        } else {
            throw new Error('Cannot get serialize size for CString');
        }
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
            throw new Error('Cannot serialize CString');
        }
    }

    /**
     * Deserialize the container.
     * @param buffer - The buffer to deserialize.
     * @returns void
     */
    override deserialize(buffer: Buffer) {
        if (this.nullTerminated) {
            let length = 0;
            while (buffer[length] !== 0) {
                length++;
            }
            this.setValue(buffer.subarray(0, length).toString('utf-8'));
            this.length = length; // Exclude the null terminator from the length
        } else {
            throw new Error('Cannot deserialize CString');
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

    setName(name: string) {
        this.name_ = name;
    }

    get name() {
        return this.name_;
    }

    get value() {
        return this.value_;
    }

    override toString(): string {
        return this.value_.toString();
    }
}
