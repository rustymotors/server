/**
 * Reads a string from a buffer.
 * 
 * @param data - The buffer containing the string.
 * @param start - The starting index of the string in the buffer.
 * @param end - The ending index of the string in the buffer.
 * @returns The extracted string from the buffer.
 */
export function readStringFromBuffer(
    data: Buffer,
    start: number,
    end: number,
): string {
    return data.toString("ascii", start, end).replace(/\0/g, "");
}
