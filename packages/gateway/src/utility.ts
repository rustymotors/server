/**
 * Splits a buffer into an array of packets using a specified separator buffer.
 *
 * Returns an array of buffer slices separated by {@link separator}. Throws an error if the separator is empty, found at the end of the buffer, or if multiple consecutive separators are present.
 *
 * @param data - The buffer to split.
 * @param separator - The buffer used as the separator between packets.
 * @returns An array of buffer packets split by the separator.
 *
 * @throws {Error} If {@link separator} is empty.
 * @throws {Error} If {@link separator} is found at the end of {@link data}.
 * @throws {Error} If multiple consecutive separators are found in {@link data}.
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
