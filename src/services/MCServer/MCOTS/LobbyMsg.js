// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { debug } = require('../../@drazisil/mco-logger')
const { LobbyInfoPacket } = require('./LobbyInfo')

/**
 * @class
 * @property {number} msgNo
 * @property {number} noLobbies
 * @property {0 | 1} moreToCome
 * @property {LobbyInfoPacket} lobbyList
 * @property {number} dataLength
 * @property {Buffer} data
 */
class LobbyMsg {
  /**
   *
   */
  constructor () {
    this.msgNo = 325

    this.noLobbies = 1
    this.moreToCome = 0

    this.lobbyList = new LobbyInfoPacket()
    // this.dataLength = 572;
    this.dataLength = this.lobbyList.toPacket().length + 5

    this.data = Buffer.alloc(this.dataLength)
    this.data.writeInt16LE(this.msgNo, 0)
    this.data.writeInt16LE(this.noLobbies, 2)
    this.data.writeInt8(this.moreToCome, 4)
    this.lobbyList.toPacket().copy(this.data, 5)
    this.serviceName = 'mcoserver:LobbyMsg'
  }

  /**
   *
   * @return {Buffer}
   */
  serialize () {
    return this.data
  }

  /**
   * dumpPacket
   * @returns {void}
   */
  dumpPacket () {
    debug(
      `LobbyMsg',
      ${{
        msgNo: this.msgNo,
        dataLength: this.dataLength,
        packet: this.serialize().toString('hex')
      }}`, { service: this.serviceName }
    )
  }
}
module.exports.LobbyMsg = LobbyMsg
