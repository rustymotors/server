/**
 * Convert to zero padded hex
 *
 * @export
 * @param {Buffer} data
 * @return {string}
 */

export function toHex(data) {
	/** @type {string[]} */
	const bytes = [];
	data.forEach((b) => {
		bytes.push(b.toString(16).toUpperCase().padStart(2, "0"));
	});
	return bytes.join("");
}
