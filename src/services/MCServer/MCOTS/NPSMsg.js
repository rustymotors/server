// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { logger } = require('../../../shared/logger')
const debug = require('debug')

/**
 * Packet container for NPS messages
 * @module NPSMsg
 */

/**
   *
   * @global
   * @typedef {Object} INPSMsgJSON
   * @property {number} msgNo
   * @property {number | null} opCode
   * @property {number} msgLength
   * @property {number} msgVersion
   * @property {string} content
   * @property {string} contextId
   * @property {module:MessageNode.MESSAGE_DIRECTION} direction
   * @property {string | null } sessionkey
   * @property {string} rawBuffer
   */

/*
    NPS messages are sent serialized in BE format
*/

// WORD msgNo;    NPS message number

/**
 * @class
 * @property {module:MCO_Logger.logger} logger
 * @property {number} msgNo
 * @property {number} msgVersion
 * @property {number} reserved
 * @property {Buffer} content
 * @property {number} msgLength
 * @property {MESSAGE_DIRECTION} direction
 */
class NPSMsg {

  /**
   *
   * @param {module:MessageNode.MESSAGE_DIRECTION} direction - the direction of the message flow
   */
  constructor (direction) {
    this.logger = logger.child({ service: 'mcoserver:NPSMsg' })
    this.msgNo = 0
    this.msgVersion = 0
    this.reserved = 0
    this.content = Buffer.from([0x01, 0x02, 0x03, 0x04])
    this.msgLength = this.content.length + 12
    if (direction !== 'RECEIVED' && direction !== 'SENT') {
      throw new Error(`Directior must be either 'RECEIVED' or 'SENT'`)
    }
    this.direction = direction
  }

  /**
   *
   * @param {Buffer} buffer
   * @returns {void}
   */
  setContent (buffer) {
    this.content = buffer
    this.msgLength = this.content.length + 12
  }

  /**
   *
   * @return {Buffer}
   */
  getContentAsBuffer () {
    return this.content
  }

  /**
   *
   * @return {string}
   */
  getPacketAsString () {
    return this.serialize().toString('hex')
  }

  /**
   *
   * @return {Buffer}
   */
  serialize () {
    try {
      const packet = Buffer.alloc(this.msgLength)
      packet.writeInt16BE(this.msgNo, 0)
      packet.writeInt16BE(this.msgLength, 2)
      if (this.msgLength > 4) {
        packet.writeInt16BE(this.msgVersion, 4)
        packet.writeInt16BE(this.reserved, 6)
      }
      if (this.msgLength > 8) {
        packet.writeInt32BE(this.msgLength, 8)
        this.content.copy(packet, 12)
      }
      return packet
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`[NPSMsg] Error in serialize(): ${error}`)
      }
      throw new Error(`[NPSMsg] Error in serialize(), error unknown`)
    }
  }

  /**
   *
   * @param {Buffer} packet
   * @return {NPSMsg}
   * @memberof NPSMsg
   */
  deserialize (packet) {
    this.msgNo = packet.readInt16BE(0)
    this.msgLength = packet.readInt16BE(2)
    this.msgVersion = packet.readInt16BE(4)
    this.content = packet.slice(12)
    return this
  }

  /**
   *
   * @param {string} messageType
   * @returns {void}
   */
  dumpPacketHeader (messageType) {
    this.logger.info(
      `NPSMsg/${messageType}`,
      {
        direction: this.direction,
        msgNo: this.msgNo.toString(16),
        msgVersion: this.msgVersion,
        msgLength: this.msgLength
      }
    )
  }

  /**
   * dumpPacket
   * @returns {void}
   * @memberof NPSMsg
   */
  dumpPacket () {
    debug('mcoserver:NPSMsg')(
      'NPSMsg/NPSMsg',
      {
        direction: this.direction,
        msgNo: this.msgNo.toString(16),
        msgVersion: this.msgVersion,
        msgLength: this.msgLength,
        content: this.content.toString('hex'),
        serialized: this.serialize().toString('hex')
      }
    )
  }

  /**
   *
   * @return {INPSMsgJSON}
   */
  toJSON () {
    return {
      msgNo: this.msgNo,
      contextId: '',
      msgLength: this.msgLength,
      msgVersion: this.msgVersion,
      content: this.content.toString('hex'),
      direction: this.direction,
      rawBuffer: this.content.toString('hex'),
      opCode: 0,
      sessionkey: ''
    }
  }
}
module.exports.NPSMsg = NPSMsg
