import * as assert from "assert";
import RC4 from "./RC4";

// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

export class EncryptionMgr {
  private in: RC4;
  private out: RC4;
  private inKey: string;
  private outKey: string;

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
  public setEncryptionKey(sessionKey: string): boolean {
    this.in.setEncryptionKey(sessionKey);
    this.inKey = this.in.key;
    this.out.setEncryptionKey(sessionKey);
    this.outKey = this.out.key;

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
    assert.equal(this.inKey, this.in.key);
    const oldMState = this.in.mState;
    const cypherText = this.in.processString(encryptedText);
    assert.notEqual(oldMState, this.out.mState);
    // tslint:disable-next-line:no-console
    console.info("After decryption, the mState has changed");
    return cypherText;
  }
  /**
   * Encrypt plaintext and return the ciphertext
   *
   * @param {string} encryptedText
   * @returns {Buffer}
   * @memberof EncryptionMgr
   */
  public encrypt(encryptedText: string): Buffer {
    assert.equal(this.outKey, this.out.key);
    const oldMState = this.out.mState;
    const plaintext = this.out.processString(encryptedText);
    assert.notEqual(oldMState, this.out.mState);
    // tslint:disable-next-line:no-console
    console.info("After encryption, the mState has changed");
    return plaintext;
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
