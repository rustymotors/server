// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { ConnectionObj } from '../ConnectionObj'
import { MessageNode, MESSAGE_DIRECTION } from './MessageNode'
import { GenericReplyMsg } from '../GenericReplyMsg'
// import { LobbyMsg } from './LobbyMsg'
import { LoginMsg } from './LoginMsg'

// eslint-disable-next-line no-unused-vars
import { Logger } from 'winston'

import debug from 'debug'

/**
 * Mangages the game database server
 * @module MCOTSServer
 */

/**
 *
 */
export class MCOTServer {
  logger: Logger

  /**
   * Creates an instance of MCOTServer.
   * @class
   * @param {Logger} logger
   * @memberof MCOTServer
   */
  constructor (logger: Logger) {
    this.logger = logger
  }

  /**
   * Return the string representation of the numeric opcode
   *
   * @param {number} msgID
   * @return {string}
   * @memberof! MCOTServer
   */
  _MSG_STRING (msgID: number): string {
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
   */
  async _login (con: ConnectionObj, node: MessageNode): Promise<{con: ConnectionObj, nodes: MessageNode[]}> {
    /*
     * Let's turn it into a LoginMsg
     */
    const loginMsg = new LoginMsg(node.data)

    // Update the appId
    loginMsg.appId = con.appId

    loginMsg.dumpPacket()

    // Create new response packet
    const pReply = new GenericReplyMsg()
    pReply.msgNo = 213
    pReply.msgReply = 105
    pReply.appId = con.appId
    const rPacket = new MessageNode(MESSAGE_DIRECTION.SENT)

    rPacket.deserialize(node.serialize())
    rPacket.updateBuffer(pReply.serialize())
    rPacket.dumpPacket()

    return { con, nodes: [rPacket] }
  }

  /**
   *
   * @param {ConnectionObj} con
   * @param {MessageNode} node
   */
  async _getLobbies (con: ConnectionObj, node: MessageNode): Promise<{con: ConnectionObj, nodes: MessageNode[]}> {
    debug('mcoserver:MCOTSServer')('In _getLobbies...')
    const lobbiesListMsg = node

    // Update the appId
    lobbiesListMsg.appId = con.appId

    // Dump the packet
    debug('mcoserver:MCOTSServer')('Dumping request...')
    debug('mcoserver:MCOTSServer')(lobbiesListMsg)

    // Create new response packet
    // const lobbyMsg = new LobbyMsg()

    const pReply = new GenericReplyMsg()
    pReply.msgNo = 325
    pReply.msgReply = 324
    const rPacket = new MessageNode(MESSAGE_DIRECTION.SENT)
    rPacket.flags = 9

    const lobby = Buffer.alloc(12)
    lobby.writeInt32LE(325, 0)
    lobby.writeInt32LE(0, 4)
    lobby.writeInt32LE(0, 8)

    rPacket.updateBuffer(pReply.serialize())

    // rPacket.deserialize(node.serialize())

    // // Set the data of the GenericReplyMsg to the LobbyMsg
    // pReply.setData(lobbyMsg.serialize())
    // rPacket.updateBuffer(lobbyMsg.serialize())

    // // Set the AppId
    // rPacket.appId = con.appId

    // // Dump the packet
    debug('mcoserver:MCOTSServer')('Dumping response...')
    debug('mcoserver:MCOTSServer')(rPacket)

    return { con, nodes: [rPacket] }
  }

  /**
   *
   * @param {module:ConnectionObj} con
   * @param {module:MessageNode} node
   * @return {Promise<MCOTS_Session>}
   */
  async _logout (con: ConnectionObj, node: MessageNode): Promise<{con: ConnectionObj, nodes: MessageNode[]}> {
    const logoutMsg = node

    logoutMsg.data = node.serialize()

    // Update the appId
    logoutMsg.appId = con.appId

    // Create new response packet
    const pReply = new GenericReplyMsg()
    pReply.msgNo = 101
    pReply.msgReply = 106
    const rPacket = new MessageNode(MESSAGE_DIRECTION.SENT)

    rPacket.deserialize(node.serialize())
    rPacket.updateBuffer(pReply.serialize())
    rPacket.dumpPacket()

    /** @type MessageNode[] */
    const nodes: MessageNode[] = []

    return { con, nodes }
  }

  /**
   *
   * @param {module:ConnectionObj} con
   * @param {module:MessageNode} node
   */
  async _setOptions (con: ConnectionObj, node: MessageNode): Promise<{con: ConnectionObj, nodes: MessageNode[]}> {
    const setOptionsMsg = node

    setOptionsMsg.data = node.serialize()

    // Update the appId
    setOptionsMsg.appId = con.appId

    // Create new response packet
    const pReply = new GenericReplyMsg()
    pReply.msgNo = 101
    pReply.msgReply = 109
    const rPacket = new MessageNode(MESSAGE_DIRECTION.SENT)

    rPacket.deserialize(node.serialize())
    rPacket.updateBuffer(pReply.serialize())
    rPacket.dumpPacket()

    return { con, nodes: [rPacket] }
  }

  /**
   *
   * @param {module:ConnectionObj} con
   * @param {module:MessageNode.MessageNode} node
   */
  async _trackingMessage (con: ConnectionObj, node: MessageNode): Promise<{con: ConnectionObj, nodes: MessageNode[]}> {
    const trackingMsg = node

    trackingMsg.data = node.serialize()

    // Update the appId
    trackingMsg.appId = con.appId

    // Create new response packet
    const pReply = new GenericReplyMsg()
    pReply.msgNo = 101
    pReply.msgReply = 440
    const rPacket = new MessageNode(MESSAGE_DIRECTION.SENT)

    rPacket.deserialize(node.serialize())
    rPacket.updateBuffer(pReply.serialize())
    rPacket.dumpPacket()

    return { con, nodes: [rPacket] }
  }

  /**
   *
   * @param {module:ConnectionObj} con
   * @param {module:MessageNode} node
   */
  async _updatePlayerPhysical (con: ConnectionObj, node: MessageNode): Promise<{con: ConnectionObj, nodes: MessageNode[]}> {
    const updatePlayerPhysicalMsg = node

    updatePlayerPhysicalMsg.data = node.serialize()

    // Update the appId
    updatePlayerPhysicalMsg.appId = con.appId

    // Create new response packet
    const pReply = new GenericReplyMsg()
    pReply.msgNo = 101
    pReply.msgReply = 266
    const rPacket = new MessageNode(MESSAGE_DIRECTION.SENT)

    rPacket.deserialize(node.serialize())
    rPacket.updateBuffer(pReply.serialize())
    rPacket.dumpPacket()

    return { con, nodes: [rPacket] }
  }
}
