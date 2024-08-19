
export function now32(): number {
    return Math.floor(Date.now() / 1000);
}

export function to64BitTime(time: number): number {
    return time * 1000;
}
