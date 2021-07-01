// @ts-check
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { debug } from '@drazisil/mco-logger'
import { NPSMsg } from '../MCOTS/nps-msg.js'

/**
 * @module NPSUserInfo
 */

/**
 * @class
 * @extends {NPSMsg}
 * @property {number} userId
 * @property {Buffer} userName
 * @property {Buffer} userData
 */
class NPSUserInfo extends NPSMsg {
  /**
   *
   * @param {MESSAGE_DIRECTION} direction
   */
  constructor(direction) {
    super(direction)
    this.userId = 0
    this.userName = Buffer.from([0x00]) // 30 length
    this.userData = Buffer.from([0x00]) // 64 length
    this.serviceName = 'mcoserver:NPSUserInfo'
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
   * @returns {void}
   */
  dumpInfo() {
    this.dumpPacketHeader('NPSUserInfo')
    debug(`UserId:        ${this.userId}`, { service: this.serviceName })
    debug(`UserName:      ${this.userName.toString()}`, {
      service: this.serviceName,
    })
    debug(`UserData:      ${this.userData.toString('hex')}`, {
      service: this.serviceName,
    })
    debug('[/NPSUserInfo]======================================', {
      service: this.serviceName,
    })
  }
}
const _NPSUserInfo = NPSUserInfo
export { _NPSUserInfo as NPSUserInfo }
