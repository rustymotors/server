export function getAsHex(bytes: Buffer): string {
    return bytes.length % 2 === 0
        ? bytes.toString("hex")
        : bytes.toString("hex") + "0";
}
