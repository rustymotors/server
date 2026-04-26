import type { Serializable } from './types.js';

export class Short implements Serializable {
    private _value = 0;

    get sizeOf() {
        return 2;
    }

    serialize() {
        const b = Buffer.alloc(2);
        b.writeInt16BE(this._value);
        return b;
    }

    deserialize(buf: Buffer) {
        const v = buf.readInt16BE();
        this._value = v;
    }

    get value() {
        return this._value;
    }

    set value(val: number) {
        this._value = val;
    }
}

export class Long implements Serializable {
    private _value = 0;

    get sizeOf() {
        return 4;
    }

    serialize() {
        const b = Buffer.alloc(4);
        b.writeInt32BE(this._value);
        return b;
    }

    deserialize(buf: Buffer) {
        const v = buf.readInt32BE();
        this._value = v;
    }

    get value() {
        return this._value;
    }

    set value(val: number) {
        this._value = val;
    }
}

export class NPS_LOGICAL implements Serializable {
    private _value = false;

    get sizeOf() {
        return 2;
    }

    serialize() {
        const b = Buffer.alloc(2);
        if (this._value === true) {
            b.writeInt16BE(1);
        } else {
            b.writeInt16BE(0);
        }
        return b;
    }

    deserialize(buf: Buffer) {
        const v = buf.readInt16BE();
        if (v === 1) {
            this._value = true;
        } else {
            this._value = false;
        }
    }

    get value() {
        return this._value;
    }

    set value(val: boolean) {
        this._value = val;
    }
}

export class Char implements Serializable {
    private _value = 0;

    get sizeOf() {
        return 1;
    }

    serialize() {
        const b = Buffer.alloc(1);
        b.writeInt8(this._value);
        return b;
    }

    deserialize(buf: Buffer) {
        this._value = buf.readInt8();
    }

    get value() {
        return this._value;
    }

    set value(val: number) {
        this._value = val;
    }
}

export class Bool implements Serializable {
    private _value = false;

    get sizeOf() {
        return 1;
    }

    serialize() {
        const b = Buffer.alloc(1);
        if (this._value === true) {
            b.writeInt8(1);
        } else {
            b.writeInt8(0);
        }
        return b;
    }

    deserialize(buf: Buffer) {
        const v = buf.readInt8();
        if (v === 1) {
            this._value = true;
        } else {
            this._value = false;
        }
    }

    get value() {
        return this._value;
    }

    set value(val: boolean) {
        this._value = val;
    }
}

export class CString implements Serializable {
    private _string: Buffer;
    private _maxLen: number;

    constructor(maxLen: number) {
        this._maxLen = maxLen;
        this._string = Buffer.alloc(0);
    }

    get sizeOf() {
        return this._maxLen;
    }

    serialize() {
        const buf = Buffer.alloc(this._maxLen, 0);
        this._string.copy(buf, 0, 0, Math.min(this._string.byteLength, this._maxLen));
        return buf;
    }

    deserialize(buf: Buffer) {
        if (buf.byteLength < this._maxLen) {
            throw new Error(
                `need at least ${this._maxLen} bytes. got ${buf.byteLength}`,
            );
        }
        const nullIdx = buf.indexOf(0, 0);
        const end = nullIdx === -1 ? this._maxLen : Math.min(nullIdx, this._maxLen);
        this._string = Buffer.from(buf.subarray(0, end + 1)); // include null terminator
    }

    toString() {
        return sliceBuff(this._string, 0, this._string.byteLength - 1).toString('utf8');
    }

    get length() {
        return this._string.byteLength;
    }

    set(val: string) {
        if (val.length > this._maxLen - 1) {
            throw new Error(
                `string can only be ${this._maxLen - 1} bytes long, got ${val.length}`,
            );
        }
        this._string = Buffer.alloc(val.length + 1);
        this._string.write(`${val}\0`);
    }

    static compare(firstCString: CString, SecondCString: CString) {
        return firstCString.toString() === SecondCString.toString();
    }
}

export class CBlock implements Serializable {
    private _data: Buffer;
    private _size: number;

    constructor(size: number) {
        this._data = Buffer.alloc(size);
        this._size = size;
    }

    get sizeOf() {
        return this._size;
    }

    deserialize(buf: Buffer) {
        doesBufferFit(buf, this._size);
        buf.copy(this._data, 0, 0, this._size);
    }

    serialize(): Buffer {
        const tar = Buffer.alloc(this._size);
        this._data.copy(tar, 0, 0, this._size);
        return tar;
    }
}

