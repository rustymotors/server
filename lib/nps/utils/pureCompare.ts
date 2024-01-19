export function isZero(n: number): boolean {
    // Return true if n is zero
    return n === 0;
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
