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
import type { BufferWithConnection, EncryptionSession, SessionRecord, SocketWithConnectionInfo } from 'mcos-types/types.js'

const log = logger.child({ service: 'mcos:shared:encryption' })

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

const encryptionSessions: EncryptionSession[] = []

function generateEncryptionPair (dataConnection: SocketWithConnectionInfo, keys: SessionRecord): EncryptionSession {
  // For use on Lobby packets
  const { sessionkey, skey} = keys
  const stringKey = Buffer.from(sessionkey, "hex");
  Buffer.from(stringKey.slice(0, 16))

  // Deepcode ignore HardcodedSecret: This uses an empty IV
  const desIV = Buffer.alloc(8)

  const gsCipher = createCipheriv(
    'des-cbc',
    Buffer.from(skey, 'hex'),
    desIV
  )
  gsCipher.setAutoPadding(false)

  const gsDecipher = createDecipheriv(
    'des-cbc',
    Buffer.from(skey, 'hex'),
    desIV
  )
  gsDecipher.setAutoPadding(false)

  // For use on messageNode packets

  // File deepcode ignore InsecureCipher: RC4 is the encryption algorithum used here, file deepcode ignore HardcodedSecret: A blank IV is used here
  const tsCipher = createCipheriv('rc4', stringKey.slice(0, 16), '')
  const tsDecipher = createDecipheriv('rc4', stringKey.slice(0, 16), '')

  const newSession: EncryptionSession = {
    connectionId: dataConnection.id,
    remoteAddress: dataConnection.remoteAddress,
    localPort: dataConnection.localPort,
    sessionKey: keys.sessionkey,
    shortKey: keys.skey,
    gsCipher,
    gsDecipher,
    tsCipher,
    tsDecipher
  }

  return newSession
}

/**
 *
 * @param {IBufferWithConnection} dataConnection
 * @returns {IEncryptionSession}
 */
export function selectEncryptors (dataConnection: BufferWithConnection): EncryptionSession {
  const { localPort, remoteAddress } = dataConnection.connection

  if (typeof localPort === 'undefined' || typeof remoteAddress === 'undefined') {
    const errMessage = `[selectEncryptors]Either localPort or remoteAddress is missing on socket. Can not continue.`
    log.error(errMessage)
    throw new Error(errMessage)
  }
  const wantedId = `${remoteAddress}:${localPort}`

  const existingEncryptor = encryptionSessions.find(e => {
    const thisId = `${e.remoteAddress}:${e.localPort}`
    log.trace(`[selectEncryptors] Checking ${thisId} === ${wantedId} ?`)
    return thisId === wantedId
  })

  if (typeof existingEncryptor !== 'undefined') {
    log.debug(`Located existing encryption session for connection id ${dataConnection.connectionId}`)
    return existingEncryptor
  }

  const errMessage = `Unable to select encryptors for connection id ${dataConnection.connectionId}`
  log.error(errMessage)
  throw new Error(errMessage)
}

/**
 *
 * @param {ISocketWithConnectionInfo} dataConnection
 * @returns {IEncryptionSession}
 */
export function selectEncryptorsForSocket (dataConnection: SocketWithConnectionInfo): EncryptionSession {
  const { localPort, remoteAddress } = dataConnection

  if (typeof localPort === 'undefined' || typeof remoteAddress === 'undefined') {
    const errMessage = `[selectEncryptorsForSocket]Either localPort or remoteAddress is missing on socket. Can not continue.`
    log.error(errMessage)
    throw new Error(errMessage)
  }
  const wantedId = `${remoteAddress}:${localPort}`

  const existingEncryptor = encryptionSessions.find(e => {
    const thisId = `${e.remoteAddress}:${e.localPort}`
    log.trace(`[selectEncryptorsForSocket] Checking ${thisId} === ${wantedId} ?`)
    return thisId === wantedId
  })

  if (typeof existingEncryptor !== 'undefined') {
    log.debug(`Located existing encryption session for socket with connection id ${dataConnection.id}`)
    return existingEncryptor
  }

  const errMessage = `Unable to select encryptors for socket with connection id ${dataConnection.id}`
  log.error(errMessage)
  throw new Error(errMessage)
}

/**
 *
 * @param {ISocketWithConnectionInfo} dataConnection
 * @param {ISessionRecord} keys
 * @returns {IEncryptionSession}
 */
export function selectOrCreateEncryptors (dataConnection: SocketWithConnectionInfo, keys: SessionRecord): EncryptionSession {
  const { localPort, remoteAddress } = dataConnection

  if (typeof localPort === 'undefined' || typeof remoteAddress === 'undefined') {
    const errMessage = `[selectOrCreateEncryptors]Either localPort or remoteAddress is missing on socket. Can not continue.`
    log.error(errMessage)
    throw new Error(errMessage)
  }
  const wantedId = `${remoteAddress}:${localPort}`

  const existingEncryptor = encryptionSessions.find(e => {
    const thisId = `${e.remoteAddress}:${e.localPort}`
    log.trace(`[selectEncryptors] Checking ${thisId} === ${wantedId} ?`)
    return thisId === wantedId
  })

  if (typeof existingEncryptor !== 'undefined') {
    log.debug(`Located existing encryption session for connection id ${dataConnection.id}`)
    return existingEncryptor
  }


  const newSession = generateEncryptionPair(dataConnection, keys)

  log.debug(
          `Generated new encryption session for connection id ${dataConnection.id}`
  )

  encryptionSessions.push(newSession)

  return newSession
}

/**
   * Update the internal connection record
   */
export function updateEncryptionSession (connectionId: string, updatedSession: EncryptionSession): void {
  try {
    const index = encryptionSessions.findIndex(
      e => {
        return e.connectionId === connectionId
      }
    )
    encryptionSessions.splice(index, 1)
    encryptionSessions.push(updatedSession)
    log.debug(`Updated encryption session for id: ${connectionId}`)
  } catch (error) {
    throw new Error(
            `Error updating connection, ${errorMessage(error)}`
    )
  }
}

/**
   * CipherBufferDES
   * @param {IEncryptionSession} encryptionSession
   * @param {Buffer} data
   * @return {{session: IEncryptionSession, data: Buffer}}
   */
export function cipherBufferDES (encryptionSession: EncryptionSession, data: Buffer): { session: EncryptionSession; data: Buffer } {
  if (encryptionSession.gsCipher) {
    const ciphered = encryptionSession.gsCipher.update(data)
    return {
      session: encryptionSession,
      data: ciphered
    }
  }

  throw new Error('No DES cipher set on connection')
}

/**
   * Decrypt a command that is encrypted with DES
   * @param {IEncryptionSession} encryptionSession
   * @param {Buffer} data
   * @return {{session: IEncryptionSession, data: Buffer}}
   */
export function decipherBufferDES (encryptionSession: EncryptionSession, data: Buffer): { session: EncryptionSession; data: Buffer } {
  if (encryptionSession.gsDecipher) {
    const deciphered = encryptionSession.gsDecipher.update(data)
    return {
      session: encryptionSession,
      data: deciphered
    }
  }

  throw new Error('No DES decipher set on connection')
}

/**
   * Decrypt the buffer contents
   */
export function decryptBuffer (dataConnection: BufferWithConnection, buffer: Buffer): { session: EncryptionSession; data: Buffer } {
  const encryptionSession = selectEncryptors(dataConnection)
  const deciphered = encryptionSession.tsDecipher.update(buffer)
  return {
    session: encryptionSession,
    data: deciphered
  }
}