/**
 * Aligns a given number to the specified alignment.
 *
 * @param {number} n - The number to be aligned.
 * @param {number} alignment - The alignment boundary.
 * @returns {number} - The aligned number.
 */
export function align(n: number, alignment: number): number {
    return (n + alignment - 1) & ~(alignment - 1);
}

/**
 * Aligns the given value to the nearest multiple of 4
 *
 * @param value - The number to be aligned.
 * @returns The aligned value, which is the smallest multiple of 8 that is greater than or equal to the input value.
 */

export function align4(value: number) {
    return align(value, 4);
}
/**
 * Pads the input buffer with zero bytes so that its length becomes a multiple of 4.
 *
 * @param inBuf - The input buffer to pad.
 * @returns A new buffer with zero bytes appended to make its length a multiple of 4.
 */
export function padBuffer(inBuf: Buffer): Buffer {
    const length = inBuf.byteLength;
    const pad = (4 - (length % 4)) % 4; // 0–3 bytes of padding
    return Buffer.concat([inBuf, Buffer.alloc(pad)]);
}

/**
 * Returns a subarray of the input buffer starting at the specified offset and of the specified length.
 * Throws an error if the input buffer does not contain enough bytes.
 *
 * @param inbuff - The input buffer to slice.
 * @param offset - The starting index from which to slice.
 * @param len - The number of bytes to include in the slice.
 * @returns A Buffer subarray containing the specified range.
 * @throws {Error} If the input buffer is not long enough to fulfill the request.
 */

export function sliceBuff(
    inbuff: Buffer,
    offset: number,
    len: number,
): Buffer<ArrayBuffer> {
    const endIdx = offset + len;
    if (inbuff.byteLength < endIdx) {
        throw new Error(`input buffer not long enough, need ${endIdx} bytes, got ${inbuff.byteLength}`);
    }
    return Buffer.from(inbuff.subarray(offset, endIdx));
}
/**
 * Sets or clears a single bit in a byte.
 *
 * @param byte - The original byte value (0-255).
 * @param bitIndex - The bit position to set or clear (0 for least significant bit, 7 for most significant).
 * @param value - If true, sets the bit; if false, clears the bit.
 * @returns The new byte value with the specified bit set or cleared.
 * @throws {Error} If byte or bitIndex is out of range.
 */

export function setBit(byte: number, bitIndex: number, value: boolean): number {
    checkSize1(byte);
    if (bitIndex < 0 || bitIndex > 7) {
        throw new Error('bitIndex must be in range 0-7');
    }
    return value ? byte | (1 << bitIndex) : byte & ~(1 << bitIndex);
}
/**
 * Clears a single bit in a byte.
 *
 * @param byte - The original byte value (0-255).
 * @param bitIndex - The bit position to clear (0 for least significant bit, 7 for most significant).
 * @returns The new byte value with the specified bit cleared.
 * @throws {Error} If byte or bitIndex is out of range.
 */

export function clearBit(byte: number, bitIndex: number): number {
    checkSize1(byte);
    if (bitIndex < 0 || bitIndex > 7) {
        throw new Error('bitIndex must be in range 0-7');
    }
    return byte & ~(1 << bitIndex);
}
/**
 * Gets the value of a single bit in a byte.
 *
 * @param byte - The byte value (0-255).
 * @param bitIndex - The bit position to get (0 for least significant bit, 7 for most significant).
 * @returns True if the bit is set, false otherwise.
 * @throws {Error} If byte or bitIndex is out of range.
 */

export function getBit(byte: number, bitIndex: number): boolean {
    checkSize1(byte);
    if (bitIndex < 0 || bitIndex > 7) {
        throw new Error('bitIndex must be in range 0-7');
    }
    return ((byte >> bitIndex) & 1) === 1;
}
/**
 * Creates a Buffer containing a single byte representing the given value.
 *
 * @param val - The number to write into the buffer. Must be in the range 0x00 to 0xFF (0 to 255).
 * @returns A Buffer containing the single byte value.
 * @throws {Error} If `val` is outside the range of a single byte.
 */
export function setByte(val: number): Buffer<ArrayBuffer> {
    const b = Buffer.alloc(1);

    checkSize1(val);
    b.writeUint8(val);
    return b;
}
/**
 * Checks if a given number fits within 1 byte (0x00 to 0xFF).
 * Throws an error if the value is outside this range.
 *
 * @param val - The number to check.
 * @throws {Error} If the value does not fit in 1 byte.
 */

