export function serializeBool(bool: boolean) {
    const buf = Buffer.alloc(1);

    buf.writeUInt8(bool ? 1 : 0);

    return buf;
}
    
export function serializeByte(byte: number) {
    const buf = Buffer.alloc(1);

    buf.writeUInt8(byte);

    return buf;
}

export function serializeWord(word: number) {
    const buf = Buffer.alloc(2);

    buf.writeUInt16BE(word);

    return buf;
}

export function serializeDWord(dword: number) {
    const buf = Buffer.alloc(4);

    buf.writeUInt32BE(dword);

    return buf;
}

export function serializeFloat(f: number) {
    const buf = Buffer.alloc(4);

    buf.writeFloatBE(f);

    return buf;
}

/**
 * Serializes a string to a buffer. The buffer will be prefixed with the length of the string.
 */ 
export function serializeString(str: string) {
    const buf = Buffer.alloc(str.length + 2);

    buf.writeUInt16BE(str.length);
    buf.write(str, 2);

    return buf;
}

export function deserializeBool(buff: Buffer) {
    return buff.readUInt8() === 1;
}

export function deserializeByte(buff: Buffer) {
    return buff.readUInt8();
}

export function deserializeWord(buff: Buffer) {
    return buff.readUInt16BE();
}

export function deserializeDWord(buff: Buffer) {
    return buff.readUInt32BE();
}

export function deserializeFloat(buff: Buffer) {
    return buff.readFloatBE();
}

/**
 * Deserializes a string from a buffer. The buffer is expected to be prefixed with the length of the string.
 */
export function deserializeString(buf: Buffer) {
    const size = buf.readUInt16BE();
    if (size > buf.length - 2) {
        throw new Error("Size is bigger than the buffer length - 2");
    }
    const str = buf.toString("utf8", 2);

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

export function sizeOfString(string: string) {
    return string.length + 2;
}