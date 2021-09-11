/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-check
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Logger } from '@drazisil/mco-logger'
import { NPSMessage } from 'transactions'
import { Buffer } from 'buffer'
import { NPSMessageFactory } from '../transactions/nps-message-factory'

const { log } = Logger.getInstance()

/**
 */

/**
 * @class
 * @extends {NPSMessage}
 * @property {number} userId
 * @property {Buffer} userName
 * @property {Buffer} userData
 */
export class NPSUserInfo {
  /**
   *
   * @param {NPSMessage} message
   * @returns {NPSUserInfo}
   */
  static fromMessage(message) {
    return new NPSUserInfo(message.direction)
  }

  /**
   *
   * @param {import('types').EMessageDirection} direction
   */
  constructor(direction) {
    this.msgNo = 0
    this.msgVersion = 0
    this.reserved = 0
    this.content = Buffer.from([0x01, 0x02, 0x03, 0x04])
    this.msgLength = this.content.length + 12
    this.direction = direction
    this.serviceName = 'mcoserver:NPSUserInfo'
    this.messageType = 'NPSUserInfo'
    this.userId = 0
    this.userName = Buffer.from([0x00]) // 30 length
    this.userData = Buffer.from([0x00]) // 64 length
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
        throw new TypeError(
          `[${this.messageType}] Error in serialize(): ${error}`,
        )
      }

      throw new Error(
        `[${this.messageType}] Error in serialize(), error unknown`,
      )
    }
  }

  /**
   *
   * @param {Buffer} rawData
   * @return {NPSUserInfo}
   */
  deserialize(rawData) {
    this.userId = rawData.readInt32BE(4)
    this.userName = rawData.slice(8, 38)
    this.userData = rawData.slice(38)
    return this
  }

  /**
   * @return {void}
   */
  dumpInfo() {
    NPSMessageFactory.dumpPacketHeader(this)
    log('debug', `UserId:        ${this.userId}`, { service: this.serviceName })
    log('debug', `UserName:      ${this.userName.toString()}`, {
      service: this.serviceName,
    })
    log('debug', `UserData:      ${this.userData.toString('hex')}`, {
      service: this.serviceName,
    })
    log('debug', '[/NPSUserInfo]======================================', {
      service: this.serviceName,
    })
  }
}
