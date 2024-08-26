/**
 * Serializes a string with length prefix
 * @param {string} string
 * @param {Buffer} targetBuffer
 * @param {number} offset
 * @returns {number}
 */

export function serializeString(
    string: string,
    targetBuffer: Buffer,
    offset: number,
): number {
    const buffer = Buffer.alloc(4 + string.length + 1);
    buffer.writeInt32BE(string.length + 1, 0);
    const stringToWrite = string + "\0";
    buffer.write(stringToWrite, 4, stringToWrite.length, "utf8");
    buffer.copy(targetBuffer, offset);
    offset += buffer.length;
    return offset;
}
