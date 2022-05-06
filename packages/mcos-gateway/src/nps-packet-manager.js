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

import { logger } from 'mcos-shared/logger'
import { DatabaseManager } from 'mcos-database'
import { LobbyServer } from 'mcos-lobby'
import { LoginServer } from 'mcos-login'
import { PersonaServer } from 'mcos-persona'
import { toHex } from 'mcos-shared'

const log = logger.child({ service: 'mcoserver:NPSPacketManager' })

/**
 * @module npsPacketManager
 */

/**
 * @export
 * @typedef IMsgNameMapping
 * @property {number} id
 * @property {string} name
 */

/**
 *  Handles incoming NPS packets
 *
 * @export
 * @class NPSPacketManager
 */
export class NPSPacketManager {
  database = DatabaseManager.getInstance()
  constructor () {
    this.npsKey = ''
    this.msgNameMapping = [
      { id: 0x1_00, name: 'NPS_LOGIN' },
      { id: 0x1_20, name: 'NPS_LOGIN_RESP' },
      { id: 0x1_28, name: 'NPS_GET_MINI_USER_LIST' },
      { id: 0x2_07, name: 'NPS_ACK' },
      { id: 0x2_17, name: 'NPS_HEATBEAT' },
      { id: 0x2_29, name: 'NPS_MINI_USER_LIST' },
      { id: 0x3_0c, name: 'NPS_SEND_MINI_RIFF_LIST' },
      { id: 0x5_01, name: 'NPS_USER_LOGIN' },
      { id: 0x5_03, name: 'NPS_REGISTER_GAME_LOGIN' },
      { id: 0x5_07, name: 'NPS_NEW_GAME_ACCOUNT' },
      { id: 0x5_32, name: 'NPS_GET_PERSONA_MAPS' },
      { id: 0x6_07, name: 'NPS_GAME_ACCOUNT_INFO' },
      { id: 0x11_01, name: 'NPS_CRYPTO_DES_CBC' }
    ]

    this.loginServer = LoginServer.getInstance()
    this.personaServer = PersonaServer.getInstance()
    this.lobbyServer = LobbyServer.getInstance()
  }

  /**
   *
   * @param {number} messageId
   * @return {string}
   */
  msgCodetoName (messageId) {
    const mapping = this.msgNameMapping.find((code) => code.id === messageId)
    return mapping ? mapping.name : 'Unknown msgId'
  }

  /**
   *
   * @return {string}
   */
  getNPSKey () {
    return this.npsKey
  }

  /**
   *
   * @param {string} key
   * @return {void}
   */
  setNPSKey (key) {
    this.npsKey = key
  }

  /**
   *
   * @param {{connection: import("mcos-shared/built").TCPConnection, data: Buffer}} rawPacket
   * @return {Promise<import("mcos-shared/built").TCPConnection>}
   */
  async processNPSPacket (rawPacket) {
    const messageId = rawPacket.data.readInt16BE(0)
    log.info(
      `Handling message,
      ${JSON.stringify({
        msgName: this.msgCodetoName(messageId),
        msgId: messageId
      })}`
    )

    const { localPort } = rawPacket.connection

    switch (localPort) {
      case 8226:
        return await this.loginServer.dataHandler(rawPacket)
      case 8228:
        return await this.personaServer.dataHandler(rawPacket)
      case 7003: {
        log.trace(`[legacy] Raw bytes in processNPSPacket(pre-lobby): ${toHex(rawPacket.data)}`)
        const updatedConnection = await this.lobbyServer.dataHandler(rawPacket)
        log.trace(`[legacy] Raw bytes in processNPSPacket(post-lobby): ${toHex(rawPacket.data)}`)
        return updatedConnection
      }
      default:
        process.exitCode = -1
        throw new Error(
          `[npsPacketManager] Recieved a packet',
          ${JSON.stringify({
            msgId: messageId,
            localPort
          })}`
        )
    }
  }
}
