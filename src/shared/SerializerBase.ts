import { ServerError } from "./errors/ServerError.js";
import { ISerializedObject } from "./interfaces.js";

export class SerializerBase implements ISerializedObject {
    deserialize(inputBuffer: Buffer): SerializerBase {
        throw new Error("Method not implemented.");
    }
    serialize(): Buffer {
        throw new Error("Method not implemented.");
    }
    serializeSize(): number {
        return 4
    }
    // Little Endian (LE) methods for serialization and deserialization.

    /**
     * Serialize a string.
     */
    static _serializeString(str: string): Buffer {
        const len = str.length;
        const buf = Buffer.alloc(2 + len);
        buf.writeUInt16LE(len);
        buf.write(str, 2);
        return buf;
    }

    /**
     * Serialize a "word" short 2-byte integer.
     * @param {number} int16
     * @returns {Buffer}
     */
    static _serializeWord(int16: number): Buffer {
        const buf = Buffer.alloc(2);
        buf.writeInt16LE(int16);
        return buf;
    }

    /**
     * Serialize a "double" long 4-byte integer.
     * @param {number} double
     * @returns {Buffer}
     */
    static _serializeDouble(double: number): Buffer {
        const buf = Buffer.alloc(8);
        buf.writeDoubleLE(double);
        return buf;
    }

    /**
     *
     * Serialize a "float" 4-byte floating point number.
     * @param {number} float
     * @returns {Buffer}
     */
    static _serializeFloat(float: number): Buffer {
        const buf = Buffer.alloc(4);
        buf.writeFloatLE(float);
        return buf;
    }

    /**
     * Serialize a boolean.
     * @param {boolean} bool
     * @returns {Buffer}
     */
    static _serializeBool(bool: boolean): Buffer {
        const buf = Buffer.alloc(1);
        buf.writeUInt8(bool ? 1 : 0);
        return buf;
    }

    /**
     * Serialize a byte.
     * @param {number} byte
     * @returns {Buffer}
     */
    static _serializeByte(byte: number): Buffer {
        const buf = Buffer.alloc(1);
        buf.writeUInt8(byte);
        return buf;
    }

    /**
     * Deserialize a "word" short 2-byte integer.
     * @param {Buffer} buf
     * @returns {number}
     */
    static _deserializeWord(buf: Buffer): number {
        const word = buf.readInt16LE();
        return word;
    }

    /**
     * Deserialize a "double" long 4-byte integer.
     * @param {Buffer} buf
     * @returns {number}
     */
    static _deserializeDouble(buf: Buffer): number {
        const double = buf.readInt32LE();
        return double;
    }

    /**
     * Deserialize a "float" 4-byte floating point number.
     * @param {Buffer} buf
     * @returns {number}
     */
    static _deserializeFloat(buf: Buffer): number {
        const float = buf.readFloatLE();
        return float;
    }

    /**
     * Deserialize a char array.
     * @param {Buffer} buf
     * @returns {Array<number>}
     */
    static _deserializeCharArray(buf: Buffer): Array<number> {
        const len = buf.readUInt16LE();
        const arr = [];
        for (let i = 0; i < len; i++) {
            arr.push(buf.readUInt8());
        }
        return arr;
    }

    // ===
    // Big Endian (BE) methods for serialization and deserialization.
    // ===

    /**
     *
     * @param {Buffer} buf
     * @returns {number}
     */
    static deserializeWordBE(buf: Buffer): number {
        return buf.readUInt16BE(0);
    }

    static deserializeDoubleBE(buf: Buffer): number {
        return buf.readDoubleBE(0);
    }

    static deserializeFloatBE(buf: Buffer): number {
        return buf.readFloatBE(0);
    }

    static serializeWordBE(int16: number): Buffer {
        const buf = Buffer.alloc(2);
        buf.writeUInt16BE(int16);
        return buf;
    }

    static serializeDoubleBE(double: number): Buffer {
        const buf = Buffer.alloc(8);
        buf.writeDoubleBE(double);
        return buf;
    }

    static serializeFloatBE(float: number): Buffer {
        const buf = Buffer.alloc(4);
        buf.writeFloatBE(float);
        return buf;
    }

    static serializeStringBE(str: string): Buffer {
        const len = str.length;
        const buf = Buffer.alloc(2 + len);
        buf.writeUInt16BE(len);
        buf.write(str, 2);
        return buf;
    }

    // ===
    // Common methods for serialization and deserialization.
    // ===

    /**
     * Serialize a string.
     * @param {string} str
     * @returns {Buffer}
     */
    toString(): string {
        throw new Error("Method not implemented.");
    }

    /**
     * Deserialize a string.
     * @param {Buffer} buf
     * @returns {Array<number>}
     */
    static _deserializeString(buf: Buffer): Array<number> {
        return SerializerBase._deserializeCharArray(buf);
    }

    /**
     * Convert a char array to a string.
     * @param {Array<number>} charArray
     * @returns {string}
     */
    static _charArrayToString(charArray: Array<number>): string {
        let str = "";
        for (const char of charArray) {
            str += String.fromCharCode(char);
        }
        return str;
    }

    /**
     * Deserialize a boolean.
     * @param {Buffer} buf
     * @returns {boolean}
     */
    static _deserializeBool(buf: Buffer): boolean {
        const bool = buf.readUInt8() === 1;
        return bool;
    }

    /**
     * Deserialize a byte.
     * @param {Buffer} buf
     * @returns {number}
     */
    static _deserializeByte(buf: Buffer): number {
        const byte = buf.readUInt8();
        return byte;
    }

    // ===
    // Utility methods.
    // ===

    static verifyConnectionId(object: ISerializedObject): void {
        if (!Object.prototype.hasOwnProperty.call(object, "connectionId")) {
            throw new ServerError(
                "Object does not have a connectionId property"
            );
        }
    }
}
