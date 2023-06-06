export class Serializer {
    constructor() {
        /** @type {Array<SerializedValue>} */
        this.fields = [];
    }

    /**
     *
     * @param {string} str
     * @returns {Buffer}
     */
    serializeString(str) {
        const len = str.length;
        const buf = Buffer.alloc(2 + len);
        buf.writeUInt16LE(len);
        buf.write(str, 2);
        return buf;
    }

    /**
     *
     * @param {number} int16
     * @returns {Buffer}
     */
    serializeWord(int16) {
        const buf = Buffer.alloc(2);
        buf.writeInt16LE(int16);
        return buf;
    }

    /**
     *
     * @param {number} double
     * @returns {Buffer}
     */
    serializeDouble(double) {
        const buf = Buffer.alloc(8);
        buf.writeDoubleLE(double);
        return buf;
    }

    /**
     *
     * @param {number} int32
     * @returns {Buffer}
     */
    serializeQuad(int32) {
        const buf = Buffer.alloc(4);
        buf.writeInt32LE(int32);
        return buf;
    }

    /**
     *
     * @param {number} float
     * @returns {Buffer}
     */
    serializeFloat(float) {
        const buf = Buffer.alloc(4);
        buf.writeFloatLE(float);
        return buf;
    }

    /**
     *
     * @param {boolean} bool
     * @returns {Buffer}
     */
    serializeBool(bool) {
        const buf = Buffer.alloc(1);
        buf.writeUInt8(bool ? 1 : 0);
        return buf;
    }

    /**
     *
     * @param {number} byte
     * @returns {Buffer}
     */
    serializeByte(byte) {
        const buf = Buffer.alloc(1);
        buf.writeUInt8(byte);
        return buf;
    }

    /**
     *
     * @param {Buffer} bytes
     * @returns {Buffer}
     */
    serializeBytes(bytes) {
        const len = bytes.length;
        const buf = Buffer.alloc(2 + len);
        buf.writeUInt16LE(len);
        bytes.copy(buf, 2);
        return buf;
    }

    /**
     *
     * @returns {Buffer}
     */
    serialize() {
        let buf = Buffer.alloc(0);
        for (const field of this.fields) {
            buf = Buffer.concat([buf, this.serializeField(field)]);
        }
        return buf;
    }

    /**
     *
     * @param {SerializedValue} field
     * @returns {Buffer}
     */
    serializeField(field) {
        let buf = Buffer.alloc(0);
        buf = Buffer.concat([buf, field.serializer(field)]);
        return buf;
    }

    /**
     *
     * @param {Buffer} buf
     */
    deserialize(buf) {
        throw new Error("Method should be overridden.");
    }

    /**
     *
     * @param {Buffer} buf
     * @returns {string}
     */
    deserializeString(buf) {
        const len = buf.readUInt16LE();
        const str = buf.toString("utf8", 2, 2 + len);
        return str;
    }

    /**
     *
     * @param {Buffer} buf
     * @returns {number}
     */
    deserializeWord(buf) {
        const word = buf.readInt16LE();
        return word;
    }

    /**
     *
     * @param {Buffer} buf
     * @returns {number}
     */
    deserializeDouble(buf) {
        const double = buf.readInt32LE();
        return double;
    }

    /**
     *
     * @param {Buffer} buf
     * @returns {number}
     */
    deserializeFloat(buf) {
        const float = buf.readFloatLE();
        return float;
    }

    /**
     *
     * @param {Buffer} buf
     * @returns {boolean}
     */
    deserializeBool(buf) {
        const bool = buf.readUInt8() === 1;
        return bool;
    }

    /**
     *
     * @param {Buffer} buf
     * @returns {number}
     */
    deserializeByte(buf) {
        const byte = buf.readUInt8();
        return byte;
    }

    /**
     *
     * @param {Buffer} buf
     * @returns {Buffer}
     */
    deserializeBytes(buf) {
        const len = buf.readUInt16LE();
        const bytes = buf.subarray(2, 2 + len);
        return bytes;
    }

    /**
     *
     * @param {Buffer} buf
     * @param {Function} deserializer
     * @returns {Array<any>}
     */
    deserializeArray(buf, deserializer) {
        const len = buf.readUInt16LE();
        const arr = [];
        for (let i = 0; i < len; i++) {
            arr.push(deserializer(buf));
        }
        return arr;
    }

    /**
     * 
     * @param {Buffer} buf
     * @returns {Array<number>}
     */ 
    deserializeCharArray(buf) {
        const len = buf.readUInt16LE();
        const arr = [];
        for (let i = 0; i < len; i++) {
            arr.push(buf.readUInt8());
        }
        return arr;
    }

    /**
     * 
     * @param {Array<number>} charArray
     * @returns {string}
     */ 
    charArrayToString(charArray) {
        let str = "";
        for (const char of charArray) {
            str += String.fromCharCode(char);
        }
        return str;
    }

    /**
     *
     * @param {string} name
     * @returns {SerializedValue}
     */
    findField(name) {
        const field = this.fields.find((field) => {
            return field.name === name;
        });
        if (field === undefined) {
            throw new Error(`Field ${name} not found.`);
        }
        return field;
    }

    toString() {
        let str = "";
        for (const field of this.fields) {
            str += `${field.name}: ${field.value}\n`;
        }
        return str;
    }
}

export class SerializedValue {
    /**
     *
     * @param {string} name
     * @param {Function} serializer
     * @param {any} value
     */
    constructor(name, serializer, value) {
        this.name = name;
        this.serializer = serializer;
        this.value = value;
    }
}

export class MessageHeader extends Serializer {
    constructor() {
        super();
        this.fields = [
            new SerializedValue("length", this.deserializeWord, 0),
            new SerializedValue("signature", this.deserializeSignature, 0),
        ];
    }

    /**
     *
     * @param {Buffer} buf
     */
    deserialize(buf) {
        this.findField("length").value = this.deserializeWord(
            buf.subarray(0, 2)
        );
        this.findField("signature").value = this.deserializeSignature(
            buf.subarray(2, 6)
        );
    }

    /**
     * 
     * @param {Buffer} buf 
     */
    deserializeSignature(buf) {
        const length = 4;
        let signature = "";
        for (let i = 0; i < length; i++) {
            signature += String.fromCharCode(buf.readUInt8(i));
        }
        return signature;
    }
   
}

export class MessageNode extends Serializer {
    /**
     *
     * @param {Buffer} buf
     */
    constructor(buf) {
        super();
        this.toFrom = 0;
        this.appID = 0;

        this.header = null;
        this.sequence = 0;
        this.flags = 0;
    }

    /**
     *
     * @param {MessageNode} sourceNode
     * @returns {MessageNode}
     */
    static from(sourceNode) {
        const node = new MessageNode(sourceNode.serialize());
        node.toFrom = sourceNode.toFrom;
        node.sequence = sourceNode.sequence;
        return node;
    }

    /**
     *
     * @param {Buffer} buf
     */
    deserialize(buf) {
        this.header = new MessageHeader();
        this.header.deserialize(buf.subarray(0, 6));
        this.sequence = this.deserializeWord(buf.subarray(6, 8));
        this.flags = this.deserializeByte(buf.subarray(8, 9));
    }

    toString() {
        if (this.header === null) {
            return "MessageNode: header is null.";
        }
        return `MessageNode: toFrom: ${this.toFrom}, appID: ${
            this.appID
        }, sequence: ${this.sequence}, flags: ${
            this.flags
        }, header: ${this.header.toString()}`;
    }
}
