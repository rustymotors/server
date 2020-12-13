// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const debug = require('debug')('mcoserver:npsUserInfo')
const appSettings = require('../../../../config/app-settings')
const logger = require('../../../shared/logger')
const { NPSMsg } = require('../MCOTS/NPSMsg')

/**
 *
 * @extends {NPSMsg}
 */
class NPSUserInfo extends NPSMsg {
  /**
   *
   * @param {'Recieved'|'Sent'} direction
   */
  constructor (direction) {
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
    debug(`UserId:        ${this.userId}`)
    debug(`UserName:      ${this.userName.toString()}`)
    debug(`UserData:      ${this.userData.toString('hex')}`)
    debug('[/NPSUserInfo]======================================')
  }
}

module.exports = {
  NPSUserInfo
}
