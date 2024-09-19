/**
 * Checks if a given number is zero.
 *
 * @param n - The number to check.
 * @returns `true` if the number is zero, `false` otherwise.
 */
export function isZero(n: number): boolean {
	// Return true if n is zero
	return n === 0;
}

/**
 * Checks if a value is undefined.
 *
 * @param n - The value to check.
 * @returns `true` if the value is undefined, `false` otherwise.
 */
export function isUndefined(n: unknown): boolean {
	// Return true if n is undefined
	return typeof n === "undefined";
}

/**
 * Compares two numbers and returns true if the first number is less than the second number.
 *
 * @param a - The first number to compare.
 * @param b - The second number to compare.
 * @returns True if `a` is less than `b`, otherwise false.
 */
export function lessThan(a: number, b: number): boolean {
	// Return true if a < b
	return a < b;
}
/**
 * Checks if the first number is less than or equal to the second number.
 *
 * @param a - The first number.
 * @param b - The second number.
 * @returns `true` if `a` is less than or equal to `b`, `false` otherwise.
 */
export function lessThanOrEqual(a: number, b: number): boolean {
	// Return true if a <= b
	return a <= b;
}
/**
 * Checks if the first number is greater than the second number.
 *
 * @param a - The first number.
 * @param b - The second number.
 * @returns `true` if `a` is greater than `b`, `false` otherwise.
 */
export function greaterThan(a: number, b: number): boolean {
	// Return true if a > b
	return a > b;
}

/**
 * Checks if the first number is greater than or equal to the second number.
 *
 * @param a - The first number to compare.
 * @param b - The second number to compare.
 * @returns `true` if `a` is greater than or equal to `b`, `false` otherwise.
 */
export function greaterThanOrEqual(a: number, b: number): boolean {
	// Return true if a >= b
	return a >= b;
}

/**
 * Checks if both numbers are zero.
 *
 * @param a - The first number.
 * @param b - The second number.
 * @returns True if both numbers are zero, false otherwise.
 */
export function areBothZero(a: number, b: number): boolean {
	// Return true if both a and b are zero
	return isZero(a) && isZero(b);
}

/**
 * Checks if both values are undefined.
 *
 * @param a - The first value to compare.
 * @param b - The second value to compare.
 * @returns True if both values are undefined, false otherwise.
 */
export function areBothUndefined(a: unknown, b: unknown): boolean {
	// Return true if both a and b are undefined
	return typeof a === "undefined" && typeof b === "undefined";
}

/**
 * Checks if both values are set.
 *
 * @param a - The first value to check.
 * @param b - The second value to check.
 * @returns True if both values are set, false otherwise.
 */
export function areBothSet(a: unknown, b: unknown): boolean {
	// Return true if both a and b are set
	return !isUndefined(a) && !isUndefined(b);
}

/**
 * Checks if only one of the two values is set.
 *
 * @param a - The first value to compare.
 * @param b - The second value to compare.
 * @returns True if only one of the values is set, false otherwise.
 */
export function isOnlyOneSet(a: unknown, b: unknown): boolean {
	// Return true if only one of a and b is set
	return !areBothSet(a, b) && (!isUndefined(a) || !isUndefined(b));
}
