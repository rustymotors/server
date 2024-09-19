// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017>  <Drazi Crendraven>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { createCipheriv, createDecipheriv, getCiphers } from "node:crypto";
import { McosEncryptionPair } from "rusty-motors-shared";

/**
 * This function creates a new encryption pair for use with the game server
 *
 * @param {string} key The key to use for encryption
 * @returns {McosEncryptionPair} The encryption pair
 */
export function createCommandEncryptionPair(key: string): McosEncryptionPair {
	if (key.length < 16) {
		throw Error("Key too short");
	}

	const sKey = key.slice(0, 16);

	// Deepcode ignore HardcodedSecret: This uses an empty IV
	const desIV = Buffer.alloc(8);

	const gsCipher = createCipheriv("des-cbc", Buffer.from(sKey, "hex"), desIV);
	gsCipher.setAutoPadding(false);

	const gsDecipher = createDecipheriv(
		"des-cbc",
		Buffer.from(sKey, "hex"),
		desIV,
	);
	gsDecipher.setAutoPadding(false);

	return new McosEncryptionPair(gsCipher, gsDecipher);
}

/**
 * This function creates a new encryption pair for use with the database server
 *
 * @param {string} key The key to use for encryption
 * @returns {McosEncryptionPair} The encryption pair
 * @throws Error if the key is too short
 */
export function createDataEncryptionPair(key: string): McosEncryptionPair {
	if (key.length < 16) {
		throw Error("Key too short");
	}

	const stringKey = Buffer.from(key, "hex");

	// File deepcode ignore InsecureCipher: RC4 is the encryption algorithum used here, file deepcode ignore HardcodedSecret: A blank IV is used here
	const tsCipher = createCipheriv("rc4", stringKey.subarray(0, 16), "");
	const tsDecipher = createDecipheriv("rc4", stringKey.subarray(0, 16), "");

	return new McosEncryptionPair(tsCipher, tsDecipher);
}

/**
 * This function checks if the server supports the legacy ciphers
 *
 * @returns void
 * @throws Error if the server does not support the legacy ciphers
 */
export function verifyLegacyCipherSupport() {
	const cipherList = getCiphers();
	if (!cipherList.includes("des-cbc") || !cipherList.includes("rc4")) {
		throw Error("Legacy ciphers not available");
	}
}
