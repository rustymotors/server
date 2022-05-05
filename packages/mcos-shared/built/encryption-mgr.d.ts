/**
 * Handles the management of the encryption and decryption
 * of the TCP connections
 * @module EncryptionMgr
 */
/**
 * @class
 * @property {string} id
 * @property {Buffer} sessionkey
 * @property {import("node:crypto").Decipher} in
 * @property {import("node:crypto").Cipher} out
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
     * @type {import("node:crypto").Decipher | undefined}
     * @memberof EncryptionManager
     */
    in: import("node:crypto").Decipher | undefined;
    /**
     *
     *
     * @type {(import("node:crypto").Cipher | undefined)}
     * @memberof EncryptionManager
     */
    out: (import("node:crypto").Cipher | undefined);
    /**
     * Set the internal sessionkey
     *
     * @param {Buffer} sessionkey
     * @return {boolean}
     */
    setEncryptionKey(sessionkey: Buffer): boolean;
    /**
     * Takes cyphertext and returns plaintext
     *
     * @param {Buffer} encryptedText
     * @return {Buffer}
     * @memberof EncryptionMgr
     */
    decrypt(encryptedText: Buffer): Buffer;
    /**
     * Encrypt plaintext and return the ciphertext
     *
     * @param {Buffer} plainText
     * @return {Buffer}
     * @memberof EncryptionMgr
     */
    encrypt(plainText: Buffer): Buffer;
    /**
     *
     * @return {string}
     */
    _getSessionKey(): string;
    /**
     * GetId
     *
     * @return {string}
     */
    getId(): string;
}
//# sourceMappingURL=encryption-mgr.d.ts.map