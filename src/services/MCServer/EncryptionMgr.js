// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const crypto = require('crypto')

/**
 *
 */
class EncryptionMgr {
  /**
   *
   */
  constructor () {
    const hash = crypto.createHash('sha256')
    const timestamp = (Date.now() + Math.random()).toString()
    hash.update(timestamp)
    this.id = hash.digest('hex')
    this.sessionKey = Buffer.alloc(0)
    this.in = null
    this.out = null
  }

  /**
   * set the internal sessionkey
   *
   * @param {Buffer} sessionKey
   * @return {boolean}
   * @memberof EncryptionMgr
   */
  setEncryptionKey (sessionKey) {
    this.sessionKey = sessionKey
    // file deepcode ignore InsecureCipher: RC4 is the encryption algorithum used here, file deepcode ignore HardcodedSecret: A blank IV is used here
    this.in = crypto.createDecipheriv('rc4', sessionKey, '')
    this.out = crypto.createCipheriv('rc4', sessionKey, '')
    return true
  }

  /**
   * Takes cyphertext and returns plaintext
   *
   * @param {Buffer} encryptedText
   * @return {Buffer}
   * @memberof EncryptionMgr
   */
  decrypt (encryptedText) {
    return Buffer.from(this.in.update(encryptedText))
  }

  /**
   * Encrypt plaintext and return the ciphertext
   *
   * @param {Buffer} plainText
   * @return {Buffer}
   * @memberof EncryptionMgr
   */
  encrypt (plainText) {
    return Buffer.from(
      this.out.update(plainText.toString(), 'binary', 'hex'),
      'hex'
    )
  }

  /**
   *
   */
  getSessionKey () {
    return this.sessionKey.toString('hex')
  }

  /**
   * getId
   */
  getId () {
    return this.id
  }
}

module.exports = {
  EncryptionMgr
}
