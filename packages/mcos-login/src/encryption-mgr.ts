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

import {
    createDecipheriv,
    createCipheriv,
    randomUUID,
    Decipher,
    Cipher,
} from "node:crypto";

/**
 * Handles the management of the encryption and decryption
 * of the TCP connections
 * @module EncryptionMgr
 */

/**
 * @class
 * @property {string} id
 * @property {Buffer} sessionkey
 * @property {Decipher} in
 * @property {Cipher} out
 */
export class EncryptionManager {
    /**
     *
     *
     * @type {string}
     * @memberof EncryptionManager
     */
    id: string;
    /**
     *
     *
     * @type {Buffer}
     * @memberof EncryptionManager
     */
    sessionkey: Buffer;
    /**
     *
     *
     * @type {iDecipher | undefined}
     * @memberof EncryptionManager
     */
    in: Decipher | undefined;
    /**
     *
     *
     * @type {(Cipher | undefined)}
     * @memberof EncryptionManager
     */
    out: Cipher | undefined;

    /**
     * Creates an instance of EncryptionManager.
     * @memberof EncryptionManager
     */
    constructor() {
        this.id = randomUUID();
        this.sessionkey = Buffer.alloc(0);
        this.in = undefined;
        this.out = undefined;
    }

    /**
     * Set the internal sessionkey
     *
     * @param {Buffer} sessionkey
     * @return {boolean}
     */
    setEncryptionKey(sessionkey: Buffer): boolean {
        this.sessionkey = sessionkey;
        // File deepcode ignore InsecureCipher: RC4 is the encryption algorithum used here, file deepcode ignore HardcodedSecret: A blank IV is used here
        this.in = createDecipheriv("rc4", sessionkey, "");
        this.out = createCipheriv("rc4", sessionkey, "");
        return true;
    }

    /**
     * Takes cyphertext and returns plaintext
     *
     * @param {Buffer} encryptedText
     * @return {Buffer}
     * @memberof EncryptionMgr
     */
    decrypt(encryptedText: Buffer): Buffer {
        if (this.in === undefined) {
            throw new Error("No decryption manager found!");
        }

        return Buffer.from(this.in.update(encryptedText));
    }

    /**
     * Encrypt plaintext and return the ciphertext
     *
     * @param {Buffer} plainText
     * @return {Buffer}
     * @memberof EncryptionMgr
     */
    encrypt(plainText: Buffer): Buffer {
        if (this.out === undefined) {
            throw new Error("No encryption manager found!");
        }

        return Buffer.from(
            this.out.update(plainText.toString(), "binary", "hex"),
            "hex"
        );
    }

    /**
     *
     * @return {string}
     */
    _getSessionKey(): string {
        return this.sessionkey.toString("hex");
    }

    /**
     * GetId
     *
     * @return {string}
     */
    getId(): string {
        return this.id;
    }
}
