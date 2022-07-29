// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017>  <Drazi Crendraven>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { createCipheriv, createDecipheriv } from 'node:crypto'
import { logger } from 'mcos-logger/src/index.js'
import type { Socket } from 'node:net'
import type { ECONNECTION_STATUS, LobbyCiphers } from 'mcos-types/types.js'
import type { EncryptionManager } from './encryption-mgr.js'
import type { MessageNode } from 'mcos-types/MessageNode.js'

const log = logger.child({ service: 'mcoserver:TCPConnection' })

/**
 *
 *
 * @param {unknown} error
 * @return {string}
 */
 export function errorMessage (error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

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
  id: string
  /**
   *
   *
   * @type {number}
   * @memberof TCPConnection
   */
  appId: number
  /**
   *
   *
   * @type {EConnectionStatus}
   * @memberof TCPConnection
   */
  status: ECONNECTION_STATUS
  /**
   *
   * @type {string} [remoteAddress]
   * @memberof TCPConnection
   */
  remoteAddress: string
  /**
   *
   *
   * @type {number}
   * @memberof TCPConnection
   */
  localPort: number
  /**
   *
   *
   * @type {Socket}
   * @memberof TCPConnection
   */
  sock: Socket
  /**
   *
   *
   * @type {null}
   * @memberof TCPConnection
   */
  msgEvent: null
  /**
   *
   *
   * @type {number}
   * @memberof TCPConnection
   */
  lastMsg: number
  /**
   *
   *
   * @type {boolean}
   * @memberof TCPConnection
   */
  useEncryption: boolean
  /**
   *
   *
   * @private
   * @type {ILobbyCiphers}
   * @memberof TCPConnection
   */
  encLobby: LobbyCiphers
  /**
   *
   *
   * @private
   * @type {IEncryptionManager | undefined} [enc]
   * @memberof TCPConnection
   */
  enc: EncryptionManager | undefined
  /**
   *
   *
   * @type {boolean}
   * @memberof TCPConnection
   */
  isSetupComplete: boolean
  /**
   *
   *
   * @type {boolean}
   * @memberof TCPConnection
   */
  inQueue: boolean
  /**
   *
   *
   * @type {Buffer | undefined} [encryptedCmd]
   * @memberof TCPConnection
   */
  encryptedCmd: Buffer | undefined
  /**
   *
   *
   * @type {Buffer | undefined} [decryptedCmd]
   * @memberof TCPConnection
   */
  decryptedCmd: Buffer | undefined

  /**
   * Creates an instance of TCPConnection.
   * @param {string} connectionId
   * @param {Socket} sock
   * @memberof TCPConnection
   */
  constructor (connectionId: string, sock: Socket) {
    if (typeof sock.localPort === 'undefined') {
      throw new Error(
        'localPort is undefined, unable to create connection object'
      )
    }
    this.id = connectionId
    this.appId = 0
    this.status = "Inactive"
    this.remoteAddress = typeof sock.remoteAddress !== "undefined" ? sock.remoteAddress : ''
    this.localPort = sock.localPort
    this.sock = sock
    this.msgEvent = null
    this.lastMsg = 0
    this.useEncryption = false
    this.encLobby = {}
    this.isSetupComplete = false
    this.inQueue = true
  }

  /**
   * Has the encryption keyset for lobby messages been created?
   * @returns {boolean}
   */
  isLobbyKeysetReady (): boolean {
    return (
      typeof this.encLobby.cipher !== "undefined" && typeof this.encLobby.decipher !== "undefined"
    )
  }

  /**
   * Set the encryption manager
   * @param {IEncryptionManager} encryptionManager
   * @returns {TCPConnection}
   */
  setEncryptionManager (encryptionManager: EncryptionManager): TCPConnection {
    this.enc = encryptionManager
    return this
  }

  /**
   * Return the encryption manager id
   * @returns {string}
   */
  getEncryptionId (): string {
    if (typeof this.enc === "undefined") {
      throw new Error('Encryption manager not set')
    }
    return this.enc.getId()
  }

  /**
   * Encrypt the buffer contents
   * @param {Buffer} buffer
   * @returns {Buffer}
   */
  encryptBuffer (buffer: Buffer): Buffer {
    if (typeof this.enc === "undefined") {
      throw new Error('Encryption manager not set')
    }
    return this.enc.encrypt(buffer)
  }

  /**
   * Decrypt the buffer contents
   * @param {Buffer} buffer
   * @returns {Buffer}
   */
  decryptBuffer (buffer: Buffer): Buffer {
    if (typeof this.enc === "undefined") {
      throw new Error('Encryption manager not set')
    }
    return this.enc.decrypt(buffer)
  }

  /**
   *
   * @param {Buffer} key
   * @return {void}
   */
  setEncryptionKey (key: Buffer): void {
    if (typeof this.enc === "undefined") {
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
  setEncryptionKeyDES (skey: string): void {
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
      const errMessage = `Error setting cipher: ${errorMessage(err)}`
      log.error(errMessage)
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
      const errMessage = `Error setting decipher: ${errorMessage(err)}`
      log.error(errMessage)
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
  cipherBufferDES (messageBuffer: Buffer): Buffer {
    if (typeof this.encLobby.cipher !== "undefined") {
      return this.encLobby.cipher.update(messageBuffer)
    }

    throw new Error('No DES cipher set on connection')
  }

  /**
   * Decrypt a command that is encrypted with DES
   * @param {Buffer} messageBuffer
   */
  decipherBufferDES (messageBuffer: Buffer): Buffer {
    if (typeof this.encLobby.decipher !== "undefined") {
      return this.encLobby.decipher.update(messageBuffer)
    }

    throw new Error('No DES decipher set on connection')
  }

  /**
   *
   * @param {MessageNode} packet
   * @returns {{connection: TCPConnection, packet: MessageNode, lastError?: string}}
   */
  compressIfNeeded (packet: MessageNode): { connection: TCPConnection; packet: MessageNode; lastError?: string } {
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
      // TODO: #1170 Create compression method and compress packet if needed
      /*
       * At this time we will still send the packet, to not hang connection
       * Client will crash though, due to memory access errors
       */
    }

    return { connection: this, packet }
  }

  /**
   *
   * @param {MessageNode} packet
   * @returns {{connection: TCPConnection, packet: MessageNode}}
   */
  encryptIfNeeded (packet: MessageNode): { connection: TCPConnection; packet: MessageNode } {
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
   * @param {MessageNode[]} packetList
   * @returns {TCPConnection}
   */
  tryWritePackets (packetList: Array<MessageNode>): TCPConnection {
    /** @type {{connection: TCPConnection, packetList: MessageNode[]}} */
    const updatedConnection: { connection: TCPConnection; packetList: Array<MessageNode> } = {
      connection: this,
      packetList
    }
    // For each node in nodes
    for (const packet of updatedConnection.packetList) {
      // Does the packet need to be compressed?
      /** @type {MessageNode} */
      const compressedPacket: MessageNode = this.compressIfNeeded(packet).packet
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
      if (this.sock.writable === true) {
        // Write the packet to socket
        this.sock.write(encryptedPacket.serialize())
      } else {
        /** @type {string} */
        const port: string = typeof this.sock.localPort !== "undefined" ? this.sock.localPort?.toString() : ''
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
