/**
 * Serializes a raw string without length prefix
 * @param {string} string
 * @param {Buffer} targetBuffer
 * @param {number} offset
 * @param {number} length
 * @returns {number}
 */

export function serializeStringRaw(
    string: string,
    targetBuffer: Buffer,
    offset: number,
    length: number,
): number {
    const stringToWrite = string;
    targetBuffer.write(stringToWrite, offset, string.length, "utf8");
    offset += stringToWrite.length;
    return offset;
}
