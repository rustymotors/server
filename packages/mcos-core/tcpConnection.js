// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { createCipheriv, createDecipheriv } from 'node:crypto'
import { logger } from 'mcos-shared/logger'
import { errorMessage } from 'mcos-shared'

const log = logger.child({ service: 'mcoserver:TCPConnection' })

/**
 * @export
 * @typedef {'Active' | 'Inactive'} EConnectionStatus
 *
 */

/**
 * Container for all TCP connections
 */
export class TCPConnection {
  /**
   *
   *
   * @type {string}
   * @memberof TCPConnection
   */
  id
  /**
   *
   *
   * @type {number}
   * @memberof TCPConnection
   */
  appId
  /**
   *
   *
   * @type {EConnectionStatus}
   * @memberof TCPConnection
   */
  status
  /**
   *
   * @type {string} [remoteAddress]
   * @memberof TCPConnection
   */
  remoteAddress
  /**
   *
   *
   * @type {number}
   * @memberof TCPConnection
   */
  localPort
  /**
   *
   *
   * @type {import("node:net").Socket}
   * @memberof TCPConnection
   */
  sock
  /**
   *
   *
   * @type {null}
   * @memberof TCPConnection
   */
  msgEvent
  /**
   *
   *
   * @type {number}
   * @memberof TCPConnection
   */
  lastMsg
  /**
   *
   *
   * @type {boolean}
   * @memberof TCPConnection
   */
  useEncryption
  /**
   *
   *
   * @private
   * @type {import("mcos-shared/types").LobbyCiphers}
   * @memberof TCPConnection
   */
  encLobby
  /**
   *
   *
   * @private
   * @type {import("mcos-core").EncryptionManager | undefined} [enc]
   * @memberof TCPConnection
   */
  enc
  /**
   *
   *
   * @type {boolean}
   * @memberof TCPConnection
   */
  isSetupComplete
  /**
   *
   *
   * @private
   * @type {import("mcos-core").ConnectionManager | undefined} [mgr]
   * @memberof TCPConnection
   */
  mgr
  /**
   *
   *
   * @type {boolean}
   * @memberof TCPConnection
   */
  inQueue
  /**
   *
   *
   * @type {Buffer | undefined} [encryptedCmd]
   * @memberof TCPConnection
   */
  encryptedCmd
  /**
   *
   *
   * @type {Buffer | undefined} [decryptedCmd]
   * @memberof TCPConnection
   */
  decryptedCmd

  /**
   * Creates an instance of TCPConnection.
   * @param {string} connectionId
   * @param {import("node:net").Socket} sock
   * @memberof TCPConnection
   */
  constructor (connectionId, sock) {
    if (typeof sock.localPort === 'undefined') {
      throw new Error(
        'localPort is undefined, unable to create connection object'
      )
    }
    this.id = connectionId
    this.appId = 0
    this.status = 'Inactive'
    this.remoteAddress = sock.remoteAddress || ''
    this.localPort = sock.localPort
    this.sock = sock
    this.msgEvent = null
    this.lastMsg = 0
    this.useEncryption = false
    /** @type {import("mcos-shared/types").LobbyCiphers} */
    this.encLobby = {}
    this.isSetupComplete = false
    this.inQueue = true
  }

  /**
   * Has the encryption keyset for lobby messages been created?
   * @returns {boolean}
   */
  isLobbyKeysetReady () {
    return (
      this.encLobby.cipher !== undefined && this.encLobby.decipher !== undefined
    )
  }

  /**
   * Update connection record
   * @param {string} remoteAddress
   * @param {number} localPort
   * @param {TCPConnection} newConnection
   * @returns {TCPConnection[]}
   */
  updateConnectionByAddressAndPort (remoteAddress, localPort, newConnection) {
    if (this.mgr === undefined) {
      throw new Error('Connection manager not set')
    }
    return this.mgr.updateConnectionByAddressAndPort(
      remoteAddress,
      localPort,
      newConnection
    )
  }

  /**
   * Set the connection manager
   * @param {import("mcos-core").ConnectionManager} manager
   * @returns {TCPConnection}
   */
  setManager (manager) {
    this.mgr = manager
    return this
  }

  /**
   * Set the encryption manager
   * @param {import("mcos-core").EncryptionManager} encryptionManager
   * @returns {TCPConnection}
   */
  setEncryptionManager (encryptionManager) {
    this.enc = encryptionManager
    return this
  }

  /**
   * Return the encryption manager id
   * @returns {string}
   */
  getEncryptionId () {
    if (this.enc === undefined) {
      throw new Error('Encryption manager not set')
    }
    return this.enc.getId()
  }

  /**
   * Encrypt the buffer contents
   * @param {Buffer} buffer
   * @returns {Buffer}
   */
  encryptBuffer (buffer) {
    if (this.enc === undefined) {
      throw new Error('Encryption manager not set')
    }
    return this.enc.encrypt(buffer)
  }

  /**
   * Decrypt the buffer contents
   * @param {Buffer} buffer
   * @returns {Buffer}
   */
  decryptBuffer (buffer) {
    if (this.enc === undefined) {
      throw new Error('Encryption manager not set')
    }
    return this.enc.decrypt(buffer)
  }

