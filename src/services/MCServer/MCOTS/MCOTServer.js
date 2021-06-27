// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { log } from '@drazisil/mco-logger'
import { MessageNode } from './MessageNode.js'
import { GenericReplyMsg } from '../GenericReplyMsg.js'

/**
 * Mangages the game database server
 * @module MCOTSServer
 */

/**
 * @class
 * @property {module:MCO_Logger.logger} logger
 */
class MCOTServer {
  /**
   * Creates an instance of MCOTServer.
   * @class
   * @param {module:MCO_Logger.logger} logger
   */
  constructor (logger) {
    this.logger = logger
  }

  /**
   * Return the string representation of the numeric opcode
   *
   * @param {number} msgID
   * @return {string}
   */
  _MSG_STRING (msgID) {
    switch (msgID) {
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
   * @param {ConnectionObj} con
   * @param {MessageNode} node
   * @returns {Promise<{con: ConnectionObj, nodes: MessageNode[]}>}
   */
  async _login (con, node) {

    // Create new response packet
    const pReply = new GenericReplyMsg()
    pReply.msgNo = 213
    pReply.msgReply = 105
    pReply.appId = con.appId
    const rPacket = new MessageNode('SENT')

    rPacket.deserialize(node.serialize())
    rPacket.updateBuffer(pReply.serialize())
    rPacket.dumpPacket()

    return { con, nodes: [rPacket] }
  }

  /**
   *
   * @param {ConnectionObj} con
   * @param {MessageNode} node
   * @returns {Promise<{con: ConnectionObj, nodes: MessageNode[]}>}
   */
  async _getLobbies (con, node) {
    log('In _getLobbies...', { service: 'mcoserver:MCOTSServer', level: 'debug' })
    const lobbiesListMsg = node

    // Update the appId
    lobbiesListMsg.appId = con.appId

    // Dump the packet
    log('Dumping request...', { service: 'mcoserver:MCOTSServer', level: 'debug' })
    log(lobbiesListMsg, { service: 'mcoserver:MCOTSServer', level: 'debug' })

    // Create new response packet
    // const lobbyMsg = new LobbyMsg()

    const pReply = new GenericReplyMsg()
    pReply.msgNo = 325
    pReply.msgReply = 324
    const rPacket = new MessageNode('SENT')
    rPacket.flags = 9

    const lobby = Buffer.alloc(12)
    lobby.writeInt32LE(325, 0)
    lobby.writeInt32LE(0, 4)
    lobby.writeInt32LE(0, 8)

    rPacket.updateBuffer(pReply.serialize())

    // // Dump the packet
    log('Dumping response...', { service: 'mcoserver:MCOTSServer', level: 'debug' })
    log(rPacket, { service: 'mcoserver:MCOTSServer', level: 'debug' })

    return { con, nodes: [rPacket] }
  }

  /**
   *
   * @param {module:ConnectionObj} con
   * @param {module:MessageNode} node
   * @return {Promise<{con: ConnectionObj, nodes: MessageNode[]}>}
   */
  async _logout (con, node) {
    const logoutMsg = node

    logoutMsg.data = node.serialize()

    // Update the appId
    logoutMsg.appId = con.appId

    // Create new response packet
    const pReply = new GenericReplyMsg()
    pReply.msgNo = 101
    pReply.msgReply = 106
    const rPacket = new MessageNode('SENT')

    rPacket.deserialize(node.serialize())
    rPacket.updateBuffer(pReply.serialize())
    rPacket.dumpPacket()

    /** @type MessageNode[] */
    const nodes = []

    return { con, nodes }
  }

  /**
   *
   * @param {ConnectionObj} con
   * @param {MessageNode} node
   * @returns {Promise<{con: ConnectionObj, nodes: MessageNode[]}>}
   */
  async _setOptions (con, node) {
    const setOptionsMsg = node

    setOptionsMsg.data = node.serialize()

    // Update the appId
    setOptionsMsg.appId = con.appId

    // Create new response packet
    const pReply = new GenericReplyMsg()
    pReply.msgNo = 101
    pReply.msgReply = 109
    const rPacket = new MessageNode('SENT')

    rPacket.deserialize(node.serialize())
    rPacket.updateBuffer(pReply.serialize())
    rPacket.dumpPacket()

    return { con, nodes: [rPacket] }
  }

  /**
   *
   * @param {ConnectionObj} con
   * @param {MessageNode} node
   * @returns {Promise<{con: ConnectionObj, nodes: MessageNode[]}>}
   */
  async _trackingMessage (con, node) {
    const trackingMsg = node

    trackingMsg.data = node.serialize()

    // Update the appId
    trackingMsg.appId = con.appId

    // Create new response packet
    const pReply = new GenericReplyMsg()
    pReply.msgNo = 101
    pReply.msgReply = 440
    const rPacket = new MessageNode('SENT')

    rPacket.deserialize(node.serialize())
    rPacket.updateBuffer(pReply.serialize())
    rPacket.dumpPacket()

    return { con, nodes: [rPacket] }
  }

  /**
   *
   * @param {module:ConnectionObj} con
   * @param {module:MessageNode} node
   * @returns {Promise<{con: ConnectionObj, nodes: MessageNode[]}>}
   */
  async _updatePlayerPhysical (con, node) {
    const updatePlayerPhysicalMsg = node

    updatePlayerPhysicalMsg.data = node.serialize()

    // Update the appId
    updatePlayerPhysicalMsg.appId = con.appId

    // Create new response packet
    const pReply = new GenericReplyMsg()
    pReply.msgNo = 101
    pReply.msgReply = 266
    const rPacket = new MessageNode('SENT')

    rPacket.deserialize(node.serialize())
    rPacket.updateBuffer(pReply.serialize())
    rPacket.dumpPacket()

    return { con, nodes: [rPacket] }
  }
}
const _MCOTServer = MCOTServer
export { _MCOTServer as MCOTServer }
