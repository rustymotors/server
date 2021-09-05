/// <reference types="node" />
/**
 * Handles the management of the encryption and decryption
 * of the TCP connections
 */
/**
 * @class
 * @property {string} id
 * @property {Buffer} sessionkey
 * @property {crypto.Decipher} in
 * @property {crypty.Cipher} out
 */
export class EncryptionManager {
  id: string
  sessionkey: Buffer;
  /**
   * @type {Decipher | undefined}
   */
  in: Decipher | undefined
  /**
   * @type {Cipher | undefined}
   */
  out: Cipher | undefined
  /**
   * Set the internal sessionkey
   *
   * @param {Buffer} sessionkey
   * @return {boolean}
   */
  setEncryptionKey(sessionkey: Buffer): boolean
  /**
   * Takes cyphertext and returns plaintext
   *
   * @param {Buffer} encryptedText
   * @return {Buffer}
   */
  decrypt(encryptedText: Buffer): Buffer
  /**
   * Encrypt plaintext and return the ciphertext
   *
   * @param {Buffer} plainText
   * @return {Buffer}
   * @memberof EncryptionMgr
   */
  encrypt(plainText: Buffer): Buffer
  /**
   *
   * @return {string}
   */
  _getSessionKey(): string
  /**
   * GetId
   *
   * @return {string}
   */
  getId(): string
}
import { Buffer } from 'buffer'
import { Decipher } from 'crypto'
import { Cipher } from 'crypto'
