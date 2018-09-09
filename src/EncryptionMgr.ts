import RC4 from "./RC4";

// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

export class EncryptionMgr {
  private in: RC4;
  private out: RC4;

  constructor() {
    this.in = new RC4();
    this.out = new RC4();
  }

  /**
   * set the internal sessionkey
   *
   * @param {string} sessionKey
   * @returns {boolean}
   * @memberof EncryptionMgr
   */
  public setEncryptionKey(sessionKey: Buffer): boolean {
    this.in.setEncryptionKey(sessionKey);
    this.out.setEncryptionKey(sessionKey);

    return true;
  }
  /**
   * Takes cyphertext and returns plaintext
   *
   * @param {string} encryptedText
   * @returns {Buffer}
   * @memberof EncryptionMgr
   */
  public decrypt(encryptedText: string): Buffer {
    return this.in.processString(encryptedText);
  }
  /**
   * Encrypt plaintext and return the ciphertext
   *
   * @param {string} encryptedText
   * @returns {Buffer}
   * @memberof EncryptionMgr
   */
  public encrypt(encryptedText: string): Buffer {
    return this.out.processString(encryptedText);
  }

  public _getInKey() {
    return this.in.key;
  }

  public _getOutKey() {
    return this.out.key;
  }

  public _getInState() {
    return this.in.mState;
  }

  public _getOutState() {
    return this.out.mState;
  }
}
