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

import { GSMessageBase } from 'mcos-shared/structures'

/**
 * @export
 * @typedef {object} MCOTSListEntry
 * @property {number} mcotsID - 4 bytes. shard-wide unique id # of this MCOTS instance
 * @property {number} port - 2 bytes
 * @property {string} ip - 4 bytes
 * @property {number} priorityOrder - 2 bytes. lower means has less load
 */

/**
 * @export
 * @typedef {[MCOTSListEntry, MCOTSListEntry, MCOTSListEntry, MCOTSListEntry]} MCOTSServerList
 */

export class GLoginMsg extends GSMessageBase {
  msgNo = 105 // 2 bytes
  customerId = 0 // 4 bytes
  personaId = 0 // 4 bytes
  lotOwnerId = 0 // 4 bytes
  brandedPartId = 0 // 4 bytes
  skinId = 0 // 4 bytes
  personaName = '' // max_length: 13
  mcVersion = 0 // 4 bytes

  constructor () {
    super()
    this._add({ name: 'customerId', order: 'big', size: 4, type: 'u32', value: Buffer.alloc(4) })
  }
}

export class LoginCompleteMsg {
  msgNo = 213 // 2 bytes
  serverTime = 0 // 4 bytes
  firstTime = false // 1 byte
  paycheckWaiting = false // 1 byte
  clubInvantationsWaiting = false // 1 byte
  tallyInProgress = false // 1 byte
  secondsTillShutdown = 0 // 2 bytes
  shardGNP = 0 // 2 bytes
  shardCarsSold = 0 // 4 bytes
  shardAverageSalary = 0 // 4 bytes
  shardAverageCarsSold = 0 // 4 bytes
  shardAveragePlayerLevel = 0 // 4 bytes
  /** @type {MCOTSListEntry[]} - max_siz: 4 */
  ServerList = []
  /**
     * used by GPS web page to provide some minimal validation of the user;
     *   o created by MCOTS; stored into DB at login time
     *   o submitted by client in web page posts
     *   o java compares this value against PLAYER.WEBCOOKIE
     */
  webCookie = '' // 4 bytes
  /** @type {import("mcos-shared/structures").TIMESTAMP_STRUCT} */
  nextTallyDate = {
    year: 0,
    month: 0,
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
    fraction: 0
  }

  /** @type {import("mcos-shared/structures").TIMESTAMP_STRUCT} */
  nextPaycheckDate = {
    year: 0,
    month: 0,
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
    fraction: 0
  }
}
