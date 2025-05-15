import { SerializableInterface } from 'rusty-motors-shared-packets';

export const BINARY_ALIGNMENT = 4;

/**
 * Converts a 16-bit unsigned integer from host to network byte order (big-endian).
 *
 * @param n - The 16-bit unsigned integer to convert.
 * @returns The value of {@link n} with its bytes swapped to network byte order.
 */
export function htons(n: number): number {
    return ((n & 0xff) << 8) | ((n >> 8) & 0xff);
}
/**
 * Converts a 32-bit integer from host byte order to network byte order (big-endian).
 *
 * @param n - The 32-bit integer to convert.
 * @returns The 32-bit integer in network (big-endian) byte order.
 */
export function htonl(n: number): number {
    return (
        ((n & 0xff) << 24) |
        ((n & 0xff00) << 8) |
        ((n & 0xff0000) >> 8) |
        ((n >> 24) & 0xff)
    );
}
/**
 * Converts a 16-bit number from network byte order to host byte order.
 *
 * @param n - The 16-bit number in network byte order.
 * @returns The number converted to host byte order.
 */
export function ntohs(n: number): number {
    return htons(n);
}
/**
 * Converts a 32-bit integer from network byte order to host byte order.
 *
 * @param n - The 32-bit integer in network byte order.
 * @returns The integer in host byte order.
 */
export function ntohl(n: number): number {
    return htonl(n);
}

/**
 * Rounds a number up to the nearest multiple of the specified alignment.
 *
 * @param n - The number to align.
 * @param alignment - The alignment boundary.
 * @returns The smallest multiple of {@link alignment} greater than or equal to {@link n}.
 */
export function align(n: number, alignment: number): number {
    if (alignment <= 0) throw new Error('Alignment must be > 0');
    return Math.ceil(n / alignment) * alignment;
}
/**
 * Returns a new buffer padded with zeros so its length is a multiple of the specified alignment.
 *
 * @param buffer - The input buffer to pad.
 * @param alignment - The byte alignment boundary.
 * @returns A new buffer containing the original data followed by zero padding as needed.
 */
export function addAlignementPadding(
    buffer: Uint8Array,
    alignment: number,
): Uint8Array {
    const padding = new Uint8Array(
        align(buffer.length, alignment) - buffer.length,
    );
    return new Uint8Array([...buffer, ...padding]);
}
/**
 * Throws an error if the buffer's length is not a multiple of the specified alignment.
 *
 * @param buffer - The buffer to check.
 * @param alignment - The required alignment in bytes.
 * @throws {Error} If {@link buffer} length is not a multiple of {@link alignment}.
 */
export function verifyAlignment(buffer: Uint8Array, alignment: number) {
    if (buffer.length % alignment !== 0) {
        throw new Error(
            `Buffer size is not aligned to ${alignment}, got ${buffer.length}`,
        );
    }
}

export class BinaryMember implements SerializableInterface {
    protected value: Uint8Array;
    protected maxSize: number;
    protected shouldPad: boolean;

    constructor(size = 0, shouldPad = false) {
        this.value = new Uint8Array(size);
        this.maxSize = size;
        this.shouldPad = shouldPad;
    }
    set(v: Uint8Array) {
        const raw = this.shouldPad
            ? addAlignementPadding(v, BINARY_ALIGNMENT)
            : v;
        if (raw.length > this.maxSize) {
            throw new Error(`Value exceeds maximum size of ${this.maxSize}`);
        }
        this.value = raw;
    }

    get() {
        return this.value;
    }
    size() {
        return this.value.length;
    }

    toString() {
        return this.value.toString();
    }

    serialize(): Buffer {
        return Buffer.from(this.get());
    }

    deserialize(data: Buffer) {
        this.set(new Uint8Array(data));
    }

    getByteSize(): number {
        return this.size();
    }

    toHexString(): string {
        return this.get().reduce(
            (acc, v) => acc + v.toString(16).padStart(2, '0'),
            '',
        );
    }
}

export class Uint8_t extends BinaryMember {
    constructor(shouldPad = true) {
        super(1, shouldPad);
    }
}

export class Uint16_t extends BinaryMember {
    constructor() {
        super(2);
    }

    getShort(endian: 'LE' | 'BE' = 'LE'): number {
        if (endian === 'BE') {
            return this.getBE();
        }
        return this.getLE();
    }

    /**
     * Converts the first two bytes of the `value` array to a 16-bit little-endian integer.
     *
     * @returns {number} The 16-bit little-endian integer representation of the first two bytes.
     */
    getLE(): number {
        const byte0 = this.value[0] || 0;
        const byte1 = (this.value[1] || 0) << 8;
        return byte0 | byte1;
    }

    /**
     * Converts the first two bytes of the `value` array to a 16-bit big-endian integer.
     *
     * @returns {number} The 16-bit big-endian integer representation of the first two bytes.
     */
    getBE(): number {
        const byte0 = (this.value[0] || 0) << 8;
        const byte1 = this.value[1] || 0;
        return byte0 | byte1;
    }