export function checkSize1(val: number) {
    if (val < 0x00 || val > 0xff) {
        throw new Error(`value must fit in 1 bytes. got: ${val.toString(16)}`);
    }
}
/**
 * Checks whether a given number fits within 2 bytes (unsigned 16-bit integer).
 * Throws an error if the value is less than 0x00 or greater than 0xFFFF.
 *
 * @param val - The number to check.
 * @throws {Error} If the value does not fit in 2 bytes.
 */

export function checkSize2(val: number) {
    if (val < 0x00 || val > 0xffff) {
        throw new Error(`value must fit in 2 bytes. got: ${val.toString(16)}`);
    }
}
/**
 * Checks whether the given number fits within 4 bytes (unsigned 32-bit integer).
 * Throws an error if the value is less than 0x00 or greater than 0xFFFFFFFF.
 *
 * @param val - The number to check.
 * @throws {Error} If the value does not fit in 4 bytes.
 */

export function checkSize4(val: number) {
    if (val < 0x00 || val > 0xffffffff) {
        throw new Error(`value must fit in 4 bytes. got: ${val.toString(16)}`);
    }
}
export function doesBufferFit(buf: Buffer, maxSize: number) {
    if (buf.byteLength > maxSize) {
        throw new Error(
            `Input buffer too large. ${buf.byteLength} > ${maxSize}`,
        );
    }
}
export function checkMinLength(buf: Buffer, minSize: number) {
    if (buf.byteLength < minSize) {
        throw new Error(
            `Not enough bytes. Need ${minSize}, got ${buf.byteLength}`,
        );
    }
}

export function areBothObjectsAnInstanceOf(
    desiredType: any,
    firstObject: any,
    secondObject: any,
): boolean {
    return (
        firstObject instanceof desiredType &&
        secondObject instanceof desiredType
    );
}

export function shouldDeepDiff(obj: any) {
    if (
        obj instanceof CString ||
        obj instanceof Bool ||
        obj instanceof Long ||
        obj instanceof Short ||
        obj instanceof CBlock
    ) {
        return false;
    }
    return true;
}

export function diffObj(before: any, after: any) {
    if (before === after) return { isDataDiff: false, diffs: [] };
    if (typeof before === 'undefined' || typeof after === 'undefined') {
        const diffs =
            typeof before === 'undefined'
                ? Object.keys(after).map((key) => ({
                      name: key,
                      before: undefined,
                      after: after[key],
                  }))
                : typeof after === 'undefined'
                  ? Object.keys(before).map((key) => ({
                        name: key,
                        before: before[key],
                        after: undefined,
                    }))
                  : [];
        return { isDataDiff: true, diffs };
    }

    const diffs = [];
    const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

    for (const key of allKeys) {
        const beforeVal = before[key];
        const afterVal = after[key];

        if (
            shouldDeepDiff(beforeVal) &&
            shouldDeepDiff(afterVal) &&
            !Array.isArray(beforeVal) &&
            !Array.isArray(afterVal) &&
            typeof beforeVal === 'object' &&
            typeof afterVal === 'object' &&
            beforeVal &&
            afterVal
        ) {
            // Compare Buffers
            if (Buffer.isBuffer(beforeVal) && Buffer.isBuffer(afterVal)) {
                if (Buffer.compare(beforeVal, afterVal)) {
                    diffs.push({
                        name: key,
                        before: beforeVal,
                        after: afterVal,
                    });
                }
                continue;
            }
            // Deep compare objects
            const { diffs: deepDiffs } = diffObj(beforeVal, afterVal);
            if (deepDiffs.length > 0) {
                // Add parent key entry when nested object has changes
                diffs.push({
                    name: key,
                    before: beforeVal,
                    after: afterVal,
                });
                deepDiffs.forEach((diff) => {
                    diffs.push({
                        name: diff.name,
                        before: diff.before,
                        after: diff.after,
                    });
                });
            }
        } else if (areBothObjectsAnInstanceOf(CString, beforeVal, afterVal)) {
            if (!CString.compare(beforeVal, afterVal)) {
                diffs.push({
                    name: key,
                    before: beforeVal,
                    after: afterVal,
                });
            }
        } else if (beforeVal !== afterVal) {
            diffs.push({ name: key, before: beforeVal, after: afterVal });
        }
    }

    return { isDataDiff: diffs.length > 0, diffs };
}
