/* eslint-disable @typescript-eslint/no-unused-vars */
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Logger } from '@drazisil/mco-logger'
import { Buffer } from 'buffer'

const { log } = Logger.getInstance()

/**
 * @global
 * @typedef {"Recieved" | "Sent" } EMessageDirection
 */

/**
 * Packet container for NPS messages
 */

/*
    NPS messages are sent serialized in BE format
*/

// WORD msgNo;    NPS message number

/**
 * @class
 * @property {number} msgNo
 * @property {number} msgVersion
 * @property {number} reserved
 * @property {Buffer} content
 * @property {number} msgLength
 * @property {EMessageDirection} direction
 */
export class NPSMessage {
  msgNo
  msgVersion
  reserved
  content
  msgLength
  direction
  serviceName
  /**
   *
   * @param {EMessageDirection} direction - the direction of the message flow
   */
  constructor(direction) {
    this.msgNo = 0
    this.msgVersion = 0
    this.reserved = 0
    this.content = Buffer.from([0x01, 0x02, 0x03, 0x04])
    this.msgLength = this.content.length + 12
    this.direction = direction
    this.serviceName = 'mcoserver:NPSMsg'
  }

  /**
   *
   * @param {Buffer} buffer
   * @return {void}
   */
  setContent(buffer) {
    this.content = buffer
    this.msgLength = this.content.length + 12
  }

  /**
   *
   * @return {Buffer}
   */
  getContentAsBuffer() {
    return this.content
  }

  /**
   *
   * @return {string}
   */
  getPacketAsString() {
    return this.serialize().toString('hex')
  }

  /**
   *
   * @return {Buffer}
   */
  serialize() {
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
        throw new TypeError(`[NPSMsg] Error in serialize(): ${error}`)
      }

      throw new Error('[NPSMsg] Error in serialize(), error unknown')
    }
  }

  /**
   *
   * @param {Buffer} packet
   * @return {NPSMessage}
   */
  deserialize(packet) {
    this.msgNo = packet.readInt16BE(0)
    this.msgLength = packet.readInt16BE(2)
    this.msgVersion = packet.readInt16BE(4)
    this.content = packet.slice(12)
    return this
  }

  /**
   *
   * @param {string} messageType
   * @return {void}
   */
  dumpPacketHeader(messageType) {
    log(
      'info',
      `NPSMsg/${messageType},
      ${JSON.stringify({
        direction: this.direction,
        msgNo: this.msgNo.toString(16),
        msgVersion: this.msgVersion,
        msgLength: this.msgLength,
      })}`,
      { service: this.serviceName },
    )
  }

  /**
   * DumpPacket
   * @return {void}
   */
  dumpPacket() {
    log(
      'debug',
      `NPSMsg/NPSMsg,
      ${JSON.stringify({
        direction: this.direction,
        msgNo: this.msgNo.toString(16),
        msgVersion: this.msgVersion,
        msgLength: this.msgLength,
        content: this.content.toString('hex'),
        serialized: this.serialize().toString('hex'),
      })}`,
      { service: this.serviceName },
    )
  }

  /**
   *
   * @return {import('types').INPSMessageJSON}
   */
  toJSON() {
    return {
      msgNo: this.msgNo,
      contextId: '',
      msgLength: this.msgLength,
      msgVersion: this.msgVersion,
      content: this.content.toString('hex'),
      direction: this.direction,
      rawBuffer: this.content.toString('hex'),
      opCode: 0,
      sessionkey: '',
    }
  }
}
