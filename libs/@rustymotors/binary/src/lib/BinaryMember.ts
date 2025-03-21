export const BINARY_ALIGNMENT = 4;

/**
 * Converts a 16-bit number from host byte order to network byte order.
 *
 * @param {number} n - The 16-bit number to convert.
 * @returns {number} The converted 16-bit number in network byte order.
 */
export function htons(n: number): number {
    return ((n & 0xff) << 8) | ((n >> 8) & 0xff);
}
/**
 * Converts a 32-bit number from host byte order to network byte order.
 *
 * @param {number} n - The 32-bit number to be converted.
 * @returns {number} - The converted 32-bit number in network byte order.
 */
export function htonl(n: number): number {
    return ((n & 0xff) << 24) | ((n & 0xff00) << 8) | ((n & 0xff0000) >> 8) | ((n >> 24) & 0xff);
}
/**
 * Converts a 16-bit number from network byte order to host byte order.
 *
 * @param {number} n - The 16-bit number in network byte order.
 * @returns {number} - The 16-bit number in host byte order.
 */
export function ntohs(n: number): number {
    return htons(n);
}
/**
 * Converts a network byte order integer to host byte order.
 *
 * @param {number} n - The number in network byte order.
 * @returns {number} - The number in host byte order.
 */
export function ntohl(n: number): number {
    return htonl(n);
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
 * Adds padding to a buffer to align its length to the specified alignment.
 *
 * @param {Uint8Array} buffer - The buffer to which padding will be added.
 * @param {number} alignment - The alignment boundary to which the buffer length should be aligned.
 * @returns {Uint8Array} A new buffer with the original buffer's content and the added padding.
 */
export function addAlignementPadding(buffer: Uint8Array, alignment: number): Uint8Array {
    const padding = new Uint8Array(align(buffer.length, alignment) - buffer.length);
    return new Uint8Array([...buffer, ...padding]);
}
/**
 * Verifies that the length of the buffer is aligned to the specified alignment.
 *
 * @param {Uint8Array} buffer - The buffer to verify
 * @param {number} alignment - The alignment value to check against.
 * @throws {Error} If the buffer length is not aligned to the specified alignment.
 */
export function verifyAlignment(buffer: Uint8Array, alignment: number) {
    if (buffer.length % alignment !== 0) {
        throw new Error(`Buffer size is not aligned to ${alignment}`);
    }
}


export class BinaryMember {
    protected value: Uint8Array;
    protected maxSize: number;
    protected shouldPad: boolean;

    constructor(size = 0, shouldPad = true) {
        this.value = new Uint8Array(size);
        this.maxSize = size;
        this.shouldPad = shouldPad;
    }
    set(v: Uint8Array) {
        if (v.length > this.maxSize) {
            throw new Error(`Value exceeds maximum size of ${this.maxSize}`);
        }
        if (this.shouldPad) {
            this.value = addAlignementPadding(v, BINARY_ALIGNMENT);
        }
        this.value = v;
    }
    get() {
        if (this.shouldPad) {
            verifyAlignment(this.value, BINARY_ALIGNMENT);
            return this.value;
        }
        return this.value;
    }
    size() {
        return this.value.length;
    }

    toString() {
        return this.value.toString();
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
}

export class Uint32_t extends BinaryMember {
    constructor() {
        super(4);
    }

    getInt(endian: "LE" | "BE" = "LE"): number {
        if (endian === "BE") {
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
            throw new Error(`CString exceeds maximum size of ${this.maxSize + 4}, got ${v.length}`);
        }

        if (v.length <= 4) {
            throw new Error("CString must be at least 5 bytes long");
        }

        const length = new Uint32_t();
        length.set(v.slice(0, 4));
        const stringLength = length.getInt("BE");
        if (stringLength + 4 > v.length) {
            throw new Error(`CString length is ${stringLength} but only ${v.length - 4} bytes are available`);
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
}



export type BinaryFieldTypes = {
    set: (value: Uint8Array) => void;
    get: () => Uint8Array;
    size: () => number;
    constructor: (size: number) => BinaryFieldTypes;
}

export type BinaryFieldsStructure = Omit<BinaryFieldTypes, "constructor"> & {
    getField: (name: string) => BinaryFieldTypes;
    setField: (name: string, value: Uint8Array) => void;
}

export class RawBinaryStructure implements BinaryFieldsStructure {
    protected _fields: Record<string, BinaryFieldTypes>;

    constructor(fields: Record<string, BinaryFieldTypes>) {        
        this._fields = fields;

    }
    getField(name: string): BinaryFieldTypes {
        if (!this._fields[name]) {
            throw new Error(`Field ${name} not found`);
        }
        return this._fields[name];
    }

    setField(name: string, value: Uint8Array) {
        if (!this._fields[name]) {
            throw new Error(`Field ${name} not found`);
        }
        this._fields[name].set(value);
    }

    set(value: Uint8Array) {
        let offset = 0;
        for (const field of Object.values(this._fields)) {
            const fieldSize = field.size();
            field.set(value.slice(offset, offset + fieldSize));
            offset += fieldSize;
        }
    }

    get() {
        return Object.values(this._fields)
            .map(field => field.get())
            .reduce((acc, v) => {
                const combined = new Uint8Array(acc.length + v.length);
                combined.set(acc);
                combined.set(v, acc.length);
                return combined;
            }, new Uint8Array());
    }

    size() {
        return Object.values(this._fields).reduce((acc, field) => acc + field.size(), 0);
    }
}



