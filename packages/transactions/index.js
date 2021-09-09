// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
import { Logger } from '@drazisil/mco-logger'
import { Buffer } from 'buffer'
import { defaultHandler } from './tcp-manager.js'

import { GenericReplyMessage } from 'core'
import { MessageNode } from './message-node.js'
import { ClientConnectMessage } from './client-connect-msg.js'
import { StockCar } from './stock-car.js'
import { StockCarInfoMessage } from './stock-car-info-msg.js'
import { NPSMessage } from './nps-msg.js'

const { log } = Logger.getInstance()

/**
 * Mangages the game database server
 */

/**
 * @class
 * @property {module:MCO_Logger.logger} logger
 */
export class MCOTServer {
  /** @type {MCOTServer} */
  static _instance

  static getInstance() {
    if (!MCOTServer._instance) {
      MCOTServer._instance = new MCOTServer(false)
    }
    return MCOTServer._instance
  }

  constructor(isNew = true) {
    if (isNew) {
      throw new Error('Please use getInstance()')
    }
  }
  /**
   * Return the string representation of the numeric opcode
   *
   * @param {number} messageID
   * @return {string}
   */
  _MSG_STRING(messageID) {
    switch (messageID) {
      case 105:
        return 'MC_LOGIN'
      case 106:
        return 'MC_LOGOUT'
      case 109:
        return 'MC_SET_OPTIONS'
      case 141:
        return 'MC_STOCK_CAR_INFO'
      case 213:
        return 'MC_LOGIN_COMPLETE'
      case 266:
        return 'MC_UPDATE_PLAYER_PHYSICAL'
      case 324:
        return 'MC_GET_LOBBIES'
      case 325:
        return 'MC_LOBBIES'
      case 438:
        return 'MC_CLIENT_CONNECT_MSG'
      case 440:
        return 'MC_TRACKING_MSG'

      default:
        return 'Unknown'
    }
  }

  /**
   *
   * @param {import('types').ITCPConnection} connection
   * @param {import('types').IMessageNode} node
   * @return {Promise<import('types').ConnectionWithPackets>}
   */
  async _login(connection, node) {
    // Create new response packet
    const pReply = new GenericReplyMessage()
    pReply.msgNo = 213
    pReply.msgReply = 105
    pReply.appId = connection.appId
    const rPacket = new MessageNode('Sent')

    rPacket.deserialize(node.serialize())
    rPacket.updateBuffer(pReply.serialize())
    rPacket.dumpPacket()

    return { connection, packetList: [rPacket] }
  }

  /**
   *
   * @param {import('types').ITCPConnection} connection
   * @param {import('types').IMessageNode} node
   * @return {Promise<import('types').ConnectionWithPackets>}
   */
  async _getLobbies(connection, node) {
    log('debug', 'In _getLobbies...', {
      service: 'mcoserver:MCOTSServer',
    })
    const lobbiesListMessage = node

    // Update the appId
    lobbiesListMessage.appId = connection.appId

    // Dump the packet
    log('debug', 'Dumping request...', {
      service: 'mcoserver:MCOTSServer',
    })
    log('debug', JSON.stringify(lobbiesListMessage), {
      service: 'mcoserver:MCOTSServer',
    })

    // Create new response packet
    // const lobbyMsg = new LobbyMsg()

    const pReply = new GenericReplyMessage()
    pReply.msgNo = 325
    pReply.msgReply = 324
    const rPacket = new MessageNode('Sent')
    rPacket.flags = 9

    const lobby = Buffer.alloc(12)
    lobby.writeInt32LE(325, 0)
    lobby.writeInt32LE(0, 4)
    lobby.writeInt32LE(0, 8)

    rPacket.updateBuffer(pReply.serialize())

    // // Dump the packet
    log('debug', 'Dumping response...', {
      service: 'mcoserver:MCOTSServer',
    })
    log('debug', JSON.stringify(rPacket), {
      service: 'mcoserver:MCOTSServer',
    })

    return { connection, packetList: [rPacket] }
  }

  /**
   *
   * @param {import('types').ITCPConnection} connection
   * @param {import('types').IMessageNode} node
   * @return {Promise<import('types').ConnectionWithPackets>}
   */
  async _logout(connection, node) {
    const logoutMessage = node

    logoutMessage.data = node.serialize()

    // Update the appId
    logoutMessage.appId = connection.appId

    // Create new response packet
    const pReply = new GenericReplyMessage()
    pReply.msgNo = 101
    pReply.msgReply = 106
    const rPacket = new MessageNode('Sent')

    rPacket.deserialize(node.serialize())
    rPacket.updateBuffer(pReply.serialize())
    rPacket.dumpPacket()

    /** @type {MessageNode[]} */
    const nodes = []

    return { connection, packetList: nodes }
  }

  /**
   *
   * @param {import('types').ITCPConnection} connection
   * @param {import('types').IMessageNode} node
   * @return {Promise<import('types').ConnectionWithPackets>}
   */
  async _setOptions(connection, node) {
    const setOptionsMessage = node

    setOptionsMessage.data = node.serialize()

    // Update the appId
    setOptionsMessage.appId = connection.appId

    // Create new response packet
    const pReply = new GenericReplyMessage()
    pReply.msgNo = 101
    pReply.msgReply = 109
    const rPacket = new MessageNode('Sent')

    rPacket.deserialize(node.serialize())
    rPacket.updateBuffer(pReply.serialize())
    rPacket.dumpPacket()

    return { connection, packetList: [rPacket] }
  }

  /**
   *
   * @param {import('types').ITCPConnection} connection
   * @param {import('types').IMessageNode} node
   * @return {Promise<import('types').ConnectionWithPackets>}
   */
  async _trackingMessage(connection, node) {
    const trackingMessage = node

    trackingMessage.data = node.serialize()

    // Update the appId
    trackingMessage.appId = connection.appId

    // Create new response packet
    const pReply = new GenericReplyMessage()
    pReply.msgNo = 101
    pReply.msgReply = 440
    const rPacket = new MessageNode('Sent')

    rPacket.deserialize(node.serialize())
    rPacket.updateBuffer(pReply.serialize())
    rPacket.dumpPacket()

    return { connection, packetList: [rPacket] }
  }

  /**
   *
   * @param {import('types').ITCPConnection} connection
   * @param {import('types').IMessageNode} node
   * @return {Promise<import('types').ConnectionWithPackets>}
   */
  async _updatePlayerPhysical(connection, node) {
    const updatePlayerPhysicalMessage = node

    updatePlayerPhysicalMessage.data = node.serialize()

    // Update the appId
    updatePlayerPhysicalMessage.appId = connection.appId

    // Create new response packet
    const pReply = new GenericReplyMessage()
    pReply.msgNo = 101
    pReply.msgReply = 266
    const rPacket = new MessageNode('Sent')

    rPacket.deserialize(node.serialize())
    rPacket.updateBuffer(pReply.serialize())
    rPacket.dumpPacket()

    return { connection, packetList: [rPacket] }
  }
}

export {
  defaultHandler,
  ClientConnectMessage,
  MessageNode,
  StockCar,
  StockCarInfoMessage,
  NPSMessage,
}
