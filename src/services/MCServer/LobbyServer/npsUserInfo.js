// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { NPSMsg } = require('../MCOTS/NPSMsg')
const { Logger } = require('../../shared/loggerManager')

export class NPSUserInfo extends NPSMsg {
  /**
   *
   * @param {'Recieved'|'Sent'} direction
   */
  constructor (direction) {
    super(direction)
    this.logger = new Logger().getLogger('NPSUserInfo')
    this.userId = 0
    this.userName = Buffer.from([0x00]) // 30 length
    this.userData = Buffer.from([0x00]) // 64 length
  }

  /**
   *
   * @param {Buffer} rawData
   */
  deserialize (rawData) {
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
    this.logger.debug(`UserId:        ${this.userId}`)
    this.logger.debug(`UserName:      ${this.userName.toString()}`)
    this.logger.debug(`UserData:      ${this.userData.toString('hex')}`)
    this.logger.debug('[/NPSUserInfo]======================================')
  }
}

module.exports = {
  NPSUserInfo
}
