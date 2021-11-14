/// <reference types="node" />
import { Decipher, Cipher } from "crypto";
/**
 * Handles the management of the encryption and decryption
 * of the TCP connections
 * @module EncryptionMgr
 */
/**
 * @class
 * @property {string} id
 * @property {Buffer} sessionkey
 * @property {crypto.Decipher} in
 * @property {crypty.Cipher} out
 */
export declare class EncryptionManager {
  id: string;
  sessionkey: Buffer;
  in: Decipher | undefined;
  out: Cipher | undefined;
  /**
   *
   */
  constructor();
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
