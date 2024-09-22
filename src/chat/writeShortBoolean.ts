/**
 * Writes a boolean value to a buffer at the specified offset in big-endian format.
 *
 * @param buffer - The buffer to write to.
 * @param offset - The offset in the buffer where the boolean value should be written.
 * @param value - The boolean value to write. `true` will be written as 1, and `false` will be written as 0.
 */
export function writeShortBooleanBE(
	buffer: Buffer,
	offset: number,
	value: boolean,
): void {
	buffer.writeUInt16BE(value ? 1 : 0, offset);
}
