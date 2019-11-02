// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as crypto from "crypto";

export class EncryptionMgr {
  private id: string;
  private sessionKey: Buffer;
  private in: crypto.Decipher | null;
  private out: crypto.Cipher | null;

  constructor() {
    const hash = crypto.createHash("sha256");
    const timestamp = (Date.now() + Math.random()).toString();
    hash.update(timestamp);
    this.id = hash.digest("hex");
    this.sessionKey = Buffer.alloc(0);
    (this.in = null), (this.out = null);
  }

  /**
   * set the internal sessionkey
   *
   * @param {string} sessionKey
   * @returns {boolean}
   * @memberof EncryptionMgr
   */
  public setEncryptionKey(sessionKey: Buffer): boolean {
    this.sessionKey = sessionKey;
    this.in = crypto.createDecipheriv("rc4", sessionKey, "");
    this.out = crypto.createCipheriv("rc4", sessionKey, "");

    return true;
  }
  /**
   * Takes cyphertext and returns plaintext
   *
   * @param {Buffer} encryptedText
   * @returns {Buffer}
   * @memberof EncryptionMgr
   */
  public decrypt(encryptedText: Buffer): Buffer {
    return Buffer.from(this.in!.update(encryptedText));
  }
  /**
   * Encrypt plaintext and return the ciphertext
   *
   * @param {Buffer} encryptedText
   * @returns {Buffer}
   * @memberof EncryptionMgr
   */
  public encrypt(plainText: Buffer): Buffer {
    return Buffer.from(
      this.out!.update(plainText.toString(), "binary", "hex"),
      "hex"
    );
  }

  public getSessionKey() {
    return this.sessionKey.toString("hex");
  }

  /**
   * getId
   */
  public getId() {
    return this.id;
  }
}
