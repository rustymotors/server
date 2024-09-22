/**
 * Asserts that the actual length matches the expected length.
 * 
 * @param actualLength - The actual length to be checked.
 * @param expectedLength - The expected length to compare against.
 * @throws {Error} Throws an error if the actual length does not match the expected length.
 */
export function assertLength(actualLength: number, expectedLength: number): void {
    if (actualLength !== expectedLength) {
        throw new Error(
            `Expected length ${expectedLength}, but got ${actualLength}`,
        );
    }
}
