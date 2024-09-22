/**
 * Writes a zero-terminated UTF-8 string to a buffer at the specified offset.
 *
 * @param buffer - The buffer to write the string to.
 * @param offset - The offset in the buffer to start writing the string.
 * @param value - The string to write to the buffer.
 * @returns The new offset after writing the string and the zero terminator.
 */
export function writeZeroTerminatedString(
	buffer: Buffer,
	offset: number,
	value: string,
): number {
	buffer.write(value, offset, value.length, "utf8");
	buffer.writeUInt8(0, offset + value.length);
	return offset + value.length + 1;
}
