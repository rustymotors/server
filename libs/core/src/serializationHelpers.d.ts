/// <reference types="node" />
/**
 * Clamp a value between 0 and 255
 * @param {number} value
 * @returns {number}
 */
export declare function clamp16(value: number): number;
/**
 * Clamp a value between 0 and 65535
 * @param {number} value
 * @returns {number}
 */
export declare function clamp32(value: number): number;
/**
 * Serializes a boolean to a buffer.
 * @param {boolean} bool
 * @returns {Buffer}
 */
export declare function serializeBool(bool: boolean): Buffer;
/**
 * Serializes a byte to a buffer.
 * @param {number} byte
 * @returns {Buffer}
 */
export declare function serializeByte(byte: number): Buffer;
/**
 * Serializes a word to a buffer.
 * @param {number} word
 * @returns {Buffer}
 */
export declare function serializeWord(word: number): Buffer;
/**
 * Serializes a dword to a buffer.
 * @param {number} dword
 * @returns {Buffer}
 */
export declare function serializeDWord(dword: number): Buffer;
/**
 * Serializes a float to a buffer.
 * @param {number} f
 * @returns {Buffer}
 */
export declare function serializeFloat(f: number): Buffer;
/**
 * Serializes a string to a buffer. The buffer will be prefixed with the length of the string.
 * @param {string} str
 * @returns {Buffer}
 */
export declare function serializeString(str: string): Buffer;
/**
 * Deserializes a boolean from a buffer.
 * @param {Buffer} buff
 * @returns {boolean}
 */
export declare function deserializeBool(buff: Buffer): boolean;
/**
 * Deserializes a byte from a buffer.
 * @param {Buffer} buff
 * @returns {number}
 */
export declare function deserializeByte(buff: Buffer): number;
/**
 * Deserializes a word from a buffer.
 * @param {Buffer} buff
 * @returns {number}
 */
export declare function deserializeWord(buff: Buffer): number;
/**
 * Deserializes a dword from a buffer.
 * @param {Buffer} buff
 * @returns {number}
 */
export declare function deserializeDWord(buff: Buffer): number;
/**
 * Deserializes a float from a buffer.
 * @param {Buffer} buff
 * @returns {number}
 */
export declare function deserializeFloat(buff: Buffer): number;
/**
 * Deserializes a string from a buffer. The buffer is expected to be prefixed with the length of the string.
 * @param {Buffer} buf
 * @returns {string}
 */
export declare function deserializeString(buf: Buffer): string;
export declare function sizeOfBool(): number;
export declare function sizeOfByte(): number;
export declare function sizeOfWord(): number;
export declare function sizeOfDWord(): number;
export declare function sizeOfFloat(): number;
/**
 * Returns the size of a string, including the length prefix.
 * @param {string} string
 * @returns {number}
 */
export declare function sizeOfString(string: string): number;
