/// <reference types="node" />
import { SerializedObject } from "../interfaces/index.js";
export declare class SerializerBase implements SerializedObject {
    deserialize(_inputBuffer: Buffer): SerializerBase;
    serialize(): Buffer;
    serializeSize(): number;
    /**
     * Serialize a string.
     */
    static _serializeString(str: string): Buffer;
    /**
     * Serialize a "word" short 2-byte integer.
     * @param {number} int16
     * @returns {Buffer}
     */
    static _serializeWord(int16: number): Buffer;
    /**
     * Serialize a "double" long 4-byte integer.
     * @param {number} double
     * @returns {Buffer}
     */
    static _serializeDouble(double: number): Buffer;
    /**
     *
     * Serialize a "float" 4-byte floating point number.
     * @param {number} float
     * @returns {Buffer}
     */
    static _serializeFloat(float: number): Buffer;
    /**
     * Serialize a boolean.
     * @param {boolean} bool
     * @returns {Buffer}
     */
    static _serializeBool(bool: boolean): Buffer;
    /**
     * Serialize a byte.
     * @param {number} byte
     * @returns {Buffer}
     */
    static _serializeByte(byte: number): Buffer;
    /**
     * Deserialize a "word" short 2-byte integer.
     * @param {Buffer} buf
     * @returns {number}
     */
    static _deserializeWord(buf: Buffer): number;
    /**
     * Deserialize a "double" long 4-byte integer.
     * @param {Buffer} buf
     * @returns {number}
     */
    static _deserializeDouble(buf: Buffer): number;
    /**
     * Deserialize a "float" 4-byte floating point number.
     * @param {Buffer} buf
     * @returns {number}
     */
    static _deserializeFloat(buf: Buffer): number;
    /**
     * Deserialize a char array.
     * @param {Buffer} buf
     * @returns {Array<number>}
     */
    static _deserializeCharArray(buf: Buffer): number[];
    /**
     *
     * @param {Buffer} buf
     * @returns {number}
     */
    static deserializeWordBE(buf: Buffer): number;
    static deserializeDoubleBE(buf: Buffer): number;
    static deserializeFloatBE(buf: Buffer): number;
    static serializeWordBE(int16: number): Buffer;
    static serializeDoubleBE(double: number): Buffer;
    static serializeFloatBE(float: number): Buffer;
    static serializeStringBE(str: string): Buffer;
    /**
     * Serialize a string.
     * @param {string} str
     * @returns {Buffer}
     */
    toString(): string;
    /**
     * Deserialize a string.
     * @param {Buffer} buf
     * @returns {Array<number>}
     */
    static _deserializeString(buf: Buffer): number[];
    /**
     * Convert a char array to a string.
     * @param {Array<number>} charArray
     * @returns {string}
     */
    static _charArrayToString(charArray: number[]): string;
    /**
     * Deserialize a boolean.
     * @param {Buffer} buf
     * @returns {boolean}
     */
    static _deserializeBool(buf: Buffer): boolean;
    /**
     * Deserialize a byte.
     * @param {Buffer} buf
     * @returns {number}
     */
    static _deserializeByte(buf: Buffer): number;
    static verifyConnectionId(object: SerializedObject): void;
}
//# sourceMappingURL=SerializerBase.d.ts.map