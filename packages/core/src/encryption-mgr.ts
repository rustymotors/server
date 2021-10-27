// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import {
  createDecipheriv,
  createCipheriv,
  randomBytes,
  Decipher,
  Cipher,
} from "crypto";

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
export class EncryptionManager {
  id: string;
  sessionkey: Buffer;
  in: Decipher | undefined;
  out: Cipher | undefined;
  /**
   *
   */
  constructor() {
    // This hash is used for an id only.
    const timestamp = (Date.now() + randomBytes(20).join("")).toString();
    this.id = Buffer.from(timestamp).toString("hex");
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