    setShort(value: number, endian: 'LE' | 'BE' = 'LE') {
        if (value < 0 || value > 0xffff) {
            throw new Error(`Value ${value} is not a 16-bit integer`);
        }

        if (endian === 'BE') {
            this.setBE(value);
        } else {
            this.setLE(value);
        }
    }

    /**
     * Sets the value of the binary member to a 16-bit little-endian integer.
     *
     * @param {number} value - The 16-bit little-endian integer value to set.
     */
    setLE(value: number) {
        this.value = new Uint8Array([value & 0xff, (value >> 8) & 0xff]);
    }

    /**
     * Sets the value of the binary member to a 16-bit big-endian integer.
     *
     * @param {number} value - The 16-bit big-endian integer value to set.
     */
    setBE(value: number) {
        this.value = new Uint8Array([(value >> 8) & 0xff, value & 0xff]);
    }
}

export class Uint32_t extends BinaryMember {
    constructor() {
        super(4);
    }

    getInt(endian: 'LE' | 'BE' = 'LE'): number {
        if (endian === 'BE') {
            return this.getBE();
        }
        return this.getLE();
    }

    /**
     * Converts the first four bytes of the `value` array to a 32-bit little-endian integer.
     *
     * @returns {number} The 32-bit little-endian integer representation of the first four bytes.
     */
    getLE(): number {
        const byte0 = this.value[0] || 0;
        const byte1 = (this.value[1] || 0) << 8;
        const byte2 = (this.value[2] || 0) << 16;
        const byte3 = (this.value[3] || 0) << 24;
        return byte0 | byte1 | byte2 | byte3;
    }

    /**
     * Converts the first four bytes of the `value` array to a 32-bit big-endian integer.
     *
     * @returns {number} The 32-bit big-endian integer representation of the first four bytes.
     */
    getBE(): number {
        const byte0 = (this.value[0] || 0) << 24;
        const byte1 = (this.value[1] || 0) << 16;
        const byte2 = (this.value[2] || 0) << 8;
        const byte3 = this.value[3] || 0;
        return byte0 | byte1 | byte2 | byte3;
    }

    setInt(value: number, endian: 'LE' | 'BE' = 'LE') {
        if (value < 0 || value > 0xffffffff) {
            throw new Error(`Value ${value} is not a 32-bit integer`);
        }

        if (endian === 'BE') {
            this.setBE(value);
        } else {
            this.setLE(value);
        }
    }

    /**
     * Sets the value of the binary member to a 32-bit little-endian integer.
     *
     * @param {number} value - The 32-bit little-endian integer value to set.
     */
    setLE(value: number) {
        this.value = new Uint8Array([
            value & 0xff,
            (value >> 8) & 0xff,
            (value >> 16) & 0xff,
            (value >> 24) & 0xff,
        ]);
    }

    /**
     * Sets the value of the binary member to a 32-bit big-endian integer.
     *
     * @param {number} value - The 32-bit big-endian integer value to set.
     */
    setBE(value: number) {
        this.value = new Uint8Array([
            (value >> 24) & 0xff,
            (value >> 16) & 0xff,
            (value >> 8) & 0xff,
            value & 0xff,
        ]);
    }
}

export class Uint8_tArray extends BinaryMember {
    constructor(size: number) {
        super(size);
    }
}

/**
 * A class representing a string of characters.
 * The string is stored as a sequence of characters followed by a null terminator.
 * It is prefixed with a 32-bit integer representing the length of the string.
 * The length includes the null terminator.
 * The prefix is in network byte order.
 */
export class CString extends BinaryMember {
    constructor(size: number) {
        super(size);
    }

    override set(v: Uint8Array) {
        if (v.length > this.maxSize + 4) {
            throw new Error(
                `CString exceeds maximum size of ${this.maxSize + 4}, got ${v.length}`,
            );
        }

        if (v.length <= 4) {
            throw new Error('CString must be at least 5 bytes long');
        }

        const length = new Uint32_t();
        length.set(v.slice(0, 4));
        const stringLength = length.getInt('BE');
        if (stringLength + 4 > v.length) {
            throw new Error(
                `CString length is ${stringLength} but only ${v.length - 4} bytes are available`,
            );
        }

        this.value = v.slice(4, stringLength + 4);
    }
    /**
     * Returns the string as a sequence of characters followed by a null terminator.
     * The string is prefixed with a 32-bit integer representing the length of the string.
     * The prefix is in network byte order.
     * @returns {Uint8Array} The string as a sequence of characters followed by a null terminator.
     */
    override get(): Uint8Array {
        const length = new Uint32_t();
        length.set(new Uint8Array([this.value.length]));
        return new Uint8Array([...length.get(), ...this.value]);
    }

    /**
     * Calculates the size of the binary member.
     *
     * @returns {number} The size of the binary member, which is the length of the value plus 4.
     */
    override size(): number {
        return this.value.length + 4;
    }

    /**
     * Returns the string as a sequence of characters without the null terminator.
     * @returns {string} The string as a sequence of characters.
     */
    override toString(): string {
        return this.value.toString();
    }
}
