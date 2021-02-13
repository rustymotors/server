// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { logger } = require('../../shared/logger')

/**
 *
 *
 * @class ClientConnectMsg
 */
class ClientConnectMsg {
  /**
   *
   * @param {Buffer} buffer
   */
  constructor (buffer) {
    this.logger = logger.child({ service: 'mcoserver:ClientConnectMsg' })

    try {
      this.msgNo = buffer.readInt16LE(0)
    } catch (error) {
      if (error instanceof RangeError) {
        // This is likeley not an MCOTS packet, ignore
        this.msgNo = 0
      } else {
        throw new Error(
          `[ClientConnectMsg] Unable to read msgNo from ${buffer.toString(
            'hex'
          )}: ${error}`
        )
      }
    }

    this.personaId = buffer.readInt32LE(6)

    // Set the appId to the Persona Id
    this.appId = this.personaId

    this.customerId = buffer.readInt32LE(2)
    this.custName = buffer.slice(10, 41).toString()
    this.personaName = buffer.slice(42, 73).toString()
    this.mcVersion = buffer.slice(74)
    return this
  }

  /**
   *
   * @return {number}
   */
  getAppId () {
    return this.appId
  }

  /**
   * dumpPacket
   */
  dumpPacket () {
    this.logger.info(
      'ClientConnectMsg',
      {
        msgNo: this.msgNo.toString(),
        customerId: this.customerId.toString(),
        personaId: this.personaId.toString(),
        custName: this.custName,
        personaName: this.personaName,
        mcVersion: this.mcVersion.toString('hex')
      }
    )
  }
}

module.exports = { ClientConnectMsg }
