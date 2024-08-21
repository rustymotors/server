export function isZero(n: number): boolean {
	// Return true if n is zero
	return n === 0;
}

export function isUndefined(n: unknown): boolean {
	// Return true if n is undefined
	return typeof n === "undefined";
}

export function lessThan(a: number, b: number): boolean {
	// Return true if a < b
	return a < b;
}
export function lessThanOrEqual(a: number, b: number): boolean {
	// Return true if a <= b
	return a <= b;
}
export function greaterThan(a: number, b: number): boolean {
	// Return true if a > b
	return a > b;
}

export function greaterThanOrEqual(a: number, b: number): boolean {
	// Return true if a >= b
	return a >= b;
}

export function areBothZero(a: number, b: number): boolean {
	// Return true if both a and b are zero
	return isZero(a) && isZero(b);
}

export function areBothUndefined(a: unknown, b: unknown): boolean {
	// Return true if both a and b are undefined
	return typeof a === "undefined" && typeof b === "undefined";
}

export function areBothSet(a: unknown, b: unknown): boolean {
	// Return true if both a and b are set
	return !isUndefined(a) && !isUndefined(b);
}

export function isOnlyOneSet(a: unknown, b: unknown): boolean {
	// Return true if only one of a and b is set
	return !areBothSet(a, b) && (!isUndefined(a) || !isUndefined(b));
}
