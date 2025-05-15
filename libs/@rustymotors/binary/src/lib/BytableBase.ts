/**
 * The `BytableBase` class serves as a base class for handling binary data operations.
 * It provides utility methods for working with buffers, validating values, and
 * converting data to and from binary formats. Subclasses are expected to implement
 * specific serialization and deserialization logic.
 *
 * @remarks
 * This class is designed to be extended and should not be used directly.
 * Subclasses must override the `toString`, `deserialize`, `serialize`, and
 * `serializeSize` methods to provide specific functionality.
 *
 * @example
 * ```typescript
 * class MyBytable extends BytableBase {
 *     toString() {
 *         // Implement string representation logic
 *     }
 *     deserialize(buffer: Buffer) {
 *         // Implement deserialization logic
 *     }
 *     serialize() {
 *         // Implement serialization logic
 *     }
 *     get serializeSize() {
 *         // Return the size of the serialized data
 *     }
 * }
 * ```
 */
export class BytableBase {
    protected buffer: DataView = new DataView(new ArrayBuffer(1));

    protected getUint16(
        this: BytableBase,
        offset: number,
        littleEndian = false,
    ) {
        return this.buffer.getUint16(offset, littleEndian);
    }

    protected getUint32(
        this: BytableBase,
        offset: number,
        littleEndian = false,
    ) {
        return this.buffer.getUint32(offset, littleEndian);
    }

    toString(this: BytableBase) {
        throw new Error('Method should be implemented by subclass');
    }

    deserialize(this: BytableBase, _buffer: Buffer) {
        throw new Error('Method should be implemented by subclass');
    }

    serialize(this: BytableBase) {
        throw new Error('Method should be implemented by subclass');
    }

    /**
     * Validate the value of the container.
     * @param value - The value to validate.
     * @returns void
     * @throws Error if the value is NaN or an empty buffer
     */
    protected validateValue(value: string | number | Buffer) {
        if (typeof value === 'number' && Number.isNaN(value)) {
            throw new Error('Cannot set NaN value');
        }
        if (value instanceof Buffer && value.length === 0) {
            throw new Error('Cannot set empty buffer');
        }
    }

    /**
     * Get the byte length of the value.
     * @param value - The value to get the byte length of.
     * @returns The byte length of the value.
     */
    protected getByteLength(value: string | number | Buffer) {
        if (value instanceof Buffer) {
            return value.byteLength;
        }
        // Convert strings and numbers to Buffer to get correct byte length
        return Buffer.from(String(value)).byteLength;
    }

    protected validateString(value: string) {
        if (value.length === 0) {
            throw new Error('Cannot set empty string');
        }
    }

    protected toBuffer(value: string | number | Buffer) {
        if (value instanceof Buffer) {
            return value;
        }
        return Buffer.from(String(value));
    }

    protected align8(value: number) {
        return Math.ceil(value / 8) * 8;
    }

    get serializeSize(): number {
        throw new Error('Method should be implemented by subclass');
    }
}

/**
 * Converts a string, number, or Buffer to a Buffer.
 *
 * Strings are converted to Buffers containing their UTF-8 bytes. Numbers are converted to 4-byte Buffers representing the value as a 32-bit unsigned integer in little-endian format. Buffers are returned unchanged.
 *
 * @param value - The value to convert to a Buffer.
 * @returns A Buffer containing the binary representation of the input.
 */
export function coerceValueToBuffer(
    value: string | number | Buffer<ArrayBufferLike>,
) {
    let coercedValue: Buffer;
    if (typeof value === 'string') {
        coercedValue = Buffer.from(value);
    } else if (typeof value === 'number') {
        coercedValue = Buffer.alloc(4);
        coercedValue.writeUInt32LE(value, 0);
    } else {
        coercedValue = value;
    }
    return coercedValue;
}
