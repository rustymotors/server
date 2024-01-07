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
