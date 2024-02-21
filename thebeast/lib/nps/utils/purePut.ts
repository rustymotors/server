export function put16(
    bytes: Buffer,
    offset: number,
    word: number,
    isLE: boolean,
): Buffer {
    // Put the word at the offset
    if (isLE) {
        bytes.writeUInt16LE(word, offset);
    } else {
        bytes.writeUInt16BE(word, offset);
    }
    return bytes;
}

export function put8(bytes: Buffer, offset: number, byte: number): Buffer {
    // Put the byte at the offset
    bytes.writeUInt8(byte, offset);
    return bytes;
}

export function put16BE(bytes: Buffer, offset: number, word: number): Buffer {
    return put16(bytes, offset, word, false);
}

export function put16LE(bytes: Buffer, offset: number, word: number): Buffer {
    return put16(bytes, offset, word, true);
}

export function put32(
    bytes: Buffer,
    offset: number,
    word: number,
    isLE: boolean,
): Buffer {
    // Put the word at the offset
    if (isLE) {
        bytes.writeUInt32LE(word, offset);
    } else {
        bytes.writeUInt32BE(word, offset);
    }
    return bytes;
}

export function put32BE(bytes: Buffer, offset: number, word: number): Buffer {
    return put32(bytes, offset, word, false);
}

export function put32LE(bytes: Buffer, offset: number, word: number): Buffer {
    return put32(bytes, offset, word, true);
}

export function putLenString(
    bytes: Buffer,
    offset: number,
    str: string,
    isLE: boolean,
): Buffer {
    // Get the length of the string
    const strLen = str.length + 1;

    // Put the length of the string
    if (isLE) {
        bytes.writeUInt32LE(strLen, offset);
    } else {
        bytes.writeUInt32BE(strLen, offset);
    }

    // Put the string
    bytes.write(str.concat("\0"), offset + 4, strLen, "utf8");

    return bytes;
}

export function putLenBlob(
    bytes: Buffer,
    offset: number,
    blob: Buffer,
    isLE: boolean,
): Buffer {
    // Get the length of the blob
    const blobLen = blob.length;

    // Put the length of the blob
    if (isLE) {
        bytes.writeUInt32LE(blobLen, offset);
    } else {
        bytes.writeUInt32BE(blobLen, offset);
    }

    // Put the blob
    blob.copy(bytes, offset + 4);

    return bytes;
}

export function putShortBool(
    bytes: Buffer,
    offset: number,
    bool: boolean,
): Buffer {
    // Put a 2 byte boolean
    bytes.writeUInt16LE(bool ? 1 : 0, offset);
    return bytes;
}
