/**
 * Converts a given timestamp in milliseconds to a 32-bit time value in seconds.
 *
 * @param timestamp - The timestamp in milliseconds.
 * @returns The converted time value in seconds.
 */
export function timestampToTime32T(timestamp: number): number {
    return Math.floor(timestamp / 1000);
}
