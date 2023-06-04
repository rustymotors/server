
export class Serializer {

    constructor() {
        /** @type {Array<SerializedValue>} */
        const fields = [];
        
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
     * @param {Array<SerializedValue>} fields
     * @returns {Buffer}
     */ 
    serialize(fields) {
        let buf = Buffer.alloc(0);
        for (const field of fields) {
            buf = Buffer.concat([buf, this.serializeField(field)]);
        }
        return buf;
    }

    /**
     * 
     * @param {SerializedValue} field
     * @param {number} type
     * @returns {Buffer}
     */ 
    serializeField(field, type) {
        throw new Error("Method not implemented.");
    }

    /**
     * 
     * @param {Buffer} buf
     * @returns {Array<SerializedValue>}
     */  
    deserialize(buf) {
        throw new Error("Method not implemented.");
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
        const double = buf.readDoubleLE();
        return double;
    }

    /**
     * 
     * @param {Buffer} buf
     * @returns {number}
     */ 
    deserializeQuad(buf) {
        const quad = buf.readInt32LE();
        return quad;
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
        const bytes = buf.slice(2, 2 + len);
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
}
export class SerializedValue {
    /**
     * 
     * @param {string} name
     * @param {number} type
     * @param {any} value
     */ 
    constructor(name, type, value) {
        this.name = name;
        this.type = type;
        this.value = value;
    }
}

export class MessageNode extends Serializer {
}

