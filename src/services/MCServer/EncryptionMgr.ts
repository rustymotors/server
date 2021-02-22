// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import crypto, { Cipher, Decipher } from 'crypto'
import { VError } from 'verror'

/**
 * Handles the management of the encryption and decryption
 * of the TCP connections
 * @module EncryptionMgr
 */

/**
 *
 */
export class EncryptionManager {
  id: string
  sessionkey: Buffer
  in: Decipher | null
  out: Cipher | null

  /**
   *
   */
  constructor () {
    const hash = crypto.createHash('sha256')
    const timestamp = (Date.now() + Math.random()).toString()
    hash.update(timestamp)
    this.id = hash.digest('hex')
    this.sessionkey = Buffer.alloc(0)
    this.in = null
    this.out = null
  }

  /**
   * set the internal sessionkey
   *
   * @param {Buffer} sessionkey
   * @return {boolean}
   * @memberof EncryptionMgr
   */
  setEncryptionKey (sessionkey: Buffer): boolean {
    this.sessionkey = sessionkey
    // file deepcode ignore InsecureCipher: RC4 is the encryption algorithum used here, file deepcode ignore HardcodedSecret: A blank IV is used here
    this.in = crypto.createDecipheriv('rc4', sessionkey, '')
    this.out = crypto.createCipheriv('rc4', sessionkey, '')
    return true
  }

  /**
   * Takes cyphertext and returns plaintext
   *
   * @param {Buffer} encryptedText
   * @return {Buffer}
   * @memberof EncryptionMgr
   */
  decrypt (encryptedText: Buffer): Buffer {
    if (this.in === null) {
      throw new VError('No encryption manager found!')
    }
    return Buffer.from(this.in.update(encryptedText))
  }

  /**
   * Encrypt plaintext and return the ciphertext
   *
   * @param {Buffer} plainText
   * @return {Buffer}
   * @memberof EncryptionMgr
   */
  encrypt (plainText: Buffer): Buffer {
    if (this.out === null) {
      throw new VError('No decryption manager found!')
    }
    return Buffer.from(
      this.out.update(plainText.toString(), 'binary', 'hex'),
      'hex'
    )
  }

  /**
   *
   * @return {string}
   */
  _getSessionKey (): string {
    return this.sessionkey.toString('hex')
  }

  /**
   * getId
   *
   * @return {string}
   */
  getId (): string {
    return this.id
  }
}
