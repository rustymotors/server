// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Logger } from 'winston'
import { logger } from '../../../shared/logger'
import { MESSAGE_DIRECTION } from '../MCOTS/MessageNode'
import { NPSMsg } from '../MCOTS/NPSMsg'
import debug from 'debug'

/**
 *
 * @extends {NPSMsg}
 */
export class NPSUserInfo extends NPSMsg {
  logger: Logger
  userId: number
  userName: Buffer
  userData: Buffer

  /**
   *
   * @param {'Recieved'|'Sent'} direction
   */
  constructor (direction: MESSAGE_DIRECTION) {
    super(direction)
    this.logger = logger.child({ service: 'mcoserver:NPSUserInfo' })
    this.userId = 0
    this.userName = Buffer.from([0x00]) // 30 length
    this.userData = Buffer.from([0x00]) // 64 length
  }

  /**
   *
   * @param {Buffer} rawData
   * @return {NPSUserInfo}
   */
  deserialize (rawData: Buffer) {
    this.userId = rawData.readInt32BE(4)
    this.userName = rawData.slice(8, 38)
    this.userData = rawData.slice(38)
    return this
  }

  /**
   *
   */
  dumpInfo () {
    this.dumpPacketHeader('NPSUserInfo')
    debug('mcoserver:npsUserInfo')(`UserId:        ${this.userId}`)
    debug('mcoserver:npsUserInfo')(`UserName:      ${this.userName.toString()}`)
    debug('mcoserver:npsUserInfo')(`UserData:      ${this.userData.toString('hex')}`)
    debug('mcoserver:npsUserInfo')('[/NPSUserInfo]======================================')
  }
}
