// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { logger } from 'mcos-shared/logger'
import { DatabaseManager } from 'mcos-database'
import { LobbyServer } from 'mcos-lobby'
import { recieveLoginData } from 'mcos-login'
import { TCPConnection } from './tcpConnection.js'
import { recievePersonaData } from 'mcos-persona'

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
   * @param {import("mcos-shared/types").UnprocessedPacket} rawPacket
   * @return {Promise<import("mcos-core").TCPConnection>}
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
      case 8226: {
        // Migrate to BufferWithConnection
        /** @type {import('mcos-shared/types').BufferWithConnection} */
        const inboundConnection = {
          connectionId: rawPacket.connectionId,
          connection: {
            socket: rawPacket.connection.sock,
            seq: 0,
            id: rawPacket.connectionId,
            appId: rawPacket.connection.appId,
            lastMsg: rawPacket.connection.lastMsg,
            inQueue: rawPacket.connection.inQueue
          },
          data: rawPacket.data,
          timestamp: rawPacket.timestamp
        }
        const result = await recieveLoginData(inboundConnection)
        log.debug('Back in packet manager with port 8226')
        if (result.data && !result.errMessage) {
        // Migrate back to TCPConnection
          const outboundConnection = new TCPConnection(result.data.connectionId, result.data.connection.socket)
          return outboundConnection
        }
        throw new Error(`Error with login results: ${result.errMessage}`)
      }
      case 8228: {
        // Migrate to a BufferWithConnection
        /** @type {import('mcos-shared/types').BufferWithConnection} */
        const dataConnection = {
          connectionId: rawPacket.connectionId,
          /** @type {import('mcos-shared/types').SocketWithConnectionInfo} */
          connection: {
            socket: rawPacket.connection.sock,
            seq: 0,
            id: rawPacket.connectionId,
            appId: rawPacket.connection.appId,
            lastMsg: rawPacket.connection.lastMsg,
            inQueue: rawPacket.connection.inQueue

          },
          data: rawPacket.data,
          timestamp: rawPacket.timestamp

        }
        const result = await recievePersonaData(dataConnection)
        log.debug('Back from dataHandler with port 8228')
        if (result.data && !result.errMessage) {
          // Migrate back to TCPConnection
          const outboundConnection = new TCPConnection(result.data.connectionId, result.data.connection.socket)
          return outboundConnection
        }
        throw new Error(`Error with persona results: ${result.errMessage}`)
      }
      case 7003: {
        const result = this.lobbyServer.dataHandler(rawPacket)
        log.debug('Back from dataHandler with port 7003')
        return result
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
