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

import { DatabaseManager } from '../../mcos-database/src/index.js'


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
 * Convert to zero padded hex
 *
 * @export
 * @param {Buffer} data
 * @return {string}
 */
 export function toHex (data: Buffer): string {
  const bytes: string[] = []
  data.forEach(b => {
    bytes.push(b.toString(16).toUpperCase().padStart(2, '0'))
  })
  return bytes.join('')
}



















/**
 * Manages the game database server
 * @classdesc
 */
export class MCOTServer {
  /**
   *
   *
   * @private
   * @static
   * @type {MCOTServer}
   * @memberof MCOTServer
   */
  static _instance: MCOTServer
  databaseManager: DatabaseManager

  /**
   * Get the instance of the transactions server
   * @returns {MCOTServer}
   */
  static getTransactionServer (): MCOTServer {
    if (!MCOTServer._instance) {
      MCOTServer._instance = new MCOTServer()
    }
    return MCOTServer._instance
  }

  /**
     * Creates an instance of MCOTServer.
     *
     * Please use {@link MCOTServer.getTransactionServer()} instead
     * @memberof MCOTServer
     */
  constructor () {
    /** @type {DatabaseManager} */
    this.databaseManager = DatabaseManager.getInstance()
  }









}

export const getTransactionServer = MCOTServer.getTransactionServer
