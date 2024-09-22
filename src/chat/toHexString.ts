/**
 * Converts a Buffer to a hexadecimal string representation.
 *
 * @param buffer - The Buffer to be converted.
 * @returns The hexadecimal string representation of the buffer.
 */
export function bufferToHexString(buffer: Buffer): string {
	return buffer.reduce(
		(str, byte) => str + byte.toString(16).padStart(2, "0"),
		"",
	);
}
