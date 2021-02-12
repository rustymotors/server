// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { EncryptionMgr } = require('./EncryptionMgr')
const { Socket } = require('net')
const { createCipheriv, Cipher, Decipher, createDecipheriv } = require('crypto')

/**
 * @typedef LobbyCiphers
 * @property { Cipher | null } cipher
 * @property { Decipher | null} decipher
 */

/**
 * @class ConnectionObj
 * @property {string} id
 * @property {Socket} sock
 * @property {ConnectionMgr} mgr
 */
exports.ConnectionObj = class ConnectionObj {
  /**
   *
   * @param {string} connectionId
   * @param {Socket} sock
   * @param {ConnectionMgr} mgr
   */
  constructor(connectionId, sock, mgr) {
    this.id = connectionId
    this.appId = 0
    /**
     * @type {'ACTIVE'|'INACTIVE'}
     */
    this.status = 'INACTIVE'
    this.remoteAddress = sock.remoteAddress
    this.localPort = sock.localPort
    this.sock = sock
    this.msgEvent = null
    this.lastMsg = 0
    this.useEncryption = false
    /** @type {LobbyCiphers} */
    this.encLobby = {
      cipher: null,
      decipher: null
    }
    this.enc = new EncryptionMgr()
    this.isSetupComplete = false
    this.mgr = mgr
    this.inQueue = true
    this.decryptedCmd = Buffer.alloc(0)
    this.encryptedCmd = Buffer.alloc(0)
  }

  /**
   *
   * @param {Buffer} key
   */
  setEncryptionKey(key) {
    this.isSetupComplete = this.enc.setEncryptionKey(key)
  }

  /**
   * setEncryptionKeyDES
   *
   * @param {string} sKey
   */
  setEncryptionKeyDES(sKey) {
    // deepcode ignore HardcodedSecret: This uses an empty IV
    const desIV = Buffer.alloc(8)
    this.encLobby.cipher = createCipheriv(
      'des-cbc',
      Buffer.from(sKey, 'hex'),
      desIV
    )
    this.encLobby.cipher.setAutoPadding(false)
    this.encLobby.decipher = createDecipheriv(
      'des-cbc',
      Buffer.from(sKey, 'hex'),
      desIV
    )
    this.encLobby.decipher.setAutoPadding(false)

    this.isSetupComplete = true
  }

  /**
   * CipherBufferDES
   *
   * @param {Buffer} messageBuffer
   * @return {Buffer}
   */
  cipherBufferDES(messageBuffer) {
    if (this.encLobby.cipher) {
      return this.encLobby.cipher.update(messageBuffer)
    }
    throw new Error('No DES cipher set on connection')
  }

  /**
   * DecipherBufferDES
   *
   * @param {Buffer} messageBuffer
   * @return {Buffer}
   */
  decipherBufferDES(messageBuffer) {
    if (this.encLobby.decipher) {
      return this.encLobby.decipher.update(messageBuffer)
    }
    throw new Error('No DES decipher set on connection')
  }
}