  /**
   *
   * @param {Buffer} key
   * @return {void}
   */
  setEncryptionKey (key) {
    if (this.enc === undefined) {
      throw new Error('Encryption manager is not set')
    }
    this.isSetupComplete = this.enc.setEncryptionKey(key)
  }

  /**
   * SetEncryptionKeyDES
   *
   * @param {string} skey
   * @return {void}
   */
  setEncryptionKeyDES (skey) {
    // Deepcode ignore HardcodedSecret: This uses an empty IV
    const desIV = Buffer.alloc(8)

    try {
      this.encLobby.cipher = createCipheriv(
        'des-cbc',
        Buffer.from(skey, 'hex'),
        desIV
      )
      this.encLobby.cipher.setAutoPadding(false)
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Error setting cipher: ${err.message}`)
      }
      throw err
    }

    try {
      this.encLobby.decipher = createDecipheriv(
        'des-cbc',
        Buffer.from(skey, 'hex'),
        desIV
      )
      this.encLobby.decipher.setAutoPadding(false)
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Error setting decipher: ${err.message}`)
      }
      throw err
    }

    this.isSetupComplete = true
  }

  /**
   * CipherBufferDES
   *
   * @param {Buffer} messageBuffer
   * @return {Buffer}
   */
  cipherBufferDES (messageBuffer) {
    if (this.encLobby.cipher) {
      return this.encLobby.cipher.update(messageBuffer)
    }

    throw new Error('No DES cipher set on connection')
  }

  /**
   * Decrypt a command that is encrypted with DES
   * @param {Buffer} messageBuffer
   */
  decipherBufferDES (messageBuffer) {
    if (this.encLobby.decipher) {
      return this.encLobby.decipher.update(messageBuffer)
    }

    throw new Error('No DES decipher set on connection')
  }

  /**
   * Replays the unproccessed packet to the connection manager
   * @param {import("mcos-shared/types").UnprocessedPacket} packet
   * @returns {Promise<{err: Error | null, data: TCPConnection | null}>}
   */
  async processPacket (packet) {
    if (this.mgr === undefined) {
      return { err: new Error('Connection manager is not set'), data: null }
    }
    try {
      const result = this.mgr.processData(packet)
      log.debug('Back in TCP Connection')
      return result
    } catch (error) {
      log.error(errorMessage(error))
      return {
        err: new Error(
          `There was an error processing the packet: ${errorMessage(error)}`
        ),
        data: null
      }
    }
  }

  /**
   *
   * @param {import("mcos-shared/types").MessageNode} packet
   * @returns {import("mcos-shared/types").ConnectionWithPacket}
   */
  compressIfNeeded (packet) {
    // Check if compression is needed
    if (packet.getLength() < 80) {
      log.debug('Too small, should not compress')
      return {
        connection: this,
        packet,
        lastError: 'Too small, should not compress'
      }
    } else {
      log.debug('This packet should be compressed')
      /* TODO: Write compression.
       *
       * At this time we will still send the packet, to not hang connection
       * Client will crash though, due to memory access errors
       */
    }

    return { connection: this, packet }
  }

  /**
   *
   * @param {import("mcos-shared/types").MessageNode} packet
   * @returns {import("mcos-shared/types").ConnectionWithPacket}
   */
  encryptIfNeeded (packet) {
    // Check if encryption is needed
    if (packet.flags - 8 >= 0) {
      log.debug('encryption flag is set')

      packet.updateBuffer(this.encryptBuffer(packet.data))

      log.debug(`encrypted packet: ${packet.serialize().toString('hex')}`)
    }

    return { connection: this, packet }
  }

  /**
   * Attempt to write packet(s) to the socjet
   * @param {import("mcos-shared/types").MessageNode[]} packetList
   * @returns {TCPConnection}
   */
  tryWritePackets (packetList) {
    /** @type {import("mcos-shared/types").ConnectionWithPackets} */
    const updatedConnection = {
      connection: this,
      packetList
    }
    // For each node in nodes
    for (const packet of updatedConnection.packetList) {
      // Does the packet need to be compressed?
      /** @type {import("mcos-shared/types").MessageNode} */
      const compressedPacket = this.compressIfNeeded(packet).packet
      // Does the packet need to be encrypted?
      const encryptedPacket = this.encryptIfNeeded(compressedPacket).packet
      // Log that we are trying to write
      log.debug(
        ` Atempting to write seq: ${encryptedPacket.seq} to conn: ${updatedConnection.connection.id}`
      )

      // Log the buffer we are writing
      log.debug(
        `Writting buffer: ${encryptedPacket.serialize().toString('hex')}`
      )
      if (this.sock.writable) {
        // Write the packet to socket
        this.sock.write(encryptedPacket.serialize())
      } else {
        /** @type {string} */
        const port = this.sock.localPort?.toString() || ''
        throw new Error(
          `Error writing ${encryptedPacket.serialize()} to ${
            this.sock.remoteAddress
          } , ${port}`
        )
      }
    }

    return updatedConnection.connection
  }
}
