
export interface ISerializedObject {
    serialize(): Buffer;
    serializeSize(): number;
}

export class SerializerBase {

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

    /**
     * Deserialize a string.
     * @param {Buffer} buf
     * @returns {Array<number>}
     */
    static _deserializeString(buf: Buffer): Array<number> {
        return SerializerBase._deserializeCharArray(buf);
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
}
