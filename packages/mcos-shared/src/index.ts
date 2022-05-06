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

import { logger } from './logger/index.js'

export { TCPConnection } from './tcpConnection.js'
export { EncryptionManager } from './encryption-mgr.js'
export { selectEncryptors, selectEncryptorsForSocket, selectOrCreateEncryptors, updateEncryptionSession, decipherBufferDES, decryptBuffer, cipherBufferDES } from './encryption.js'

const log = logger.child({ service: '' })

/**
 *
 *
 * @param {unknown} error
 * @return {string}
 */
export function errorMessage (error: unknown) {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

/**
 * Convert to zero padded hex
 *
 * @export
 * @param {Buffer} data
 * @return {string}
 */
export function toHex (data: Buffer): string {
  /** @type {string[]} */
  const bytes: string[] = []
  data.forEach(b => {
    bytes.push(b.toString(16).toUpperCase().padStart(2, '0'))
  })
  return bytes.join('')
}

export function logAndThrow(service: string, errMessage: string): never {
  log.service = service
  log.error(errMessage)
  throw new Error(errMessage)
}
