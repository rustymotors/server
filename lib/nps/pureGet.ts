import { greaterThanOrEqual } from "./pureCompare.js";

export function getWord(bytes: Buffer, offset: number, isLE: boolean): number {
    // Get the word at the offset
    return isLE ? bytes.readUInt16LE(offset) : bytes.readUInt16BE(offset);
}

/**
 * Get the first n bytes of a buffer.
 * If the buffer is shorter than n bytes, return the whole buffer
 */
export function getNBytes(bytes: Buffer, n: number): Buffer {
    const bufferLength = bytes.length;

    const cutLength = greaterThanOrEqual(bufferLength, n) ? n : bufferLength;

    // Get the first n bytes
    return bytes.subarray(0, cutLength);
}

export function getAsHex(bytes: Buffer): string {
    return bytes.length % 2 === 0
        ? bytes.toString("hex")
        : bytes.toString("hex") + "0";
}
