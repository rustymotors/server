/**
 * Clamp a value between 0 and 255
 * @param {number} value
 * @returns {number}
 */
export function clamp16(value: number): number {
    return Math.max(0, Math.min(65535, value));
}

/**
 * Clamp a value between 0 and 65535
 * @param {number} value
 * @returns {number}
 */
export function clamp32(value: number): number {
    return Math.max(0, Math.min(4294967295, value));
}

/**
 * Serializes a boolean to a buffer.
 * @param {boolean} bool
 * @returns {Buffer}
 */
export function serializeBool(bool: boolean): Buffer {
    const buf = Buffer.alloc(1);

    buf.writeUInt8(bool ? 1 : 0);

    return buf;
}

/**
 * Serializes a byte to a buffer.
 * @param {number} byte
 * @returns {Buffer}
 */
export function serializeByte(byte: number): Buffer {
    const buf = Buffer.alloc(1);

    buf.writeUInt8(byte);

    return buf;
}

/**
 * Serializes a word to a buffer.
 * @param {number} word
 * @returns {Buffer}
 */
export function serializeWord(word: number): Buffer {
    const buf = Buffer.alloc(2);

    buf.writeUInt16BE(word);

    return buf;
}

/**
 * Serializes a dword to a buffer.
 * @param {number} dword
 * @returns {Buffer}
 */
export function serializeDWord(dword: number): Buffer {
    const buf = Buffer.alloc(4);

    buf.writeUInt32BE(dword);

    return buf;
}

/**
 * Serializes a float to a buffer.
 * @param {number} f
 * @returns {Buffer}
 */
export function serializeFloat(f: number): Buffer {
    const buf = Buffer.alloc(4);

    buf.writeFloatBE(f);

    return buf;
}

/**
 * Serializes a string to a buffer. The buffer will be prefixed with the length of the string.
 * @param {string} str
 * @returns {Buffer}
 */
export function serializeString(str: string): Buffer {
    const buf = Buffer.alloc(str.length + 2);

    buf.writeUInt16BE(str.length);
    buf.write(str, 2);

    return buf;
}

/**
 * Deserializes a boolean from a buffer.
 * @param {Buffer} buff
 * @returns {boolean}
 */
export function deserializeBool(buff: Buffer): boolean {
    return buff.readUInt8() === 1;
}

/**
 * Deserializes a byte from a buffer.
 * @param {Buffer} buff
 * @returns {number}
 */
export function deserializeByte(buff: Buffer): number {
    return buff.readUInt8();
}

/**
 * Deserializes a word from a buffer.
 * @param {Buffer} buff
 * @returns {number}
 */
export function deserializeWord(buff: Buffer): number {
    return buff.readUInt16BE();
}

/**
 * Deserializes a dword from a buffer.
 * @param {Buffer} buff
 * @returns {number}
 */
export function deserializeDWord(buff: Buffer): number {
    return buff.readUInt32BE();
}

/**
 * Deserializes a float from a buffer.
 * @param {Buffer} buff
 * @returns {number}
 */
export function deserializeFloat(buff: Buffer): number {
    return buff.readFloatBE();
}

/**
 * Deserializes a string from a buffer. The buffer is expected to be prefixed with the length of the string.
 * @param {Buffer} buf
 * @returns {string}
 */
export function deserializeString(buf: Buffer): string {
    const size = buf.readUInt16BE();
    if (size > buf.length - 2) {
        throw Error(
            `Size is bigger than the buffer length - 2. Size: ${size}, Buffer length: ${buf.length}`,
        );
    }
    const str = buf.subarray(2, size + 2).toString("utf8");

    return str;
}

export function sizeOfBool() {
    return 1;
}

export function sizeOfByte() {
    return 1;
}

export function sizeOfWord() {
    return 2;
}

export function sizeOfDWord() {
    return 4;
}

export function sizeOfFloat() {
    return 4;
}

/**
 * Returns the size of a string, including the length prefix.
 * @param {string} string
 * @returns {number}
 */
export function sizeOfString(string: string): number {
    return string.length + 2;
}
