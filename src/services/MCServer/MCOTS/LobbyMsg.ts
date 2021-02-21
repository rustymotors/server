// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { LobbyInfoPacket } from './LobbyInfo'
import debug from 'debug'

/**
 *
 */
export class LobbyMsg {
  msgNo: number
  noLobbies: number
  moreToCome: number
  lobbyList: LobbyInfoPacket
  dataLength: number
  data: Buffer

  /**
   *
   */
  constructor () {
    this.msgNo = 325

    /** @type {0|1} */
    this.noLobbies = 1
    /** @type {0|1} */
    this.moreToCome = 0

    this.lobbyList = new LobbyInfoPacket()
    // this.dataLength = 572;
    this.dataLength = this.lobbyList.toPacket().length + 5

    this.data = Buffer.alloc(this.dataLength)
    this.data.writeInt16LE(this.msgNo, 0)
    this.data.writeInt16LE(this.noLobbies, 2)
    this.data.writeInt8(this.moreToCome, 4)
    this.lobbyList.toPacket().copy(this.data, 5)
  }

  /**
   *
   * @return {Buffer}
   */
  serialize (): Buffer {
    return this.data
  }

  /**
   * dumpPacket
   */
  dumpPacket (): void {
    debug('mcoserver:LobbyMsg')(
      'LobbyMsg',
      {
        msgNo: this.msgNo,
        dataLength: this.dataLength,
        packet: this.serialize().toString('hex')
      }
    )
  }
}
