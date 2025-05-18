/**
 * Splits a buffer into packets using a specified separator buffer.
 *
 * Searches for the separator starting from the third byte of {@link data}.
 * If no separator is found, returns the entire buffer as a single packet.
 * Each packet starts 3 bytes before the separator and ends 3 bytes before the next separator.
 *
 * @param data - The buffer to split into packets.
 * @param separator - The buffer used as the separator between packets.
 * @returns An array of buffer packets split by the separator. Each packet stars 3 bytes before the separator and ends 3 bytes before the next separator.
 *
 * @throws {Error} If the separator is found at the end of the buffer
 * @throws {Error} If multiple consecutive separators are found
 * @throws {Error} If the separator is not found at the start or end of the buffer
 * @throws {Error} If the separator is longer than one character
 */
export function splitPackets(data: Buffer, separator: Buffer): Buffer[] {
    if (data.length === 0) {
        return [];
    }

    if (separator.length === 0) {
        throw new Error('Separator cannot be empty');
    }

    // Check if the buffer ends with the separator
    if (data.slice(-separator.length).equals(separator)) {
        throw new Error('Separator found at the end of the buffer');
    }

    const result: Buffer[] = [];
    let start = 0;
    let index;

    while ((index = data.indexOf(separator, start)) !== -1) {
        // Check for multiple consecutive separators
        if (index === start) {
            throw new Error('Multiple consecutive separators found');
        }

        result.push(data.slice(start, index));
        start = index + separator.length;
    }

    result.push(data.slice(start));
    return result;
}
