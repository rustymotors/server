import { ServerError } from "./errors/ServerError.js";

export class SerializerBase {
    serializeSize() {
        return 4;
    }
    // Little Endian (LE) methods for serialization and deserialization.

    /**
     * Serialize a string.
     * @param {string} str
     * @returns {Buffer}
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
     * @returns {number[]}
     */
    static _deserializeCharArray(buf: Buffer): number[] {
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

    /**
     * Deserialize a "double" long 4-byte integer.
     * @param {Buffer} buf
     * @returns {number}
     */
    static deserializeDoubleBE(buf: Buffer): number {
        return buf.readDoubleBE(0);
    }

    /**
     * Deserialize a "float" 4-byte floating point number.
     * @param {Buffer} buf
     * @returns {number}
     */
    static deserializeFloatBE(buf: Buffer): number {
        return buf.readFloatBE(0);
    }

    /**
     * Serialize a "word" short 2-byte integer.
     * @param {number} int16
     * @returns {Buffer}
     */
    static serializeWordBE(int16: number): Buffer {
        const buf = Buffer.alloc(2);
        buf.writeUInt16BE(int16);
        return buf;
    }

    /**
     * Serialize a "double" long 4-byte integer.
     * @param {number} double
     * @returns {Buffer}
     */
    static serializeDoubleBE(double: number): Buffer {
        const buf = Buffer.alloc(8);
        buf.writeDoubleBE(double);
        return buf;
    }

    /**
     * Serialize a "float" 4-byte floating point number.
     * @param {number} float
     * @returns {Buffer}
     */
    static serializeFloatBE(float: number): Buffer {
        const buf = Buffer.alloc(4);
        buf.writeFloatBE(float);
        return buf;
    }

    /**
     * Serialize a string.
     * @param {string} str
     * @returns {Buffer}
     */
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
     * Deserialize a string.
     * @param {Buffer} buf
     * @returns {Array<number>}
     */
    static _deserializeString(buf: Buffer): Array<number> {
        return SerializerBase._deserializeCharArray(buf);
    }

    /**
     * Convert a char array to a string.
     * @param {number[]} charArray
     * @returns {string}
     */
    static _charArrayToString(charArray: number[]): string {
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

    /**
     * Verify that an object has a connectionId property.
     * @param {module:interfaces.SerializedObject} object
     * @throws {ServerError} if the object does not have a connectionId property
     */
    static verifyConnectionId(object: Object) {
        if (!Object.prototype.hasOwnProperty.call(object, "connectionId")) {
            throw new ServerError(
                "Object does not have a connectionId property",
            );
        }
    }
}
