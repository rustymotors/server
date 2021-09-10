/* eslint-disable @typescript-eslint/no-unused-vars */
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Logger } from '@drazisil/mco-logger'
import { Buffer } from 'buffer'
import { NPSUserInfo } from 'lobby'
import { NPSMessage } from './nps-msg'

const { log } = Logger.getInstance()

export class NPSMessageFactory {
  constructor() {
    throw new Error('Please use the status methods')
  }

  /**
   *
   * @param {'NPMessage' | 'NPSUserInfo'} messageType
   * @param {Buffer} packetBuffer
   * @returns {import('types').INPSMessage | import('types').INPSUserInfo}
   */
  static createMessageFromPacket(messageType, packetBuffer) {
    const message = new NPSMessage('Recieved')

    switch (messageType) {
      case 'NPSUserInfo': {
        /** @type {import('types').INPSUserInfo} */
        const messageUserInfo = NPSUserInfo.fromMessage(message)
        messageUserInfo.userId = 0
        messageUserInfo.userName = Buffer.from([0x00]) // 30 length
        messageUserInfo.userData = Buffer.from([0x00]) // 64 length
        messageUserInfo.serviceName = 'mcoserver:NPSUserInfo'
        return messageUserInfo
      }
    }
    return message
  }

  /**
   *
   * @param {import('types').INPSMessage} message
   * @param {string} messageType
   * @return {void}
   */
  static dumpPacketHeader(message, messageType) {
    log(
      'info',
      `NPSMsg/${message.messageType},
        ${JSON.stringify({
          direction: message.direction,
          msgNo: message.msgNo.toString(16),
          msgVersion: message.msgVersion,
          msgLength: message.msgLength,
        })}`,
      { service: message.serviceName },
    )
  }

  /**
   * @param {import('types').INPSMessage} message
   * @return {string}
   */
  static getPacketAsString(message) {
    return message.serialize().toString('hex')
  }
}
