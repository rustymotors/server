import { getCiphers } from "node:crypto";

/**
 * This function checks if the server supports the legacy ciphers
 *
 * @returns void
 * @throws Error if the server does not support the legacy ciphers
 */

export function ensureLegacyCipherCompatibility() {
	const cipherList = getCiphers();
	if (!cipherList.includes("des-cbc") || !cipherList.includes("rc4")) {
		throw new Error("Legacy ciphers not available");
	}
}
