/**
 * Handles the management of the encryption and decryption
 * of the TCP connections
 * @module EncryptionMgr
 */
/**
 * @class
 * @property {string} id
 * @property {Buffer} sessionkey
 * @property {crypto.Decipher | undefined} in
 * @property {crypty.Cipher | undefined} out
 */
export class EncryptionManager {
    id: string;
    sessionkey: Buffer;
    in: any;
    out: any;
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
     */
    decrypt(encryptedText: Buffer): Buffer;
    /**
     * Encrypt plaintext and return the ciphertext
     *
     * @param {Buffer} plainText
     * @return {Buffer}
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
