export function getAsHex(bytes: Buffer): string {
	const hexString = bytes.toString("hex");
	return hexString.length % 2 === 0 ? hexString : `0${hexString}`;
}
