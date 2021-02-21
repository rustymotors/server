// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import crypto, { Cipher, Decipher } from 'crypto'
import { Socket } from 'net'
import { ConnectionMgr } from './ConnectionMgr'
import { EncryptionManager } from './EncryptionMgr'

/**
 * Contains the proporties and methods for a TCP connection
 * @module ConnectionObj
 */

export enum ConnectionStatus {
  'Active',
  'Inactive'
}

/**
 * @typedef LobbyCiphers
 * @property { crypto.Cipher | null } cipher
 * @property { crypto.Decipher | null} decipher
 */
export interface LobbyCiphers {
  cipher: Cipher | null,
  decipher: Decipher | null
}

/**
 * @class ConnectionObj
 * @property {string} id
 * @property {Socket} sock
 * @property {ConnectionMgr} mgr
 */
export class ConnectionObj {
  id: string
  appId: number
  status: ConnectionStatus
  remoteAddress: string | undefined
  localPort: number
  sock: Socket
  msgEvent: null
  lastMsg: number
  useEncryption: boolean
  encLobby: LobbyCiphers
  enc: EncryptionManager
  isSetupComplete: boolean
  mgr: ConnectionMgr
  inQueue: boolean
  decryptedCmd: Buffer
  encryptedCmd: Buffer

  /**
   *
   * @param {string} connectionId
   * @param {Socket} sock
   * @param {module:ConnectionMgr} mgr
   */
  constructor (connectionId: string, sock: Socket, mgr: ConnectionMgr) {
    this.id = connectionId
    this.appId = 0
    /**
     * @type {ConnectionStatus}
     */
    this.status = ConnectionStatus.Inactive
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
    this.enc = new EncryptionManager()
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
  setEncryptionKey (key: Buffer) {
    this.isSetupComplete = this.enc.setEncryptionKey(key)
  }

  /**
   * setEncryptionKeyDES
   *
   * @param {string} sKey
   */
  setEncryptionKeyDES (sKey: string) {
    // deepcode ignore HardcodedSecret: This uses an empty IV
    const desIV = Buffer.alloc(8)
    this.encLobby.cipher = crypto.createCipheriv(
      'des-cbc',
      Buffer.from(sKey, 'hex'),
      desIV
    )
    this.encLobby.cipher!.setAutoPadding(false)
    this.encLobby.decipher = crypto.createDecipheriv(
      'des-cbc',
      Buffer.from(sKey, 'hex'),
      desIV
    )
    this.encLobby.decipher!.setAutoPadding(false)

    this.isSetupComplete = true
  }

  /**
   * CipherBufferDES
   *
   * @param {Buffer} messageBuffer
   * @return {Buffer}
   */
  cipherBufferDES (messageBuffer: Buffer) {
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
  decipherBufferDES (messageBuffer: Buffer) {
    if (this.encLobby.decipher) {
      return this.encLobby.decipher.update(messageBuffer)
    }
    throw new Error('No DES decipher set on connection')
  }
}
