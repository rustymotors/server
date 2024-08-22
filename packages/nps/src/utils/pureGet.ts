import { greaterThanOrEqual } from "./pureCompare.js";

/**
 * Retrieves a word from a buffer at the specified offset.
 * 
 * @param bytes - The buffer containing the word.
 * @param offset - The offset at which to retrieve the word.
 * @param isLE - Indicates whether the word is in little-endian format.
 * @returns The word retrieved from the buffer.
 */
export function getWord(bytes: Buffer, offset: number, isLE: boolean): number {
	// Get the word at the offset
	return isLE ? bytes.readUInt16LE(offset) : bytes.readUInt16BE(offset);
}

/**
 * Retrieves a dword from the given buffer at the specified offset.
 * 
 * @param bytes - The buffer containing the dword.
 * @param offset - The offset at which the dword is located.
 * @param isLE - Indicates whether the buffer is in little-endian format.
 * @returns The retrieved dword.
 */
export function getDWord(bytes: Buffer, offset: number, isLE: boolean): number {
	// Get the dword at the offset
	return isLE ? bytes.readUInt32LE(offset) : bytes.readUInt32BE(offset);
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

/**
 * Converts a buffer of bytes to a hexadecimal string representation.
 * If the number of hex characters is odd, a leading zero is added.
 *
 * @param bytes - The buffer of bytes to convert.
 * @returns The hexadecimal string representation of the buffer.
 */
export function getAsHex(bytes: Buffer): string {
	// Convert the buffer to a hexadecimal string
	const hex = bytes.toString("hex");
	return hex.length % 2 === 0 ? hex : `0${hex}`;
}

/**
 * Retrieves a string from a buffer based on the given offset and length.
 *
 * @param bytes - The buffer containing the string.
 * @param offset - The starting position of the string in the buffer.
 * @param isLE - A boolean indicating whether the buffer is in little-endian format.
 * @returns The extracted string.
 */
export function getLenString(
	bytes: Buffer,
	offset: number,
	isLE: boolean,
): string {
	// Get the length of the string
	const strLen = getWord(bytes, offset, isLE);

	// Get the string
	return bytes.subarray(offset + 2, offset + 2 + strLen).toString("utf8");
}

/**
 * Retrieves a blob from a buffer based on the given offset and length.
 *
 * @param bytes - The buffer containing the blob.
 * @param offset - The starting offset of the blob in the buffer.
 * @param isLE - A boolean indicating whether the buffer is in little-endian format.
 * @returns The extracted blob as a new buffer.
 */
export function getLenBlob(
	bytes: Buffer,
	offset: number,
	isLE: boolean,
): Buffer {
	// Get the length of the blob
	const blobLen = getDWord(bytes, offset, isLE);

	// Get the blob
	return bytes.subarray(offset + 2, offset + 2 + blobLen);
}

/**
 * Retrieves a 2-byte boolean value from the specified buffer at the given offset.
 *
 * @param bytes - The buffer containing the boolean value.
 * @param offset - The offset at which the boolean value is located in the buffer.
 * @returns The boolean value retrieved from the buffer.
 */
export function getShortBool(bytes: Buffer, offset: number): boolean {
	// Get a 2 byte boolean
	return bytes.readUInt16LE(offset) === 1;
}
